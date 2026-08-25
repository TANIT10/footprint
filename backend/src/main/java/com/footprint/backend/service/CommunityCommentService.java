package com.footprint.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.footprint.backend.dto.CommunityCommentRequest;
import com.footprint.backend.dto.CommunityCommentResponse;
import com.footprint.backend.entity.CommunityComment;
import com.footprint.backend.entity.CommunityPost;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.CommunityCommentRepository;
import com.footprint.backend.repository.CommunityPostRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional
public class CommunityCommentService {

    private final CommunityCommentRepository
            communityCommentRepository;

    private final CommunityPostRepository
            communityPostRepository;

    private final UserRepository
            userRepository;

    private final NotificationService
            notificationService;

    public CommunityCommentService(
            CommunityCommentRepository
                    communityCommentRepository,
            CommunityPostRepository
                    communityPostRepository,
            UserRepository
                    userRepository,
            NotificationService
                    notificationService
    ) {
        this.communityCommentRepository =
                communityCommentRepository;

        this.communityPostRepository =
                communityPostRepository;

        this.userRepository =
                userRepository;

        this.notificationService =
                notificationService;
    }

    /*
     * 커뮤니티 댓글 목록 조회
     *
     * 로그인 사용자가 차단한 사용자의 댓글은
     * DB 조회 단계에서 제외합니다.
     */
    @Transactional(readOnly = true)
    public List<CommunityCommentResponse>
    getComments(
            String username,
            Long postId
    ) {

        User currentUser =
                findCurrentUserOptional(
                        username
                );

        List<CommunityComment> comments;

        if (
                username != null &&
                !username.isBlank()
        ) {

            comments =
                    communityCommentRepository
                            .findVisibleComments(
                                    postId,
                                    username
                            );

        } else {

            comments =
                    communityCommentRepository
                            .findByCommunityPostIdOrderByCreatedAtAsc(
                                    postId
                            );
        }

        return comments
                .stream()
                .map(
                        comment ->
                                toResponse(
                                        comment,
                                        currentUser
                                )
                )
                .toList();
    }

    /*
     * 커뮤니티 댓글 작성
     */
    public CommunityCommentResponse createComment(
            String username,
            Long postId,
            CommunityCommentRequest request
    ) {

        if (
                request == null ||
                request.getContent() == null ||
                request.getContent().isBlank()
        ) {
            throw new IllegalArgumentException(
                    "댓글 내용을 입력해 주세요."
            );
        }

        String content =
                request
                        .getContent()
                        .trim();

        if (
                content.length() > 1000
        ) {
            throw new IllegalArgumentException(
                    "댓글은 1000자 이하로 입력해 주세요."
            );
        }

        User author =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "사용자 정보를 찾을 수 없습니다."
                                        )
                        );

        validateCommunityWriteAccess(
                author
        );

        CommunityPost communityPost =
                communityPostRepository
                        .findById(
                                postId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "커뮤니티 게시글을 찾을 수 없습니다."
                                        )
                        );

        CommunityComment comment =
                new CommunityComment();

        comment.setCommunityPost(
                communityPost
        );

        comment.setAuthor(
                author
        );

        comment.setContent(
                content
        );

        CommunityComment savedComment =
                communityCommentRepository
                        .save(
                                comment
                        );

        /*
         * 커뮤니티 댓글 알림
         *
         * 자기 글에 자기가 댓글을 작성한 경우에는
         * NotificationService 내부에서
         * 자동으로 제외됩니다.
         */
        User postAuthor =
                communityPost.getAuthor();

        notificationService
                .createCommunityCommentNotification(
                        postAuthor,
                        author,
                        communityPost.getId()
                );

        return toResponse(
                savedComment,
                author
        );
    }

    /*
     * 커뮤니티 댓글 삭제
     *
     * 본인이 작성한 댓글만 삭제 가능
     */
    public void deleteComment(
            String username,
            Long commentId
    ) {

        CommunityComment comment =
                communityCommentRepository
                        .findById(
                                commentId
                        )
                        .orElseThrow(
                                () ->
                                        new IllegalArgumentException(
                                                "댓글을 찾을 수 없습니다."
                                        )
                        );

        User author =
                comment.getAuthor();

        if (
                author == null ||
                !author.getUsername()
                        .equals(
                                username
                        )
        ) {
            throw new IllegalArgumentException(
                    "본인이 작성한 댓글만 삭제할 수 있습니다."
            );
        }

        communityCommentRepository
                .delete(
                        comment
                );
    }

    /*
     * ==========================================
     * 커뮤니티 작성 권한 확인
     * ==========================================
     *
     * 관리자에 의해 기간 정지된 사용자는
     * 커뮤니티 댓글을 작성할 수 없습니다.
     */
    private void validateCommunityWriteAccess(
            User user
    ) {

        if (
                user != null &&
                user.isCommunitySuspended()
        ) {

            String suspendedUntil =
                    user
                            .getCommunitySuspendedUntil()
                            .toString();

            throw new IllegalArgumentException(
                    "커뮤니티 이용이 "
                    + suspendedUntil
                    + "까지 정지되어 있습니다."
            );
        }
    }

    private User findCurrentUserOptional(
            String username
    ) {

        if (
                username == null ||
                username.isBlank()
        ) {
            return null;
        }

        return userRepository
                .findByUsername(
                        username
                )
                .orElse(
                        null
                );
    }

    private CommunityCommentResponse toResponse(
            CommunityComment comment,
            User currentUser
    ) {

        CommunityCommentResponse response =
                new CommunityCommentResponse();

        response.setId(
                comment.getId()
        );

        response.setContent(
                comment.getContent()
        );

        response.setCreatedAt(
                comment.getCreatedAt()
        );

        User author =
                comment.getAuthor();

        if (author != null) {

            response.setAuthorUsername(
                    author.getUsername()
            );

            response.setAuthorNickname(
                    author.getNickname()
            );

            response.setAuthorProfileImageUrl(
                    author.getProfileImageUrl()
            );
        }

        boolean deletable =
                currentUser != null &&
                author != null &&
                currentUser.getId()
                        .equals(
                                author.getId()
                        );

        response.setDeletable(
                deletable
        );

        return response;
    }
}
