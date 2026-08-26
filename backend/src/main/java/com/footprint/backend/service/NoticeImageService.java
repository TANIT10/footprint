package com.footprint.backend.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
public class NoticeImageService {

    private static final int MAXIMUM_IMAGE_COUNT = 3;

    private static final long MAXIMUM_FILE_SIZE =
            5L * 1024L * 1024L;

    private static final String NOTICE_URL_PREFIX =
            "/uploads/notices/";

    private static final Map<String, String>
            ALLOWED_IMAGE_TYPES = Map.of(
                    "image/jpeg", ".jpg",
                    "image/png", ".png",
                    "image/webp", ".webp",
                    "image/gif", ".gif"
            );

    private final Path noticeUploadDirectory;

    public NoticeImageService() {

        this.noticeUploadDirectory =
                Paths.get(
                        "uploads",
                        "notices"
                )
                .toAbsolutePath()
                .normalize();

        try {
            Files.createDirectories(
                    noticeUploadDirectory
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "공지 사진 저장 폴더를 "
                    + "만들 수 없습니다.",
                    exception
            );
        }
    }

    /*
     * 공지는 사진 없이도 작성 가능.
     * 사진이 있다면 최대 3장까지 저장.
     */
    public List<String> saveOptional(
            List<MultipartFile> images
    ) {

        if (
                images == null ||
                images.isEmpty()
        ) {
            return new ArrayList<>();
        }

        if (
                images.size() >
                MAXIMUM_IMAGE_COUNT
        ) {
            throw new IllegalArgumentException(
                    "공지 사진은 최대 3장까지만 "
                    + "등록할 수 있습니다."
            );
        }

        return saveImages(images);
    }

    public Path getImagePath(
            String imageUrl
    ) {

        if (
                imageUrl == null ||
                imageUrl.isBlank() ||
                !imageUrl.startsWith(
                        NOTICE_URL_PREFIX
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 공지 "
                    + "사진 주소입니다."
            );
        }

        String storedFileName =
                imageUrl.substring(
                        NOTICE_URL_PREFIX.length()
                );

        Path imagePath =
                noticeUploadDirectory
                        .resolve(storedFileName)
                        .normalize();

        if (
                !imagePath.startsWith(
                        noticeUploadDirectory
                )
        ) {
            throw new IllegalArgumentException(
                    "올바르지 않은 공지 "
                    + "사진 경로입니다."
            );
        }

        if (
                !Files.exists(imagePath) ||
                !Files.isRegularFile(
                        imagePath
                )
        ) {
            throw new IllegalStateException(
                    "공지 사진 파일을 "
                    + "찾을 수 없습니다."
            );
        }

        return imagePath;
    }

    public void deleteAll(
            List<String> imageUrls
    ) {

        if (imageUrls == null) {
            return;
        }

        for (String imageUrl : imageUrls) {
            delete(imageUrl);
        }
    }

    private List<String> saveImages(
            List<MultipartFile> images
    ) {

        List<String> savedImageUrls =
                new ArrayList<>();

        try {
            for (MultipartFile image : images) {

                if (
                        image == null ||
                        image.isEmpty()
                ) {
                    continue;
                }

                savedImageUrls.add(
                        saveOne(image)
                );
            }

            return savedImageUrls;

        } catch (RuntimeException exception) {

            deleteAll(
                    savedImageUrls
            );

            throw exception;
        }
    }

    private String saveOne(
            MultipartFile image
    ) {

        validateImage(image);

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
                noticeUploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        if (
                !destination.startsWith(
                        noticeUploadDirectory
                )
        ) {
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
                    "공지 사진을 저장하지 "
                    + "못했습니다.",
                    exception
            );
        }

        return NOTICE_URL_PREFIX
                + storedFileName;
    }

    private void delete(
            String imageUrl
    ) {

        if (
                imageUrl == null ||
                imageUrl.isBlank() ||
                !imageUrl.startsWith(
                        NOTICE_URL_PREFIX
                )
        ) {
            return;
        }

        String storedFileName =
                imageUrl.substring(
                        NOTICE_URL_PREFIX.length()
                );

        Path target =
                noticeUploadDirectory
                        .resolve(
                                storedFileName
                        )
                        .normalize();

        if (
                !target.startsWith(
                        noticeUploadDirectory
                )
        ) {
            return;
        }

        try {
            Files.deleteIfExists(
                    target
            );
        } catch (IOException exception) {
            throw new IllegalStateException(
                    "공지 사진을 삭제하지 "
                    + "못했습니다.",
                    exception
            );
        }
    }

    private void validateImage(
            MultipartFile image
    ) {

        if (
                image == null ||
                image.isEmpty()
        ) {
            throw new IllegalArgumentException(
                    "비어 있는 사진은 "
                    + "등록할 수 없습니다."
            );
        }

        if (
                image.getSize() >
                MAXIMUM_FILE_SIZE
        ) {
            throw new IllegalArgumentException(
                    "사진 한 장의 크기는 "
                    + "5MB 이하여야 합니다."
            );
        }

        String contentType =
                image.getContentType();

        if (
                contentType == null ||
                !ALLOWED_IMAGE_TYPES
                        .containsKey(
                                contentType
                        )
        ) {
            throw new IllegalArgumentException(
                    "JPG, PNG, WEBP, GIF "
                    + "이미지만 등록할 수 있습니다."
            );
        }
    }
}