package com.footprint.backend.dto;

import com.footprint.backend.entity.ReportStatus;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record ReportHandleRequest(

        @NotNull(message = "신고 처리 상태를 선택해 주세요.")
        ReportStatus status,

        @Size(
                max = 1000,
                message = "관리자 처리 메모는 1000자 이하여야 합니다."
        )
        String adminNote
) {
}