package com.footprint.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NoticeUpdateRequest(

        @NotBlank(message = "공지사항 제목을 입력해 주세요.")
        @Size(max = 200, message = "공지사항 제목은 200자 이하여야 합니다.")
        String title,

        @NotBlank(message = "공지사항 내용을 입력해 주세요.")
        String content,

        boolean important
) {
}