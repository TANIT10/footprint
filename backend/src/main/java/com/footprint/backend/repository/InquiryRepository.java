package com.footprint.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.footprint.backend.entity.Inquiry;
import com.footprint.backend.entity.InquirySender;

public interface InquiryRepository
        extends JpaRepository<Inquiry, Long> {

    List<Inquiry> findByUserUsernameOrderByCreatedAtAsc(
            String username
    );

    List<Inquiry> findByUserIdOrderByCreatedAtAsc(
            Long userId
    );

    Optional<Inquiry> findTopByUserIdOrderByCreatedAtDesc(
            Long userId
    );

    long countByUserUsernameAndSenderAndReadFalse(
            String username,
            InquirySender sender
    );

    long countByUserIdAndSenderAndReadFalse(
            Long userId,
            InquirySender sender
    );

    @Query(
            value = """
                    select inquiry.user.id
                    from Inquiry inquiry
                    group by inquiry.user.id
                    order by max(inquiry.createdAt) desc
                    """,
            countQuery = """
                    select count(distinct inquiry.user.id)
                    from Inquiry inquiry
                    """
    )
    Page<Long> findConversationUserIds(
            Pageable pageable
    );

        /*
     * 회원 탈퇴 전용
     * 해당 사용자의 문의 내역 전체 삭제
     */
    void deleteByUserId(
            Long userId
    );
}