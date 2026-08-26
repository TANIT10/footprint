package com.footprint.backend.service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.NoticeCreateRequest;
import com.footprint.backend.dto.NoticeListItemResponse;
import com.footprint.backend.dto.NoticePageResponse;
import com.footprint.backend.dto.NoticeResponse;
import com.footprint.backend.dto.NoticeUpdateRequest;
import com.footprint.backend.entity.Notice;
import com.footprint.backend.entity.NoticeImage;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.NoticeImageRepository;
import com.footprint.backend.repository.NoticeRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    private static final int NOTICE_PAGE_SIZE = 20;
    private static final int SUMMARY_MAX_LENGTH = 60;
    private static final int MAX_NOTICE_IMAGE_COUNT = 3;

    private final NoticeRepository noticeRepository;
    private final NoticeImageRepository noticeImageRepository;
    private final NoticeImageService noticeImageService;
    private final UserRepository userRepository;

    public NoticeService(
            NoticeRepository noticeRepository,
            NoticeImageRepository noticeImageRepository,
            NoticeImageService noticeImageService,
            UserRepository userRepository
    ) {
        this.noticeRepository = noticeRepository;
        this.noticeImageRepository = noticeImageRepository;
        this.noticeImageService = noticeImageService;
        this.userRepository = userRepository;
    }

    public NoticePageResponse getNotices(
            int page
    ) {
        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }

        Page<Notice> noticePage =
                noticeRepository
                        .findAllByOrderByImportantDescCreatedAtDesc(
                                PageRequest.of(
                                        page,
                                        NOTICE_PAGE_SIZE
                                )
                        );

        List<NoticeListItemResponse> notices =
                noticePage
                        .getContent()
                        .stream()
                        .map(this::toListItemResponse)
                        .toList();

        return new NoticePageResponse(
                notices,
                noticePage.getNumber(),
                noticePage.getTotalPages(),
                noticePage.getTotalElements(),
                noticePage.isFirst(),
                noticePage.isLast()
        );
    }

    public NoticeResponse getNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(noticeId);

        return toResponse(notice);
    }

    public NoticeResponse getFeaturedNotice() {

        return noticeRepository
                .findFirstByFeaturedTrue()
                .map(this::toResponse)
                .orElse(null);
    }

    /*
     * =========================================
     * 공지 작성
     * 사진은 선택 사항 / 최대 3장
     * =========================================
     */
    @Transactional
    public NoticeResponse createNotice(
            String username,
            NoticeCreateRequest request,
            List<MultipartFile> images
    ) {
        User author =
                userRepository
                        .findByUsername(username)
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.UNAUTHORIZED,
                                        "로그인한 사용자를 찾을 수 없습니다."
                                )
                        );

        List<String> savedImageUrls =
                new ArrayList<>();

        try {
            savedImageUrls =
                    noticeImageService
                            .saveOptional(images);

            if (
                    savedImageUrls.size() >
                    MAX_NOTICE_IMAGE_COUNT
            ) {
                throw new IllegalArgumentException(
                        "공지 사진은 최대 3장까지 등록할 수 있습니다."
                );
            }

            Notice notice =
                    new Notice();

            notice.setAuthor(author);

            notice.setTitle(
                    request.title().trim()
            );

            notice.setContent(
                    request.content().trim()
            );

            notice.setImportant(
                    request.important()
            );

            notice.setFeatured(false);

            Notice savedNotice =
                    noticeRepository.save(notice);

            saveNoticeImageEntities(
                    savedNotice,
                    savedImageUrls
            );

            return toResponse(
                    savedNotice
            );

        } catch (RuntimeException exception) {

            /*
             * DB 저장 등에 실패했는데
             * 실제 파일은 이미 저장됐을 경우 정리
             */
            noticeImageService.deleteAll(
                    savedImageUrls
            );

            throw exception;
        }
    }

    /*
     * =========================================
     * 공지 수정
     *
     * existingImageUrls =
     * 수정 후에도 남겨둘 기존 사진
     *
     * newImages =
     * 새로 추가한 사진
     * =========================================
     */
    @Transactional
    public NoticeResponse updateNotice(
            Long noticeId,
            NoticeUpdateRequest request,
            List<String> existingImageUrls,
            List<MultipartFile> newImages
    ) {
        Notice notice =
                findNotice(noticeId);

        List<NoticeImage> currentImages =
                noticeImageRepository
                        .findAllByNoticeIdOrderByDisplayOrderAsc(
                                noticeId
                        );

        List<String> currentImageUrls =
                currentImages
                        .stream()
                        .map(
                                NoticeImage::getImageUrl
                        )
                        .toList();

        List<String> requestedExistingUrls =
                existingImageUrls == null
                        ? new ArrayList<>()
                        : existingImageUrls
                                .stream()
                                .filter(url ->
                                        url != null &&
                                        !url.isBlank()
                                )
                                .toList();

        /*
         * 다른 공지의 이미지 URL을
         * 임의로 끼워 넣을 수 없도록 검증
         */
        Set<String> currentImageUrlSet =
                new HashSet<>(
                        currentImageUrls
                );

        for (
                String existingUrl
                : requestedExistingUrls
        ) {
            if (
                    !currentImageUrlSet
                            .contains(
                                    existingUrl
                            )
            ) {
                throw new IllegalArgumentException(
                        "현재 공지에 등록되지 않은 사진이 포함되어 있습니다."
                );
            }
        }

        int requestedNewImageCount =
                countRealFiles(
                        newImages
                );

        if (
                requestedExistingUrls.size()
                + requestedNewImageCount
                > MAX_NOTICE_IMAGE_COUNT
        ) {
            throw new IllegalArgumentException(
                    "공지 사진은 최대 3장까지 등록할 수 있습니다."
            );
        }

        List<String> newlySavedUrls =
                new ArrayList<>();

        try {
            newlySavedUrls =
                    noticeImageService
                            .saveOptional(
                                    newImages
                            );

            List<String> finalImageUrls =
                    new ArrayList<>();

            finalImageUrls.addAll(
                    requestedExistingUrls
            );

            finalImageUrls.addAll(
                    newlySavedUrls
            );

            notice.setTitle(
                    request.title().trim()
            );

            notice.setContent(
                    request.content().trim()
            );

            notice.setImportant(
                    request.important()
            );

            /*
             * 기존 DB 이미지 관계를 다시 구성
             */
            noticeImageRepository
                    .deleteAllByNoticeId(
                            noticeId
                    );

            saveNoticeImageEntities(
                    notice,
                    finalImageUrls
            );

            /*
             * 수정 화면에서 제거한 기존 사진 확인
             */
            List<String> removedOldImageUrls =
                    currentImageUrls
                            .stream()
                            .filter(url ->
                                    !requestedExistingUrls
                                            .contains(
                                                    url
                                            )
                            )
                            .toList();

            /*
             * DB 관계를 정상적으로 변경한 뒤
             * 더 이상 사용하지 않는 실제 파일 삭제
             */
            noticeImageService.deleteAll(
                    removedOldImageUrls
            );

            return toResponse(
                    notice
            );

        } catch (RuntimeException exception) {

            /*
             * 새로 업로드한 파일만 정리.
             * 기존 사진까지 지우면 안 됨.
             */
            noticeImageService.deleteAll(
                    newlySavedUrls
            );

            throw exception;
        }
    }

    /*
     * =========================================
     * 대표 공지 설정
     * =========================================
     */
    @Transactional
    public NoticeResponse setFeaturedNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(noticeId);

        noticeRepository
                .clearFeatured();

        notice.setFeatured(true);

        return toResponse(notice);
    }

    /*
     * =========================================
     * 대표 공지 해제
     * =========================================
     */
    @Transactional
    public void clearFeaturedNotice() {

        noticeRepository
                .clearFeatured();
    }

    /*
     * =========================================
     * 공지 삭제
     * DB + 실제 이미지 파일 모두 삭제
     * =========================================
     */
    @Transactional
    public void deleteNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(noticeId);

        List<String> imageUrls =
                noticeImageRepository
                        .findAllByNoticeIdOrderByDisplayOrderAsc(
                                noticeId
                        )
                        .stream()
                        .map(
                                NoticeImage::getImageUrl
                        )
                        .toList();

        noticeRepository.delete(
                notice
        );

        noticeImageService.deleteAll(
                imageUrls
        );
    }

    /*
     * =========================================
     * NoticeImage DB 저장
     * =========================================
     */
    private void saveNoticeImageEntities(
            Notice notice,
            List<String> imageUrls
    ) {
        if (
                imageUrls == null ||
                imageUrls.isEmpty()
        ) {
            return;
        }

        List<NoticeImage> noticeImages =
                new ArrayList<>();

        for (
                int index = 0;
                index < imageUrls.size();
                index++
        ) {
            NoticeImage noticeImage =
                    new NoticeImage();

            noticeImage.setNotice(
                    notice
            );

            noticeImage.setImageUrl(
                    imageUrls.get(index)
            );

            noticeImage.setDisplayOrder(
                    index
            );

            noticeImages.add(
                    noticeImage
            );
        }

        noticeImageRepository
                .saveAll(
                        noticeImages
                );
    }

    private int countRealFiles(
            List<MultipartFile> files
    ) {
        if (
                files == null ||
                files.isEmpty()
        ) {
            return 0;
        }

        return (int)
                files
                        .stream()
                        .filter(file ->
                                file != null &&
                                !file.isEmpty()
                        )
                        .count();
    }

    private Notice findNotice(
            Long noticeId
    ) {
        return noticeRepository
                .findById(noticeId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "공지사항을 찾을 수 없습니다."
                        )
                );
    }

    private NoticeListItemResponse
            toListItemResponse(
                    Notice notice
            ) {
        return new NoticeListItemResponse(
                notice.getId(),
                notice.getTitle(),
                createSummary(
                        notice.getContent()
                ),
                notice.isImportant(),
                notice.isFeatured(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }

    private NoticeResponse toResponse(
            Notice notice
    ) {
        List<String> imageUrls =
                noticeImageRepository
                        .findAllByNoticeIdOrderByDisplayOrderAsc(
                                notice.getId()
                        )
                        .stream()
                        .map(
                                NoticeImage::getImageUrl
                        )
                        .toList();

        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.isImportant(),
                notice.isFeatured(),
                imageUrls,
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }

    private String createSummary(
            String content
    ) {
        String normalizedContent =
                content
                        .replaceAll(
                                "\\s+",
                                " "
                        )
                        .trim();

        if (
                normalizedContent.length()
                <= SUMMARY_MAX_LENGTH
        ) {
            return normalizedContent;
        }

        return normalizedContent.substring(
                0,
                SUMMARY_MAX_LENGTH
        ) + "...";
    }
}