import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ArrowLeft,
  Plus,
  X,
} from 'lucide-react'

import './CommunityWrite.css'

import resolveMediaUrl from '../utils/mediaUrl'

const API_BASE_URL =
  'http://localhost:8080'

function CommunityWrite({
  onBack,
  onComplete,
  editingPost = null,
}) {
  const fileInputRef =
    useRef(null)

  const imagesRef =
    useRef([])

  const isEditing =
    Boolean(
      editingPost
    )

  const [
    title,
    setTitle,
  ] = useState(
    editingPost?.title ??
      ''
  )

  const [
    content,
    setContent,
  ] = useState(
    editingPost?.content ??
      ''
  )

  const [
    images,
    setImages,
  ] = useState(() => {
    const savedImages =
      Array.isArray(
        editingPost?.imageUrls
      )
        ? editingPost.imageUrls
        : []

    return savedImages.map(
      (
        imageUrl,
        index
      ) => ({
        id:
          `existing-community-image-${index}`,
        file: null,
        originalUrl:
          imageUrl,
        previewUrl:
          resolveMediaUrl(
            imageUrl
          ),
        isExisting: true,
      })
    )
  })

  const [
    isDirty,
    setIsDirty,
  ] = useState(false)

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false)

  useEffect(() => {
    imagesRef.current =
      images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(
        (image) => {
          if (
            !image.isExisting
          ) {
            URL.revokeObjectURL(
              image.previewUrl
            )
          }
        }
      )
    }
  }, [])

  const handleImageButtonClick =
    () => {
      fileInputRef
        .current
        ?.click()
    }

  const handleImageChange =
    (event) => {
      const selectedFiles =
        Array.from(
          event.target.files ??
            []
        )

      const remainingCount =
        5 - images.length

      if (remainingCount <= 0) {
        event.target.value = ''
        return
      }

      const allowedTypes = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
      ]

      const imageFiles =
        selectedFiles.filter(
          (file) =>
            allowedTypes.includes(
              file.type
            )
        )

      if (
        imageFiles.length !==
        selectedFiles.length
      ) {
        window.alert(
          'JPG, PNG, WEBP, GIF 이미지만 등록할 수 있어요.'
        )
      }

      const maximumFileSize =
        5 * 1024 * 1024

      const validImageFiles =
        imageFiles.filter(
          (file) =>
            file.size <=
            maximumFileSize
        )

      if (
        validImageFiles.length !==
        imageFiles.length
      ) {
        window.alert(
          '사진 한 장의 크기는 5MB 이하여야 해요.'
        )
      }

      const filesToAdd =
        validImageFiles.slice(
          0,
          remainingCount
        )

      const newImages =
        filesToAdd.map(
          (file) => ({
            id:
              `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,

            file,

            originalUrl: '',

            previewUrl:
              URL.createObjectURL(
                file
              ),

            isExisting: false,
          })
        )

      setImages(
        (
          previousImages
        ) => [
          ...previousImages,
          ...newImages,
        ]
      )

      if (
        newImages.length > 0
      ) {
        setIsDirty(true)
      }

      if (
        validImageFiles.length >
        remainingCount
      ) {
        window.alert(
          '사진은 최대 5장까지만 등록할 수 있어요.'
        )
      }

      event.target.value = ''
    }

  const handleImageDelete =
    (imageId) => {
      setImages(
        (
          previousImages
        ) => {
          const imageToDelete =
            previousImages.find(
              (image) =>
                image.id ===
                imageId
            )

          if (
            imageToDelete &&
            !imageToDelete
              .isExisting
          ) {
            URL.revokeObjectURL(
              imageToDelete
                .previewUrl
            )
          }

          return previousImages.filter(
            (image) =>
              image.id !==
              imageId
          )
        }
      )

      setIsDirty(true)
    }

  const handleTitleChange =
    (event) => {
      setTitle(
        event.target.value
      )

      setIsDirty(true)
    }

  const handleContentChange =
    (event) => {
      setContent(
        event.target.value
      )

      setIsDirty(true)
    }

  const handleSubmit =
    async (event) => {
      event.preventDefault()

      if (isSubmitting) {
        return
      }

      if (!title.trim()) {
        window.alert(
          '제목을 입력해 주세요.'
        )

        return
      }

      if (!content.trim()) {
        window.alert(
          '내용을 입력해 주세요.'
        )

        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인이 필요합니다.'
        )

        return
      }

      const multipartData =
        new FormData()

      multipartData.append(
        'title',
        title.trim()
      )

      multipartData.append(
        'content',
        content.trim()
      )

      if (isEditing) {
        images
          .filter(
            (image) =>
              image.isExisting
          )
          .forEach(
            (image) => {
              multipartData.append(
                'existingImageUrls',
                image.originalUrl
              )
            }
          )
      }

      images
        .filter(
          (image) =>
            !image.isExisting
        )
        .forEach(
          (image) => {
            multipartData.append(
              'images',
              image.file
            )
          }
        )

      try {
        setIsSubmitting(true)

        const requestUrl =
          isEditing
            ? `${API_BASE_URL}/api/community/posts/${editingPost.id}`
            : `${API_BASE_URL}/api/community/posts`

        const response =
          await fetch(
            requestUrl,
            {
              method:
                isEditing
                  ? 'PUT'
                  : 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },

              body:
                multipartData,
            }
          )

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          let message =
            isEditing
              ? '커뮤니티 글을 수정하지 못했습니다.'
              : '커뮤니티 글을 등록하지 못했습니다.'

          try {
            const errorBody =
              await response.json()

            message =
              errorBody.message ||
              errorBody.error ||
              message
          } catch {
            // JSON 에러 응답이 아니면
            // 기본 메시지를 사용합니다.
          }

          throw new Error(
            message
          )
        }

        const savedPost =
          await response.json()

        setIsDirty(false)

        window.alert(
          isEditing
            ? '커뮤니티 글이 수정됐어요.'
            : '커뮤니티 글이 등록됐어요.'
        )

        onComplete?.(
          savedPost
        )
      } catch (error) {
        console.error(
          isEditing
            ? '커뮤니티 글 수정 실패:'
            : '커뮤니티 글 등록 실패:',
          error
        )

        window.alert(
          error.message ||
            (
              isEditing
                ? '커뮤니티 글을 수정하지 못했어요.'
                : '커뮤니티 글을 등록하지 못했어요.'
            )
        )
      } finally {
        setIsSubmitting(false)
      }
    }

  const handleCancel =
    () => {
      if (isSubmitting) {
        return
      }

      if (isDirty) {
        const shouldLeave =
          window.confirm(
            isEditing
              ? '수정한 내용이 사라져요. 게시글로 돌아갈까요?'
              : '작성 중인 내용이 사라져요. 커뮤니티로 돌아갈까요?'
          )

        if (!shouldLeave) {
          return
        }
      }

      onBack?.()
    }

  return (
    <div className="community-write-page">
      <header className="community-write-header">
        <button
          className="community-write-back-button"
          type="button"
          onClick={handleCancel}
          disabled={isSubmitting}
          aria-label={
            isEditing
              ? '게시글로 돌아가기'
              : '커뮤니티로 돌아가기'
          }
        >
          <ArrowLeft />
        </button>

        <h1 className="community-write-header-title">
          {isEditing
            ? '커뮤니티 글 수정'
            : '커뮤니티 글쓰기'}
        </h1>
      </header>

      <main className="community-write-content">
        <form
          onSubmit={
            handleSubmit
          }
        >
          <section className="community-write-section">
            <label className="community-write-field">
              <span>
                제목 *
              </span>

              <input
                type="text"
                value={title}
                onChange={
                  handleTitleChange
                }
                placeholder="제목을 입력해 주세요."
                maxLength={150}
                disabled={
                  isSubmitting
                }
              />

              <small>
                {title.length}/150
              </small>
            </label>
          </section>

          <section className="community-write-section">
            <div className="community-section-title-row">
              <h2>
                사진
              </h2>

              <span>
                {images.length}/5
              </span>
            </div>

            <p className="community-field-guide">
              사진은 선택 사항이며 최대 5장까지 등록할 수 있어요.
            </p>

            <input
              className="community-hidden-file-input"
              ref={
                fileInputRef
              }
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              onChange={
                handleImageChange
              }
              disabled={
                isSubmitting
              }
            />

            <div className="community-image-upload-list">
              {images.map(
                (
                  image,
                  index
                ) => (
                  <div
                    className="community-image-preview-box"
                    key={
                      image.id
                    }
                  >
                    <img
                      src={
                        image.previewUrl
                      }
                      alt={`등록 사진 ${
                        index + 1
                      }`}
                    />

                    <button
                      className="community-image-delete-button"
                      type="button"
                      onClick={() =>
                        handleImageDelete(
                          image.id
                        )
                      }
                      disabled={
                        isSubmitting
                      }
                      aria-label={`등록 사진 ${
                        index + 1
                      } 삭제`}
                    >
                      <X />
                    </button>
                  </div>
                )
              )}

              {images.length <
                5 && (
                <button
                  className="community-image-add-button"
                  type="button"
                  onClick={
                    handleImageButtonClick
                  }
                  disabled={
                    isSubmitting
                  }
                  aria-label="사진 추가"
                >
                  <Plus />

                  <span>
                    사진 추가
                  </span>
                </button>
              )}
            </div>
          </section>

          <section className="community-write-section">
            <label className="community-write-field">
              <span>
                내용 *
              </span>

              <textarea
                className="community-content-input"
                value={
                  content
                }
                onChange={
                  handleContentChange
                }
                placeholder="자유롭게 이야기를 남겨주세요."
                maxLength={3000}
                disabled={
                  isSubmitting
                }
              />

              <small>
                {content.length}/3000
              </small>
            </label>
          </section>

          <div className="community-write-actions">
            <button
              className="community-write-cancel-button"
              type="button"
              onClick={
                handleCancel
              }
              disabled={
                isSubmitting
              }
            >
              취소
            </button>

            <button
              className="community-write-submit-button"
              type="submit"
              disabled={
                isSubmitting
              }
            >
              {isSubmitting
                ? '저장 중...'
                : isEditing
                  ? '수정 완료'
                  : '완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default CommunityWrite
