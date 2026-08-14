package com.footprint.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageService {

    private static final long MAXIMUM_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final String PROFILE_URL_PREFIX =
            "/uploads/profiles/";

    private static final Map<String, String>
            ALLOWED_IMAGE_TYPES = Map.of(
                    "image/jpeg", ".jpg",
                    "image/png", ".png",
                    "image/webp", ".webp",
                    "image/gif", ".gif"
            );

    private final Path profileUploadDirectory;

    public ProfileImageService() {

        this.profileUploadDirectory =
                Paths.get(
                        "uploads",
                        "profiles"
                )
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(
                    profileUploadDirectory
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "프로필 사진 저장 폴더를 "
                    + "만들 수 없습니다.",
                    exception
            );
        }
    }

    public String save(
            MultipartFile image) {

        validate(image);

        String contentType =
                image.getContentType();

        String extension =
                ALLOWED_IMAGE_TYPES.get(
                        contentType
                );

        String storedFileName =
                UUID.randomUUID()
                + extension;

        Path destination =
                profileUploadDirectory
                .resolve(storedFileName)
                .normalize();

        if (!destination.startsWith(
                profileUploadDirectory
        )) {
            throw new IllegalArgumentException(
                    "올바르지 않은 파일 경로입니다."
            );
        }

        try {
            Files.copy(
                    image.getInputStream(),
                    destination,
                    StandardCopyOption
                            .REPLACE_EXISTING
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "프로필 사진을 저장하지 "
                    + "못했습니다.",
                    exception
            );
        }

        return PROFILE_URL_PREFIX
                + storedFileName;
    }

    public void delete(
            String imageUrl) {

        if (imageUrl == null
                || imageUrl.isBlank()
                || !imageUrl.startsWith(
                        PROFILE_URL_PREFIX
                )) {
            return;
        }

        String storedFileName =
                imageUrl.substring(
                        PROFILE_URL_PREFIX.length()
                );

        Path target =
                profileUploadDirectory
                .resolve(storedFileName)
                .normalize();

        if (!target.startsWith(
                profileUploadDirectory
        )) {
            return;
        }

        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "이전 프로필 사진을 "
                    + "삭제하지 못했습니다.",
                    exception
            );
        }
    }

    private void validate(
            MultipartFile image) {

        if (image == null || image.isEmpty()) {
            throw new IllegalArgumentException(
                    "프로필 사진을 선택해주세요."
            );
        }

        if (image.getSize()
                > MAXIMUM_FILE_SIZE) {

            throw new IllegalArgumentException(
                    "프로필 사진은 5MB 이하만 "
                    + "업로드할 수 있습니다."
            );
        }

        String contentType =
                image.getContentType();

        if (contentType == null
                || !ALLOWED_IMAGE_TYPES
                        .containsKey(
                                contentType
                        )) {

            throw new IllegalArgumentException(
                    "JPG, PNG, WEBP, GIF "
                    + "이미지만 업로드할 수 있습니다."
            );
        }
    }
}