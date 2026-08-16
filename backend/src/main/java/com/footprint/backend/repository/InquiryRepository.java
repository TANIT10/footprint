package com.footprint.backend.repository;

import java.util.List;

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

    long countByUserUsernameAndSenderAndReadFalse(
            String username,
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
}