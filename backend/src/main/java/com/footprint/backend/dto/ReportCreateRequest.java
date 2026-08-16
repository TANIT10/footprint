package com.footprint.backend.dto;

import com.footprint.backend.entity.ReportReason;
import com.footprint.backend.entity.ReportTargetType;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ReportCreateRequest(

        @NotNull(message = "신고 대상 종류를 선택해 주세요.")
        ReportTargetType targetType,

        @NotNull(message = "신고 대상 ID를 입력해 주세요.")
        @Positive(message = "신고 대상 ID는 1 이상이어야 합니다.")
        Long targetId,

        @NotNull(message = "신고 사유를 선택해 주세요.")
        ReportReason reason,

        @Size(
                max = 1000,
                message = "신고 상세 내용은 1000자 이하여야 합니다."
        )
        String description
) {
}