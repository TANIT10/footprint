package com.footprint.backend.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.footprint.backend.dto.PostCreateRequest;
import com.footprint.backend.dto.PostPageResponse;
import com.footprint.backend.dto.PostResponse;
import com.footprint.backend.dto.PostUpdateRequest;
import com.footprint.backend.service.PostService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    private final PostService postService;

    public PostController(
            PostService postService) {

        this.postService = postService;
    }


    @PostMapping(
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PostResponse>
            createPost(
                    Authentication authentication,

                    @Valid
                    @RequestPart("data")
                    PostCreateRequest request,

                    @RequestPart("images")
                    List<MultipartFile> images) {


        String username =
                authentication.getName();


        PostResponse response =
                postService.createPost(
                        username,
                        request,
                        images
                );


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    @GetMapping
    public ResponseEntity<PostPageResponse>
            getPostPage(
                    @RequestParam(
                            defaultValue = "0"
                    )
                    int page) {


        PostPageResponse response =
                postService.getPostPage(page);


        return ResponseEntity.ok(response);
    }


    @GetMapping("/me")
    public ResponseEntity<PostPageResponse>
            getMyPostPage(
                    Authentication authentication,

                    @RequestParam(
                            defaultValue = "0"
                    )
                    int page) {


        String username =
                authentication.getName();


        PostPageResponse response =
                postService.getMyPostPage(
                        username,
                        page
                );


        return ResponseEntity.ok(response);
    }


    @GetMapping("/{postId}")
    public ResponseEntity<PostResponse>
            getPost(
                    @PathVariable Long postId) {


        PostResponse response =
                postService.getPost(postId);


        return ResponseEntity.ok(response);
    }


    @PutMapping(
            value = "/{postId}",
            consumes =
                    MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<PostResponse>
            updatePost(
                    Authentication authentication,

                    @PathVariable Long postId,

                    @Valid
                    @RequestPart("data")
                    PostUpdateRequest request,

                    @RequestPart(
                            value = "newImages",
                            required = false
                    )
                    List<MultipartFile> newImages) {


        String username =
                authentication.getName();


        PostResponse response =
                postService.updatePost(
                        username,
                        postId,
                        request,
                        newImages
                );


        return ResponseEntity.ok(response);
    }


    @DeleteMapping("/{postId}")
    public ResponseEntity<Void>
            deletePost(
                    Authentication authentication,

                    @PathVariable Long postId) {


        String username =
                authentication.getName();


        postService.deletePost(
                username,
                postId
        );


        return ResponseEntity
                .noContent()
                .build();
    }
}