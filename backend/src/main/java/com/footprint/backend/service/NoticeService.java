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
import com.footprint.backend.entity.NotificationType;
import com.footprint.backend.entity.User;
import com.footprint.backend.entity.UserRole;
import com.footprint.backend.repository.NoticeRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class NoticeService {

    private static final int NOTICE_PAGE_SIZE = 20;

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public NoticeService(
            NoticeRepository noticeRepository,
            UserRepository userRepository,
            NotificationService notificationService
    ) {
        this.noticeRepository = noticeRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public NoticePageResponse getNotices(int page) {
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
                noticePage.getContent()
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

    public NoticeResponse getNotice(Long noticeId) {
        Notice notice = findNotice(noticeId);

        return toResponse(notice);
    }

    @Transactional
    public NoticeResponse createNotice(
            String username,
            NoticeCreateRequest request
    ) {
        User author = userRepository
                .findByUsername(username)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.UNAUTHORIZED,
                                "로그인한 사용자를 "
                                + "찾을 수 없습니다."
                        )
                );

        Notice notice = new Notice();
        notice.setAuthor(author);
        notice.setTitle(request.title().trim());
        notice.setContent(request.content().trim());
        notice.setImportant(request.important());

        Notice savedNotice =
                noticeRepository.save(notice);

        List<User> recipients =
                userRepository.findByRole(
                        UserRole.USER
                );

        String label = savedNotice.isImportant()
                ? "중요 공지"
                : "공지";

        recipients.forEach(recipient ->
                notificationService.createNotification(
                        recipient,
                        NotificationType.NOTICE,
                        "새 공지가 등록됐어요",
                        savedNotice.getTitle(),
                        label,
                        null,
                        savedNotice.getId()
                )
        );

        return toResponse(savedNotice);
    }

    @Transactional
    public NoticeResponse updateNotice(
            Long noticeId,
            NoticeUpdateRequest request
    ) {
        Notice notice = findNotice(noticeId);

        notice.setTitle(request.title().trim());
        notice.setContent(request.content().trim());
        notice.setImportant(request.important());

        return toResponse(notice);
    }

    @Transactional
    public void deleteNotice(Long noticeId) {
        Notice notice = findNotice(noticeId);

        noticeRepository.delete(notice);
    }

    private Notice findNotice(Long noticeId) {
        return noticeRepository.findById(noticeId)
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "공지사항을 찾을 수 없습니다."
                        )
                );
    }

    private NoticeListItemResponse toListItemResponse(
            Notice notice
    ) {
        return new NoticeListItemResponse(
                notice.getId(),
                notice.getTitle(),
                notice.isImportant(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }

    private NoticeResponse toResponse(
            Notice notice
    ) {
        return new NoticeResponse(
                notice.getId(),
                notice.getTitle(),
                notice.getContent(),
                notice.isImportant(),
                notice.getCreatedAt(),
                notice.getUpdatedAt()
        );
    }
}