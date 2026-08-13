import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, Plus, X } from 'lucide-react'

import './PostWrite.css'

import logo from '../assets/logo.png'

const POST_TYPES = [
  {
    value: 'MISSING',
    label: '찾아요',
  },
  {
    value: 'SIGHTED',
    label: '봤어요',
  },
  {
    value: 'RETURNED',
    label: '귀가 완료',
  },
]

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const maximumSize = 1200

        let width = image.width
        let height = image.height

        if (width > height && width > maximumSize) {
          height = Math.round(
            height * (maximumSize / width)
          )
          width = maximumSize
        } else if (
          height >= width &&
          height > maximumSize
        ) {
          width = Math.round(
            width * (maximumSize / height)
          )
          height = maximumSize
        }

        const canvas =
          document.createElement('canvas')

        const context = canvas.getContext('2d')

        if (!context) {
          reject(
            new Error(
              '사진 변환 기능을 사용할 수 없습니다.'
            )
          )
          return
        }

        canvas.width = width
        canvas.height = height

        context.drawImage(
          image,
          0,
          0,
          width,
          height
        )

        resolve(
          canvas.toDataURL('image/jpeg', 0.75)
        )
      }

      image.onerror = () => {
        reject(
          new Error('사진을 불러오지 못했습니다.')
        )
      }

      image.src = reader.result
    }

    reader.onerror = () => {
      reject(
        new Error('사진 파일을 읽지 못했습니다.')
      )
    }

    reader.readAsDataURL(file)
  })
}

function PostWrite({
  onBack,
  onComplete,
  editingPost = null,
}) {
  const fileInputRef = useRef(null)
  const imagesRef = useRef([])

  const isEditing = Boolean(editingPost)

  const [postType, setPostType] = useState(
    editingPost?.postType ?? 'MISSING'
  )

  const [images, setImages] = useState(() => {
    const savedImages =
      editingPost?.images?.length > 0
        ? editingPost.images
        : editingPost?.representativeImage
          ? [editingPost.representativeImage]
          : []

    return savedImages.map(
      (imageData, index) => ({
        id: `existing-image-${index}`,
        file: null,
        previewUrl: imageData,
        isExisting: true,
      })
    )
  })

  const [formData, setFormData] = useState({
    breed: editingPost?.breed ?? '',
    gender: editingPost?.gender ?? '',
    age: editingPost?.age ?? '',
    color: editingPost?.color ?? '',
    feature: editingPost?.feature ?? '',
    location: editingPost?.location ?? '',
    date: editingPost?.date ?? '',
    contact: editingPost?.contact ?? '',
    content: editingPost?.content ?? '',
  })

  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    imagesRef.current = images
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (!image.isExisting) {
          URL.revokeObjectURL(image.previewUrl)
        }
      })
    }
  }, [])

  const handleInputChange = (event) => {
    const { name, value } = event.target

    setFormData((previousData) => ({
      ...previousData,
      [name]: value,
    }))

    setIsDirty(true)
  }

  const handlePostTypeChange = (
    nextPostType
  ) => {
    setPostType(nextPostType)
    setIsDirty(true)
  }

  const handleImageButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleImageChange = (event) => {
    const selectedFiles = Array.from(
      event.target.files ?? []
    )

    const remainingCount = 5 - images.length

    if (remainingCount <= 0) {
      event.target.value = ''
      return
    }

    const imageFiles = selectedFiles.filter(
      (file) => file.type.startsWith('image/')
    )

    if (
      imageFiles.length !== selectedFiles.length
    ) {
      window.alert(
        '이미지 파일만 등록할 수 있어요.'
      )
    }

    const filesToAdd = imageFiles.slice(
      0,
      remainingCount
    )

    const newImages = filesToAdd.map(
      (file) => ({
        id: `${file.name}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        isExisting: false,
      })
    )

    setImages((previousImages) => [
      ...previousImages,
      ...newImages,
    ])

    if (newImages.length > 0) {
      setIsDirty(true)
    }

    if (imageFiles.length > remainingCount) {
      window.alert(
        '사진은 최대 5장까지만 등록할 수 있어요.'
      )
    }

    event.target.value = ''
  }

  const handleImageDelete = (imageId) => {
    setImages((previousImages) => {
      const imageToDelete =
        previousImages.find(
          (image) => image.id === imageId
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
        (image) => image.id !== imageId
      )
    })

    setIsDirty(true)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!postType) {
      window.alert(
        '게시글 종류를 선택해 주세요.'
      )
      return
    }

    if (images.length === 0) {
      window.alert(
        '사진을 한 장 이상 등록해 주세요.'
      )
      return
    }

    if (!formData.breed.trim()) {
      window.alert('품종을 입력해 주세요.')
      return
    }

    if (!formData.location.trim()) {
      window.alert('장소를 입력해 주세요.')
      return
    }

    if (!formData.date) {
      window.alert('날짜를 선택해 주세요.')
      return
    }

    if (!formData.content.trim()) {
      window.alert(
        '게시글 내용을 입력해 주세요.'
      )
      return
    }

    try {
      const completedImages =
        await Promise.all(
          images.map((image) =>
            image.isExisting
              ? image.previewUrl
              : compressImage(image.file)
          )
        )

      const completedPost = {
        ...(editingPost ?? {}),
        id:
          editingPost?.id ??
          crypto.randomUUID(),
        postType,
        representativeImage:
          completedImages[0],
        images: completedImages,
        breed: formData.breed.trim(),
        gender: formData.gender,
        age: formData.age.trim(),
        color: formData.color.trim(),
        feature: formData.feature.trim(),
        location: formData.location.trim(),
        date: formData.date,
        contact: formData.contact.trim(),
        content: formData.content.trim(),
        createdAt:
          editingPost?.createdAt ??
          new Date().toISOString(),
        updatedAt: isEditing
          ? new Date().toISOString()
          : undefined,
      }

      onComplete(completedPost)
    } catch (error) {
      console.error(
        '사진 처리 실패:',
        error
      )

      window.alert(
        '사진을 처리하지 못했어요. 다른 사진으로 다시 시도해 주세요.'
      )
    }
  }

  const handleCancel = () => {
    if (isDirty) {
      const shouldLeave = window.confirm(
        isEditing
          ? '수정한 내용이 사라져요. 내 게시글로 돌아갈까요?'
          : '작성 중인 내용이 사라져요. 게시글 목록으로 돌아갈까요?'
      )

      if (!shouldLeave) {
        return
      }
    }

    onBack()
  }

  return (
    <div className="post-write-page">
      <header className="post-write-header">
        <button
          className="post-write-back-button"
          type="button"
          onClick={handleCancel}
          aria-label={
            isEditing
              ? '내 게시글로 돌아가기'
              : '게시글 목록으로 돌아가기'
          }
        >
          <ArrowLeft />
        </button>

        <img
          className="post-write-logo"
          src={logo}
          alt="발자국 로고"
        />
      </header>

      <main className="post-write-content">
        <form onSubmit={handleSubmit}>
          <section className="post-type-section">
            <h1 className="post-write-title">
              {isEditing
                ? '게시글 수정'
                : '글쓰기'}
            </h1>

            <p className="post-write-description">
              게시글의 상태를 선택해 주세요.
            </p>

            <div className="post-type-buttons">
              {POST_TYPES.map((type) => (
                <button
                  className={
                    postType === type.value
                      ? 'post-type-button selected'
                      : 'post-type-button'
                  }
                  type="button"
                  key={type.value}
                  onClick={() =>
                    handlePostTypeChange(
                      type.value
                    )
                  }
                  aria-pressed={
                    postType === type.value
                  }
                >
                  {type.label}
                </button>
              ))}
            </div>
          </section>

          <section className="post-write-section">
            <div className="section-title-row">
              <h2>사진</h2>
              <span>{images.length}/5</span>
            </div>

            <p className="field-guide">
              사진은 최대 5장까지 등록할 수
              있어요.
            </p>

            <input
              className="hidden-file-input"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />

            <div className="image-upload-list">
              {images.map((image, index) => (
                <div
                  className="image-preview-box"
                  key={image.id}
                >
                  <img
                    src={image.previewUrl}
                    alt={`등록 사진 ${index + 1}`}
                  />

                  {index === 0 && (
                    <span className="representative-label">
                      대표
                    </span>
                  )}

                  <button
                    className="image-delete-button"
                    type="button"
                    onClick={() =>
                      handleImageDelete(image.id)
                    }
                    aria-label={`등록 사진 ${
                      index + 1
                    } 삭제`}
                  >
                    <X />
                  </button>
                </div>
              ))}

              {images.length < 5 && (
                <button
                  className="image-add-button"
                  type="button"
                  onClick={
                    handleImageButtonClick
                  }
                  aria-label="사진 추가"
                >
                  <Plus />
                  <span>사진 추가</span>
                </button>
              )}
            </div>
          </section>

          <section className="post-write-section animal-info-section">
            <h2>동물 정보</h2>

            <label className="post-write-field">
              <span>품종 *</span>

              <input
                type="text"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="ex. 믹스견, 말티즈, 아메리칸 숏헤어"
                maxLength={50}
              />
            </label>

            <div className="two-column-fields">
              <label className="post-write-field">
                <span>성별</span>

                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                >
                  <option value="">선택</option>
                  <option value="MALE">
                    수컷
                  </option>
                  <option value="FEMALE">
                    암컷
                  </option>
                  <option value="UNKNOWN">
                    모름
                  </option>
                </select>
              </label>

              <label className="post-write-field">
                <span>나이</span>

                <input
                  type="text"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="ex. 3살 추정"
                  maxLength={30}
                />
              </label>
            </div>

            <label className="post-write-field">
              <span>색</span>

              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                placeholder="ex. 흰색, 갈색과 검은색"
                maxLength={50}
              />
            </label>

            <label className="post-write-field">
              <span>특이사항</span>

              <textarea
                name="feature"
                value={formData.feature}
                onChange={handleInputChange}
                placeholder="목줄, 옷, 상처 등 눈에 띄는 특징을 적어 주세요."
                maxLength={300}
              />
            </label>
          </section>

          <section className="post-write-section">
            <h2>발견·실종 정보</h2>

            <label className="post-write-field">
              <span>장소 *</span>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="ex. 서울시 마포구 망원한강공원"
                maxLength={100}
              />
            </label>

            <label className="post-write-field">
              <span>날짜 *</span>

              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
              />
            </label>

            <label className="post-write-field">
              <span>연락처</span>

              <input
                type="tel"
                name="contact"
                value={formData.contact}
                onChange={handleInputChange}
                placeholder="ex. 010-1234-5678"
                maxLength={30}
              />
            </label>

            <label className="post-write-field">
              <span>내용 *</span>

              <textarea
                className="post-content-input"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                placeholder="동물을 마지막으로 본 위치와 당시 상황 등 자세한 내용을 작성해 주세요."
                maxLength={2000}
              />

              <small>
                {formData.content.length}/2000
              </small>
            </label>
          </section>

          <div className="post-write-actions">
            <button
              className="post-write-cancel-button"
              type="button"
              onClick={handleCancel}
            >
              취소
            </button>

            <button
              className="post-write-submit-button"
              type="submit"
            >
              {isEditing ? '수정 완료' : '완료'}
            </button>
          </div>
        </form>
      </main>
    </div>
  )
}

export default PostWrite