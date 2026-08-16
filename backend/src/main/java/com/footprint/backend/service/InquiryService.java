package com.footprint.backend.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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

    private User findUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "로그인한 사용자를 찾을 수 없습니다."
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