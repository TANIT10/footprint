import {
  ArrowLeft,
  Check,
  Plus,
  X,
} from 'lucide-react'

import {
  useEffect,
  useRef,
  useState,
} from 'react'

import './AdminNoticeWrite.css'

import resolveMediaUrl from '../utils/mediaUrl'

const API_BASE_URL =
  ''

function createClientId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`
}

function AdminNoticeWrite({
  noticeId = null,
  onBack,
  onComplete,
}) {
  const fileInputRef =
    useRef(null)

  const imagesRef =
    useRef([])

  const isEditMode =
    Boolean(noticeId)

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    content,
    setContent,
  ] = useState('')

  const [
    important,
    setImportant,
  ] = useState(false)

  const [
    images,
    setImages,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    isEditMode
  )

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  useEffect(() => {
    imagesRef.current =
      images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach(
        (image) => {
          if (!image.isExisting) {
            URL.revokeObjectURL(
              image.previewUrl
            )
          }
        }
      )
    }
  }, [])

  useEffect(() => {
    if (!isEditMode) {
      return
    }

    const abortController =
      new AbortController()

    const loadNotice =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          setLoadError(
            '로그인 정보를 찾을 수 없어요.'
          )

          setIsLoading(
            false
          )

          return
        }

        try {
          setIsLoading(
            true
          )

          setLoadError(
            ''
          )

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices/${noticeId}`,
              {
                method: 'GET',

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },

                signal:
                  abortController.signal,
              }
            )

          if (!response.ok) {
            throw new Error(
              '공지사항을 불러오지 못했어요.'
            )
          }

          const notice =
            await response.json()

          setTitle(
            notice.title ?? ''
          )

          setContent(
            notice.content ?? ''
          )

          setImportant(
            Boolean(
              notice.important
            )
          )

          const savedImages =
            Array.isArray(
              notice.imageUrls
            )
              ? notice.imageUrls
              : []

          setImages(
            savedImages.map(
              (
                imageUrl,
                index
              ) => ({
                id:
                  `existing-notice-image-${index}`,
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
          )
        } catch (error) {
          if (
            error.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '관리자 공지 조회 실패:',
            error
          )

          setLoadError(
            error.message ||
              '공지사항을 불러오지 못했어요.'
          )
        } finally {
          if (
            !abortController
              .signal
              .aborted
          ) {
            setIsLoading(
              false
            )
          }
        }
      }

    loadNotice()

    return () => {
      abortController.abort()
    }
  }, [
    isEditMode,
    noticeId,
  ])

  const handleImageButtonClick =
    () => {
      fileInputRef.current?.click()
    }

  const handleImageChange =
    (event) => {
      const selectedFiles =
        Array.from(
          event.target.files ?? []
        )

      const remainingCount =
        3 - images.length

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
              `${file.name}-${file.lastModified}-${createClientId()}`,
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
        (previousImages) => [
          ...previousImages,
          ...newImages,
        ]
      )

      if (
        validImageFiles.length >
        remainingCount
      ) {
        window.alert(
          '공지 사진은 최대 3장까지만 등록할 수 있어요.'
        )
      }

      event.target.value = ''
    }

  const handleImageDelete =
    (imageId) => {
      setImages(
        (previousImages) => {
          const imageToDelete =
            previousImages.find(
              (image) =>
                image.id === imageId
            )

          if (
            imageToDelete &&
            !imageToDelete.isExisting
          ) {
            URL.revokeObjectURL(
              imageToDelete.previewUrl
            )
          }

          return previousImages.filter(
            (image) =>
              image.id !== imageId
          )
        }
      )
    }

  const handleSubmit =
    async () => {
      if (
        isSaving
      ) {
        return
      }

      const normalizedTitle =
        title.trim()

      const normalizedContent =
        content.trim()

      if (!normalizedTitle) {
        window.alert(
          '공지사항 제목을 입력해 주세요.'
        )

        return
      }

      if (!normalizedContent) {
        window.alert(
          '공지사항 내용을 입력해 주세요.'
        )

        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없어요.'
        )

        return
      }

      const multipartData =
        new FormData()

      multipartData.append(
        'data',
        new Blob(
          [
            JSON.stringify({
              title:
                normalizedTitle,
              content:
                normalizedContent,
              important,
            }),
          ],
          {
            type:
              'application/json',
          }
        )
      )

      if (isEditMode) {
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

        images
          .filter(
            (image) =>
              !image.isExisting
          )
          .forEach(
            (image) => {
              multipartData.append(
                'newImages',
                image.file
              )
            }
          )
      } else {
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
      }

      try {
        setIsSaving(
          true
        )

        const response =
          await fetch(
            isEditMode
              ? `${API_BASE_URL}/api/admin/notices/${noticeId}`
              : `${API_BASE_URL}/api/admin/notices`,
            {
              method:
                isEditMode
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
          401
        ) {
          throw new Error(
            '로그인 시간이 만료됐어요.'
          )
        }

        if (
          response.status ===
          403
        ) {
          throw new Error(
            '관리자 권한이 필요해요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            isEditMode
              ? '공지사항을 수정하지 못했어요.'
              : '공지사항을 등록하지 못했어요.'
          )
        }

        const savedNotice =
          await response.json()

        window.alert(
          isEditMode
            ? '공지사항을 수정했어요.'
            : '공지사항을 등록했어요.'
        )

        onComplete?.(
          savedNotice
        )
      } catch (error) {
        console.error(
          '관리자 공지 저장 실패:',
          error
        )

        window.alert(
          error.message ||
            '공지사항을 저장하지 못했어요.'
        )
      } finally {
        setIsSaving(
          false
        )
      }
    }

  if (isLoading) {
    return (
      <div className="admin-notice-write-page">
        <section className="admin-notice-write-loading">
          <span />

          <p>
            공지사항을 불러오는 중이에요.
          </p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-notice-write-page">
        <header className="admin-notice-write-header">
          <button
            type="button"
            onClick={
              onBack
            }
            aria-label="뒤로가기"
          >
            <ArrowLeft />
          </button>

          <h1>
            공지사항 수정
          </h1>
        </header>

        <section className="admin-notice-write-error">
          {loadError}
        </section>
      </div>
    )
  }

  return (
    <div className="admin-notice-write-page">
      <header className="admin-notice-write-header">
        <button
          type="button"
          onClick={
            onBack
          }
          aria-label="뒤로가기"
          disabled={
            isSaving
          }
        >
          <ArrowLeft />
        </button>

        <h1>
          {isEditMode
            ? '공지사항 수정'
            : '공지사항 작성'}
        </h1>
      </header>

      <main className="admin-notice-write-content">
        <section className="admin-notice-write-section">
          <label className="admin-notice-write-field">
            <span>
              제목
            </span>

            <input
              type="text"
              value={
                title
              }
              maxLength={
                100
              }
              onChange={(
                event
              ) =>
                setTitle(
                  event
                    .target
                    .value
                )
              }
              placeholder="공지사항 제목을 입력해 주세요."
              disabled={
                isSaving
              }
            />

            <small>
              {title.length}/100
            </small>
          </label>
        </section>

        <section className="admin-notice-write-section">
          <div className="admin-notice-image-title-row">
            <strong>
              사진
            </strong>

            <span>
              {images.length}/3
            </span>
          </div>

          <p className="admin-notice-image-guide">
            사진은 선택 사항이며 최대 3장까지 등록할 수 있어요.
          </p>

          <input
            className="admin-notice-hidden-file-input"
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            onChange={handleImageChange}
            disabled={isSaving}
          />

          <div className="admin-notice-image-list">
            {images.map(
              (
                image,
                index
              ) => (
                <div
                  className="admin-notice-image-preview"
                  key={image.id}
                >
                  <img
                    src={image.previewUrl}
                    alt={`공지 사진 ${index + 1}`}
                  />

                  <button
                    className="admin-notice-image-delete-button"
                    type="button"
                    onClick={() =>
                      handleImageDelete(
                        image.id
                      )
                    }
                    disabled={isSaving}
                    aria-label={`공지 사진 ${index + 1} 삭제`}
                  >
                    <X />
                  </button>
                </div>
              )
            )}

            {images.length < 3 && (
              <button
                className="admin-notice-image-add-button"
                type="button"
                onClick={handleImageButtonClick}
                disabled={isSaving}
                aria-label="공지 사진 추가"
              >
                <Plus />

                <span>
                  사진 추가
                </span>
              </button>
            )}
          </div>
        </section>

        <section className="admin-notice-write-section">
          <label className="admin-notice-write-field">
            <span>
              내용
            </span>

            <textarea
              value={
                content
              }
              maxLength={
                5000
              }
              onChange={(
                event
              ) =>
                setContent(
                  event
                    .target
                    .value
                )
              }
              placeholder="공지사항 내용을 입력해 주세요."
              disabled={
                isSaving
              }
            />

            <small>
              {content.length}/5000
            </small>
          </label>
        </section>

        <section className="admin-notice-write-section">
          <button
            className={`admin-notice-important-toggle ${
              important
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              setImportant(
                (
                  previous
                ) =>
                  !previous
              )
            }
            disabled={
              isSaving
            }
          >
            <span className="admin-notice-important-check">
              {important && (
                <Check />
              )}
            </span>

            <span className="admin-notice-important-text">
              <strong>
                중요 공지로 설정
              </strong>

              <small>
                일반 공지보다 위쪽에 표시돼요.
              </small>
            </span>
          </button>
        </section>

        <div className="admin-notice-write-actions">
          <button
            className="admin-notice-write-cancel-button"
            type="button"
            onClick={
              onBack
            }
            disabled={
              isSaving
            }
          >
            취소
          </button>

          <button
            className="admin-notice-write-submit-button"
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              isSaving
            }
          >
            {isSaving
              ? '저장 중...'
              : isEditMode
                ? '수정 완료'
                : '등록하기'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminNoticeWrite
