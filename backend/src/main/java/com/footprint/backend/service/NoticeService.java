package com.footprint.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.NoticeCreateRequest;
import com.footprint.backend.dto.NoticeListItemResponse;
import com.footprint.backend.dto.NoticePageResponse;
import com.footprint.backend.dto.NoticeResponse;
import com.footprint.backend.dto.NoticeUpdateRequest;
import com.footprint.backend.entity.Notice;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.NoticeRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    private static final int NOTICE_PAGE_SIZE = 20;
    private static final int SUMMARY_MAX_LENGTH = 60;

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    public NoticeService(
            NoticeRepository noticeRepository,
            UserRepository userRepository
    ) {
        this.noticeRepository =
                noticeRepository;

        this.userRepository =
                userRepository;
    }

    /*
     * ==========================================
     * 공지사항 목록 조회
     * ==========================================
     */
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
                        .map(
                                this::toListItemResponse
                        )
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

    /*
     * ==========================================
     * 공지사항 상세 조회
     * ==========================================
     */
    public NoticeResponse getNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(
                        noticeId
                );

        return toResponse(
                notice
        );
    }

    /*
     * ==========================================
     * 대표 공지 조회
     * ==========================================
     *
     * 대표 공지가 없는 경우에는
     * null을 반환합니다.
     *
     * 프론트에서는 null일 경우
     * 상단 공지 배너를 숨기면 됩니다.
     */
    public NoticeResponse getFeaturedNotice() {

        return noticeRepository
                .findFirstByFeaturedTrue()
                .map(
                        this::toResponse
                )
                .orElse(
                        null
                );
    }

    /*
     * ==========================================
     * 관리자 공지사항 작성
     * ==========================================
     */
    @Transactional
    public NoticeResponse createNotice(
            String username,
            NoticeCreateRequest request
    ) {
        User author =
                userRepository
                        .findByUsername(
                                username
                        )
                        .orElseThrow(
                                () ->
                                        new ResponseStatusException(
                                                HttpStatus.UNAUTHORIZED,
                                                "로그인한 사용자를 찾을 수 없습니다."
                                        )
                        );

        Notice notice =
                new Notice();

        notice.setAuthor(
                author
        );

        notice.setTitle(
                request
                        .title()
                        .trim()
        );

        notice.setContent(
                request
                        .content()
                        .trim()
        );

        notice.setImportant(
                request
                        .important()
        );

        /*
         * 새 공지는 자동으로
         * 대표 공지가 되지 않습니다.
         */
        notice.setFeatured(
                false
        );

        Notice savedNotice =
                noticeRepository
                        .save(
                                notice
                        );

        return toResponse(
                savedNotice
        );
    }

    /*
     * ==========================================
     * 관리자 공지사항 수정
     * ==========================================
     */
    @Transactional
    public NoticeResponse updateNotice(
            Long noticeId,
            NoticeUpdateRequest request
    ) {
        Notice notice =
                findNotice(
                        noticeId
                );

        notice.setTitle(
                request
                        .title()
                        .trim()
        );

        notice.setContent(
                request
                        .content()
                        .trim()
        );

        notice.setImportant(
                request
                        .important()
        );

        /*
         * 공지 수정 시 대표 여부는
         * 그대로 유지합니다.
         */
        return toResponse(
                notice
        );
    }

    /*
     * ==========================================
     * 대표 공지 설정
     * ==========================================
     *
     * 기존 대표 공지를 모두 해제한 뒤
     * 선택한 공지만 대표로 지정합니다.
     */
    @Transactional
    public NoticeResponse setFeaturedNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(
                        noticeId
                );

        noticeRepository
                .clearFeatured();

        notice.setFeatured(
                true
        );

        return toResponse(
                notice
        );
    }

    /*
     * ==========================================
     * 대표 공지 해제
     * ==========================================
     */
    @Transactional
    public void clearFeaturedNotice() {

        noticeRepository
                .clearFeatured();
    }

    /*
     * ==========================================
     * 공지사항 삭제
     * ==========================================
     */
    @Transactional
    public void deleteNotice(
            Long noticeId
    ) {
        Notice notice =
                findNotice(
                        noticeId
                );

        noticeRepository
                .delete(
                        notice
                );
    }

    /*
     * ==========================================
     * 공지사항 찾기
     * ==========================================
     */
    private Notice findNotice(
            Long noticeId
    ) {
        return noticeRepository
                .findById(
                        noticeId
                )
                .orElseThrow(
                        () ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "공지사항을 찾을 수 없습니다."
                                )
                );
    }

    /*
     * ==========================================
     * 공지 목록 응답 변환
     * ==========================================
     */
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

    /*
     * ==========================================
     * 공지 상세 응답 변환
     * ==========================================
     */
    private NoticeResponse toResponse(
            Notice notice
    ) {
        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.isImportant(),
                notice.isFeatured(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }

    /*
     * ==========================================
     * 공지 목록용 요약문 생성
     * ==========================================
     */
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