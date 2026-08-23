package com.footprint.backend.service;

import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.entity.AiMatchCandidateStatus;
import com.footprint.backend.entity.Post;
import com.footprint.backend.entity.PostImage;
import com.footprint.backend.entity.PostType;
import com.footprint.backend.repository.AiMatchCandidateStatusRepository;
import com.footprint.backend.repository.PostImageRepository;
import com.footprint.backend.repository.PostRepository;

@Service
public class PostMatchService {

    /*
     * 닮은 발자국 페이지에 보여줄
     * 최소 이미지 특징 유사도 점수.
     */
    private static final double
            VISIBLE_MATCH_THRESHOLD = 60.0;

    /*
     * 확인 요망 + AI_MATCH 알림 기준.
     */
    private static final double
            ATTENTION_MATCH_THRESHOLD = 70.0;

    private final PostRepository
            postRepository;

    private final PostImageRepository
            postImageRepository;

    private final PostImageService
            postImageService;

    private final AiMatchService
            aiMatchService;

    private final AiMatchCandidateStatusRepository
            aiMatchCandidateStatusRepository;

    private final NotificationService
            notificationService;

    public PostMatchService(
            PostRepository postRepository,
            PostImageRepository postImageRepository,
            PostImageService postImageService,
            AiMatchService aiMatchService,
            AiMatchCandidateStatusRepository
                    aiMatchCandidateStatusRepository,
            NotificationService notificationService
    ) {
        this.postRepository =
                postRepository;

        this.postImageRepository =
                postImageRepository;

        this.postImageService =
                postImageService;

        this.aiMatchService =
                aiMatchService;

        this.aiMatchCandidateStatusRepository =
                aiMatchCandidateStatusRepository;

        this.notificationService =
                notificationService;
    }

    /*
     * =========================================================
     * 닮은 발자국 페이지 조회
     * =========================================================
     *
     * 중요:
     *
     * 예전에는 이 메서드를 호출할 때마다
     * 모든 봤어요 게시글과 AI 비교를 다시 했다.
     *
     * 이제는 AI를 절대 다시 실행하지 않는다.
     *
     * 이미 저장된
     * AiMatchCandidateStatus만 읽어서 반환한다.
     *
     * 따라서 닮은 발자국 페이지 진입 속도가
     * 훨씬 빨라진다.
     */
    @Transactional(readOnly = true)
    public List<Map<String, Object>>
            findSimilarSightedPosts(
                    Long missingPostId
            ) {

        Post missingPost =
                postRepository
                        .findById(
                                missingPostId
                        )
                        .orElseThrow(() ->
                                new IllegalArgumentException(
                                        "게시글을 찾을 수 없습니다."
                                )
                        );

        if (
                missingPost.getPostType()
                        != PostType.MISSING
        ) {
            throw new IllegalArgumentException(
                    "찾아요 게시글만 "
                            + "매칭 결과를 조회할 수 있습니다."
            );
        }

        String username =
                missingPost
                        .getAuthor()
                        .getUsername();

        List<AiMatchCandidateStatus> statuses =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndMissingPostIdOrderByFirstDetectedAtDesc(
                                username,
                                missingPostId
                        );

        List<Map<String, Object>> results =
                new ArrayList<>();

        for (
                AiMatchCandidateStatus status
                : statuses
        ) {

            double combinedScore =
                    status.getCombinedScore();

            /*
             * 안전하게 60 미만 데이터는
             * 화면에서 제외한다.
             */
            if (
                    combinedScore
                            < VISIBLE_MATCH_THRESHOLD
            ) {
                continue;
            }

            Post sightedPost =
                    postRepository
                            .findById(
                                    status.getSightedPostId()
                            )
                            .orElse(null);

            /*
             * 후보 게시글이 삭제됐다면
             * 화면에 보여주지 않는다.
             */
            if (sightedPost == null) {
                continue;
            }

            /*
             * 혹시 게시글 타입이 변경됐을 경우에도
             * SIGHTED만 후보로 사용한다.
             */
            if (
                    sightedPost.getPostType()
                            != PostType.SIGHTED
            ) {
                continue;
            }

            Map<String, Object> result =
                    new HashMap<>();

            result.put(
                    "postId",
                    sightedPost.getId()
            );

            result.put(
                    "breed",
                    sightedPost.getBreed()
            );

            result.put(
                    "location",
                    sightedPost.getLocation()
            );

            result.put(
                    "date",
                    sightedPost.getDate() != null
                            ? sightedPost
                                    .getDate()
                                    .toString()
                            : null
            );

            result.put(
                    "createdAt",
                    sightedPost.getCreatedAt()
            );

            result.put(
                    "combined_score",
                    combinedScore
            );

            result.put(
                    "requiresAttention",
                    combinedScore
                            >= ATTENTION_MATCH_THRESHOLD
            );

            /*
             * 어떤 후보가 아직 새 후보인지
             * 프론트에서도 알 수 있도록 내려준다.
             *
             * 후보를 눌렀을 때
             * NEW를 즉시 지우는 데 사용한다.
             */
            result.put(
                    "newCandidate",
                    status.isNewCandidate()
            );

            result.put(
                    "representativeImage",
                    getRepresentativeImage(
                            sightedPost.getId()
                    )
            );

            results.add(
                    result
            );
        }

        /*
         * 우선 서버에서는 점수 높은 순서로 반환.
         *
         * 실제 UI에서는 프론트가
         * 확인 요망 우선 + 최신순으로 정리한다.
         */
        results.sort(
                Comparator
                        .comparingDouble(
                                this::getCombinedScore
                        )
                        .reversed()
        );

        return results;
    }

    /*
     * =========================================================
     * 새 게시글 등록 후 실행하는 AI 매칭
     * =========================================================
     *
     * PostService에서 게시글 저장이 끝난 뒤
     * 백그라운드로 호출할 메서드.
     */
    @Transactional
    public void processNewPost(
            Long newPostId
    ) {

        Post newPost =
                postRepository
                        .findById(
                                newPostId
                        )
                        .orElse(null);

        if (newPost == null) {
            return;
        }

        if (
                newPost.getPostType()
                        == PostType.SIGHTED
        ) {
            processNewSightedPost(
                    newPost
            );

            return;
        }

        if (
                newPost.getPostType()
                        == PostType.MISSING
        ) {
            processNewMissingPost(
                    newPost
            );
        }
    }

    /*
     * 새로운 봤어요 게시글 1개가 등록되었을 때
     *
     * 기존 모든 찾아요 게시글과 비교한다.
     *
     * 핵심:
     * 이미 있던 봤어요 글 전체를 다시 분석하지 않는다.
     */
    private void processNewSightedPost(
            Post sightedPost
    ) {

        List<Path> sightedImagePaths =
                getOptionalImagePaths(
                        sightedPost.getId()
                );

        /*
         * 사진이 없는 봤어요 게시글은
         * 이미지 AI 비교 불가.
         */
        if (
                sightedImagePaths.isEmpty()
        ) {
            return;
        }

        List<Post> missingPosts =
                postRepository
                        .findByPostTypeOrderByCreatedAtDesc(
                                PostType.MISSING
                        );

        for (
                Post missingPost
                : missingPosts
        ) {

            try {
                compareAndSave(
                        missingPost,
                        sightedPost,
                        null,
                        sightedImagePaths
                );
            } catch (RuntimeException exception) {
                /*
                 * 한 게시글 비교가 실패했다고 해서
                 * 다른 찾아요 게시글 비교까지
                 * 전부 중단하지 않는다.
                 */
                System.err.println(
                        "[AI MATCH] 비교 실패"
                                + " / missingPostId="
                                + missingPost.getId()
                                + " / sightedPostId="
                                + sightedPost.getId()
                                + " / "
                                + exception.getMessage()
                );
            }
        }
    }

    /*
     * 새로운 찾아요 게시글 1개가 등록되었을 때
     *
     * 기존 봤어요 게시글들과 비교한다.
     *
     * 사용자가 새로운 아이를 찾기 시작했을 때도
     * 기존 제보 중 닮은 후보가 있으면
     * 바로 닮은 발자국에 들어가도록 한다.
     */
    private void processNewMissingPost(
            Post missingPost
    ) {

        List<Path> missingImagePaths =
                getOptionalImagePaths(
                        missingPost.getId()
                );

        if (
                missingImagePaths.isEmpty()
        ) {
            return;
        }

        List<Post> sightedPosts =
                postRepository
                        .findByPostTypeOrderByCreatedAtDesc(
                                PostType.SIGHTED
                        );

        for (
                Post sightedPost
                : sightedPosts
        ) {

            try {
                compareAndSave(
                        missingPost,
                        sightedPost,
                        missingImagePaths,
                        null
                );
            } catch (RuntimeException exception) {
                System.err.println(
                        "[AI MATCH] 비교 실패"
                                + " / missingPostId="
                                + missingPost.getId()
                                + " / sightedPostId="
                                + sightedPost.getId()
                                + " / "
                                + exception.getMessage()
                );
            }
        }
    }

    /*
     * 실제 MISSING ↔ SIGHTED 한 조합 비교.
     */
    private void compareAndSave(
            Post missingPost,
            Post sightedPost,
            List<Path> preparedMissingImagePaths,
            List<Path> preparedSightedImagePaths
    ) {

        List<Path> missingImagePaths =
                preparedMissingImagePaths;

        if (
                missingImagePaths == null
        ) {
            missingImagePaths =
                    getOptionalImagePaths(
                            missingPost.getId()
                    );
        }

        if (
                missingImagePaths.isEmpty()
        ) {
            return;
        }

        List<Path> sightedImagePaths =
                preparedSightedImagePaths;

        if (
                sightedImagePaths == null
        ) {
            sightedImagePaths =
                    getOptionalImagePaths(
                            sightedPost.getId()
                    );
        }

        if (
                sightedImagePaths.isEmpty()
        ) {
            return;
        }

        Map<String, Object> aiResult =
                aiMatchService
                        .comparePosts(
                                missingImagePaths,
                                sightedImagePaths
                        );

        double combinedScore =
                getCombinedScore(
                        aiResult
                );

        /*
         * 60 미만은 후보로 저장하지 않는다.
         */
        if (
                combinedScore
                        < VISIBLE_MATCH_THRESHOLD
        ) {
            return;
        }

        /*
         * 60 이상
         *
         * → 닮은 발자국 후보 DB 저장
         * → 처음 발견된 후보는 NEW=true
         */
        saveOrUpdateCandidateStatus(
                missingPost,
                sightedPost,
                combinedScore
        );

        /*
         * 70 이상
         *
         * → 닮은 발자국 후보
         * → NEW
         * → AI_MATCH 알림
         *
         * NotificationService에서
         * 같은 사용자 + 같은 봤어요 글의
         * 중복 알림은 막아준다.
         *
         * 따라서 새로운 봤어요 게시글 ID라면
         * 다시 새로운 알림이 생성된다.
         */
        if (
                combinedScore
                        >= ATTENTION_MATCH_THRESHOLD
        ) {
            notificationService
                    .createAiMatchNotificationIfAbsent(
                            missingPost.getAuthor(),
                            sightedPost.getId()
                    );
        }
    }

    /*
     * 60 이상 후보의 상태 저장.
     */
    private void saveOrUpdateCandidateStatus(
            Post missingPost,
            Post sightedPost,
            double combinedScore
    ) {

        String username =
                missingPost
                        .getAuthor()
                        .getUsername();

        AiMatchCandidateStatus status =
                aiMatchCandidateStatusRepository
                        .findByUsernameAndMissingPostIdAndSightedPostId(
                                username,
                                missingPost.getId(),
                                sightedPost.getId()
                        )
                        .orElse(null);

        /*
         * 처음 발견된 조합.
         *
         * NEW=true
         */
        if (status == null) {

            AiMatchCandidateStatus newStatus =
                    new AiMatchCandidateStatus();

            newStatus.setUsername(
                    username
            );

            newStatus.setMissingPostId(
                    missingPost.getId()
            );

            newStatus.setSightedPostId(
                    sightedPost.getId()
            );

            newStatus.setCombinedScore(
                    combinedScore
            );

            newStatus.setNewCandidate(
                    true
            );

            aiMatchCandidateStatusRepository
                    .save(
                            newStatus
                    );

            return;
        }

        /*
         * 이미 존재하는 조합.
         *
         * 점수만 갱신하고
         * 사용자가 이미 확인한 NEW를
         * 다시 true로 되살리지 않는다.
         */
        status.updateMatch(
                combinedScore
        );
    }

    /*
     * 대표 이미지 1장 조회.
     *
     * 프론트가 후보마다
     * /api/posts/{id}를 다시 호출하지 않아도
     * 카드 이미지를 바로 표시할 수 있게 한다.
     */
    private String getRepresentativeImage(
            Long postId
    ) {

        List<PostImage> postImages =
                postImageRepository
                        .findByPostIdOrderByDisplayOrderAsc(
                                postId
                        );

        if (
                postImages.isEmpty()
        ) {
            return "";
        }

        return postImages
                .get(0)
                .getImageUrl();
    }

    private List<Path>
            getOptionalImagePaths(
                    Long postId
            ) {

        List<PostImage> postImages =
                postImageRepository
                        .findByPostIdOrderByDisplayOrderAsc(
                                postId
                        );

        if (
                postImages.isEmpty()
        ) {
            return List.of();
        }

        return postImages
                .stream()
                .map(
                        PostImage::getImageUrl
                )
                .map(
                        postImageService
                                ::getImagePath
                )
                .toList();
    }

    private double getCombinedScore(
            Map<String, Object> result
    ) {

        Object score =
                result.get(
                        "combined_score"
                );

        if (
                score instanceof Number number
        ) {
            return number.doubleValue();
        }

        return 0.0;
    }
}