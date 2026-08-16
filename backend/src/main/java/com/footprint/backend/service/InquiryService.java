package com.footprint.backend.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.footprint.backend.dto.InquiryConversationPageResponse;
import com.footprint.backend.dto.InquiryConversationResponse;
import com.footprint.backend.dto.InquiryMessageCreateRequest;
import com.footprint.backend.dto.InquiryMessageResponse;
import com.footprint.backend.entity.Inquiry;
import com.footprint.backend.entity.InquirySender;
import com.footprint.backend.entity.User;
import com.footprint.backend.repository.InquiryRepository;
import com.footprint.backend.repository.UserRepository;

@Service
@Transactional(readOnly = true)
public class InquiryService {

    private static final int CONVERSATION_PAGE_SIZE = 20;

    private final InquiryRepository inquiryRepository;
    private final UserRepository userRepository;

    public InquiryService(
            InquiryRepository inquiryRepository,
            UserRepository userRepository
    ) {
        this.inquiryRepository = inquiryRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public InquiryMessageResponse sendUserMessage(
            String username,
            InquiryMessageCreateRequest request
    ) {
        User user = findUser(username);

        Inquiry inquiry = new Inquiry();
        inquiry.setUser(user);
        inquiry.setSender(InquirySender.USER);
        inquiry.setContent(request.content().trim());

        Inquiry savedInquiry =
                inquiryRepository.save(inquiry);

        return toMessageResponse(savedInquiry);
    }

    @Transactional
    public List<InquiryMessageResponse> getUserMessages(
            String username
    ) {
        List<Inquiry> inquiries =
                inquiryRepository
                        .findByUserUsernameOrderByCreatedAtAsc(
                                username
                        );

        inquiries.stream()
                .filter(inquiry ->
                        inquiry.getSender()
                                == InquirySender.ADMIN
                )
                .filter(inquiry -> !inquiry.isRead())
                .forEach(Inquiry::markAsRead);

        return inquiries.stream()
                .map(this::toMessageResponse)
                .toList();
    }

    public InquiryConversationPageResponse
            getAdminConversations(int page) {
        if (page < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "페이지 번호는 0 이상이어야 합니다."
            );
        }

        Page<Long> userIdPage =
                inquiryRepository.findConversationUserIds(
                        PageRequest.of(
                                page,
                                CONVERSATION_PAGE_SIZE
                        )
                );

        List<InquiryConversationResponse> conversations =
                userIdPage.getContent()
                        .stream()
                        .map(this::toConversationResponse)
                        .toList();

        return new InquiryConversationPageResponse(
                conversations,
                userIdPage.getNumber(),
                userIdPage.getTotalPages(),
                userIdPage.getTotalElements(),
                userIdPage.isFirst(),
                userIdPage.isLast()
        );
    }

    @Transactional
    public List<InquiryMessageResponse> getAdminMessages(
            Long userId
    ) {
        findUser(userId);

        List<Inquiry> inquiries =
                inquiryRepository
                        .findByUserIdOrderByCreatedAtAsc(
                                userId
                        );

        if (inquiries.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "문의방을 찾을 수 없습니다."
            );
        }

        inquiries.stream()
                .filter(inquiry ->
                        inquiry.getSender()
                                == InquirySender.USER
                )
                .filter(inquiry -> !inquiry.isRead())
                .forEach(Inquiry::markAsRead);

        return inquiries.stream()
                .map(this::toMessageResponse)
                .toList();
    }

    @Transactional
    public InquiryMessageResponse sendAdminMessage(
            Long userId,
            InquiryMessageCreateRequest request
    ) {
        User user = findUser(userId);

        inquiryRepository
                .findTopByUserIdOrderByCreatedAtDesc(
                        userId
                )
                .orElseThrow(() ->
                        new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "문의방을 찾을 수 없습니다."
                        )
                );

        Inquiry inquiry = new Inquiry();
        inquiry.setUser(user);
        inquiry.setSender(InquirySender.ADMIN);
        inquiry.setContent(request.content().trim());

        Inquiry savedInquiry =
                inquiryRepository.save(inquiry);

        return toMessageResponse(savedInquiry);
    }

    private InquiryConversationResponse
            toConversationResponse(Long userId) {
        User user = findUser(userId);

        Inquiry lastMessage =
                inquiryRepository
                        .findTopByUserIdOrderByCreatedAtDesc(
                                userId
                        )
                        .orElseThrow(() ->
                                new ResponseStatusException(
                                        HttpStatus.NOT_FOUND,
                                        "문의 메시지를 찾을 수 없습니다."
                                )
                        );

        long unreadCount =
                inquiryRepository
                        .countByUserIdAndSenderAndReadFalse(
                                userId,
                                InquirySender.USER
                        );

        return new InquiryConversationResponse(
                user.getId(),
                user.getUsername(),
                user.getNickname(),
                lastMessage.getContent(),
                lastMessage.getSender(),
                lastMessage.getCreatedAt(),
                unreadCount
        );
    }

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "로그인한 사용자를 찾을 수 없습니다."
                ));
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "사용자를 찾을 수 없습니다."
                ));
    }

    private InquiryMessageResponse toMessageResponse(
            Inquiry inquiry
    ) {
        return new InquiryMessageResponse(
                inquiry.getId(),
                inquiry.getContent(),
                inquiry.getSender(),
                inquiry.isRead(),
                inquiry.getReadAt(),
                inquiry.getCreatedAt()
        );
    }
}