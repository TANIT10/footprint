import {
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Send,
  Trash2,
  X,
} from 'lucide-react'

import './PostDetail.css'

import resolveMediaUrl from '../utils/mediaUrl'

import logo from '../assets/logo.png'
import footprint from '../assets/footprint.png'

import missingStatus from '../assets/MISSING.png'
import sightedStatus from '../assets/SIGHTED.png'
import returnedStatus from '../assets/RETURNED.png'

const POST_TYPE_INFO = {
  MISSING: {
    label: '찾아요',
    image: missingStatus,
  },
  SIGHTED: {
    label: '봤어요',
    image: sightedStatus,
  },
  RETURNED: {
    label: '귀가 완료!',
    image: returnedStatus,
  },
}

const GENDER_LABELS = {
  MALE: '수컷',
  FEMALE: '암컷',
  UNKNOWN: '모름',
}

function formatCreatedAt(createdAt) {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return new Intl.DateTimeFormat(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  ).format(date)
}

function PostDetail({
  post,
  profileImages = {},
  onBack,
  onCommentAdd,
  onCommentDelete,
  onUserProfileSelect,
}) {
  const [
    isContactVisible,
    setIsContactVisible,
  ] = useState(false)

  const [comment, setComment] =
    useState('')

  const [
    currentImageIndex,
    setCurrentImageIndex,
  ] = useState(0)

  const [
    isImageModalOpen,
    setIsImageModalOpen,
  ] = useState(false)

  const imageTouchStartXRef =
    useRef(null)

  const imageSwipeDetectedRef =
    useRef(false)

  const postImages =
    Array.isArray(post.images) &&
    post.images.length > 0
      ? post.images
      : post.representativeImage
        ? [post.representativeImage]
        : []

  const hasMultipleImages =
    postImages.length > 1

  const typeInfo =
    POST_TYPE_INFO[post.postType] ??
    POST_TYPE_INFO.MISSING

  const comments =
    post.comments ?? []

  const handlePreviousImage = () => {
    setCurrentImageIndex(
      (previousIndex) =>
        previousIndex === 0
          ? postImages.length - 1
          : previousIndex - 1
    )
  }

  const handleNextImage = () => {
    setCurrentImageIndex(
      (previousIndex) =>
        previousIndex ===
        postImages.length - 1
          ? 0
          : previousIndex + 1
    )
  }

  const handleImageTouchStart = (
    event
  ) => {
    if (
      event.touches.length !== 1
    ) {
      return
    }

    imageTouchStartXRef.current =
      event.touches[0].clientX

    imageSwipeDetectedRef.current =
      false
  }

  const handleImageTouchEnd = (
    event
  ) => {
    if (
      imageTouchStartXRef.current ===
        null ||
      event.changedTouches.length !==
        1
    ) {
      imageTouchStartXRef.current =
        null

      return
    }

    const touchEndX =
      event.changedTouches[0].clientX

    const difference =
      touchEndX -
      imageTouchStartXRef.current

    imageTouchStartXRef.current =
      null

    if (
      Math.abs(difference) < 45 ||
      !hasMultipleImages
    ) {
      return
    }

    imageSwipeDetectedRef.current =
      true

    if (difference < 0) {
      handleNextImage()
    } else {
      handlePreviousImage()
    }
  }

  const handleImageClick = () => {
    if (
      imageSwipeDetectedRef.current
    ) {
      imageSwipeDetectedRef.current =
        false

      return
    }

    if (
      typeof window !==
        'undefined' &&
      window.matchMedia(
        '(max-width: 800px)'
      ).matches
    ) {
      setIsImageModalOpen(true)
    }
  }

  const handleImageModalClose = () => {
    setIsImageModalOpen(false)
  }

  const handleCommentSubmit = (
    event
  ) => {
    event.preventDefault()

    const trimmedComment =
      comment.trim()

    if (!trimmedComment) {
      return
    }

    onCommentAdd?.(
      post.id,
      trimmedComment
    )

    setComment('')
  }

  const handleCommentDelete = (
    savedComment
  ) => {
    if (!savedComment.deletable) {
      window.alert(
        '본인이 작성한 댓글만 삭제할 수 있어요.'
      )
      return
    }

    const isConfirmed =
      window.confirm(
        '이 댓글을 삭제하시겠어요?'
      )

    if (!isConfirmed) {
      return
    }

    onCommentDelete?.(
      post.id,
      savedComment.id
    )
  }

  return (
    <div className="post-detail-page">
      <div className="post-detail-inner">
        <header className="post-detail-header">
          <button
            className="post-detail-back-button"
            type="button"
            onClick={onBack}
            aria-label="게시글 목록으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <img
            className="post-detail-logo"
            src={logo}
            alt="발자국 로고"
          />
        </header>

        <main className="post-detail-content">
          <section className="post-detail-post">
            <div className="post-detail-status">
              <img
                className={`post-detail-status-image ${
                  post.postType ===
                  'RETURNED'
                    ? 'post-detail-returned-image'
                    : post.postType ===
                        'SIGHTED'
                      ? 'post-detail-sighted-image'
                      : ''
                }`}
                src={typeInfo.image}
                alt={typeInfo.label}
              />
            </div>

            <div className="post-detail-image-box">
              {postImages.length > 0 ? (
                <>
                  <img
                    className="post-detail-image"
                    src={resolveMediaUrl(
                      postImages[
                        currentImageIndex
                      ]
                    )}
                    alt={`${
                      post.breed ||
                      '동물'
                    } 사진 ${
                      currentImageIndex +
                      1
                    }`}
                    onTouchStart={
                      handleImageTouchStart
                    }
                    onTouchEnd={
                      handleImageTouchEnd
                    }
                    onClick={
                      handleImageClick
                    }
                  />

                  {hasMultipleImages && (
                    <>
                      <button
                        className="post-image-slide-button previous-image-button"
                        type="button"
                        onClick={
                          handlePreviousImage
                        }
                        aria-label="이전 사진"
                      >
                        <ChevronLeft />
                      </button>

                      <button
                        className="post-image-slide-button next-image-button"
                        type="button"
                        onClick={
                          handleNextImage
                        }
                        aria-label="다음 사진"
                      >
                        <ChevronRight />
                      </button>

                      <span className="post-image-count">
                        {currentImageIndex +
                          1}{' '}
                        /{' '}
                        {postImages.length}
                      </span>

                      <div
                        className="post-image-indicators"
                        aria-label="사진 선택"
                      >
                        {postImages.map(
                          (_, index) => (
                            <button
                              className={`post-image-indicator ${
                                currentImageIndex ===
                                index
                                  ? 'active-image-indicator'
                                  : ''
                              }`}
                              type="button"
                              key={index}
                              onClick={() =>
                                setCurrentImageIndex(
                                  index
                                )
                              }
                              aria-label={`${
                                index + 1
                              }번째 사진 보기`}
                              aria-current={
                                currentImageIndex ===
                                index
                                  ? 'true'
                                  : undefined
                              }
                            />
                          )
                        )}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="post-detail-no-image">
                  사진 없음
                </div>
              )}
            </div>

            <div className="post-detail-summary">
              <h1>
                {post.breed ||
                  '품종 미상'}
              </h1>

              {post.createdAt && (
                <time className="post-detail-created-at">
                  {formatCreatedAt(
                    post.createdAt
                  )}
                </time>
              )}
            </div>

            <section className="post-detail-section">
              <h2>동물 정보</h2>

              <dl className="post-detail-information">
                <div>
                  <dt>품종</dt>
                  <dd>
                    {post.breed ||
                      '정보 없음'}
                  </dd>
                </div>

                <div>
                  <dt>성별</dt>
                  <dd>
                    {GENDER_LABELS[
                      post.gender
                    ] ||
                      '정보 없음'}
                  </dd>
                </div>

                <div>
                  <dt>나이</dt>
                  <dd>
                    {post.age ||
                      '정보 없음'}
                  </dd>
                </div>

                <div>
                  <dt>색</dt>
                  <dd>
                    {post.color ||
                      '정보 없음'}
                  </dd>
                </div>

                <div className="full-information-row">
                  <dt>특이사항</dt>
                  <dd>
                    {post.feature ||
                      '정보 없음'}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="post-detail-section">
              <h2>발견·실종 정보</h2>

              <dl className="post-detail-information">
                <div className="full-information-row">
                  <dt>장소</dt>
                  <dd>
                    {post.location ||
                      '정보 없음'}
                  </dd>
                </div>

                <div>
                  <dt>날짜</dt>
                  <dd>
                    {post.date ||
                      '정보 없음'}
                  </dd>
                </div>

                <div className="contact-information-row">
                  <dt>연락처</dt>

                  <dd>
                    {!post.contact ? (
                      <span className="empty-contact">
                        등록된 연락처 없음
                      </span>
                    ) : isContactVisible ? (
                      <span className="visible-contact">
                        {post.contact}
                      </span>
                    ) : (
                      <button
                        className="contact-view-button"
                        type="button"
                        onClick={() =>
                          setIsContactVisible(
                            true
                          )
                        }
                      >
                        연락처 보기
                      </button>
                    )}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="post-detail-section post-content-section">
              <h2>내용</h2>

              <p>
                {post.content ||
                  '작성된 내용이 없습니다.'}
              </p>
            </section>
          </section>

          <section className="comment-section">
            <div className="comment-title-row">
              <h2>댓글</h2>

              <span>
                {comments.length}
              </span>
            </div>

            {comments.length > 0 ? (
              <ul className="comment-list">
                {comments.map(
                  (savedComment) => {
                    const commentProfileImage =
                      savedComment.authorProfileImageUrl ||
                      (savedComment.authorUsername
                        ? profileImages[
                            savedComment
                              .authorUsername
                          ] ?? ''
                        : '')

                    const canDeleteComment =
                      Boolean(
                        savedComment.deletable
                      )

                    return (
                      <li
                        className="comment-item"
                        key={
                          savedComment.id
                        }
                      >
                        <div className="comment-profile-row">
                          <button
                            type="button"
                            onClick={() =>
                              savedComment.authorUsername &&
                              onUserProfileSelect?.(
                                savedComment.authorUsername,
                                savedComment.author
                              )
                            }
                            disabled={
                              !savedComment.authorUsername
                            }
                            aria-label={`${savedComment.author || '사용자'} 프로필 보기`}
                            style={{
                              flex:
                                '0 0 auto',
                              margin: 0,
                              padding: 0,
                              border: 0,
                              borderRadius:
                                '50%',
                              background:
                                'transparent',
                              cursor:
                                savedComment.authorUsername
                                  ? 'pointer'
                                  : 'default',
                            }}
                          >
                            <span className="comment-profile-image-box">
                              <img
                                className={
                                  commentProfileImage
                                    ? 'comment-profile-image'
                                    : 'comment-default-profile-image'
                                }
                                src={
                                  commentProfileImage
                                    ? resolveMediaUrl(
                                        commentProfileImage
                                      )
                                    : footprint
                                }
                                alt=""
                              />
                            </span>
                          </button>

                          <div className="comment-main">
                            <div className="comment-header">
                              <button
                                type="button"
                                onClick={() =>
                                  savedComment.authorUsername &&
                                  onUserProfileSelect?.(
                                    savedComment.authorUsername,
                                    savedComment.author
                                  )
                                }
                                disabled={
                                  !savedComment.authorUsername
                                }
                                style={{
                                  minWidth: 0,
                                  margin: 0,
                                  padding: 0,
                                  overflow:
                                    'hidden',
                                  border: 0,
                                  background:
                                    'transparent',
                                  color:
                                    '#292929',
                                  fontFamily:
                                    'inherit',
                                  fontSize:
                                    '14px',
                                  fontWeight:
                                    800,
                                  textOverflow:
                                    'ellipsis',
                                  whiteSpace:
                                    'nowrap',
                                  cursor:
                                    savedComment.authorUsername
                                      ? 'pointer'
                                      : 'default',
                                }}
                              >
                                {savedComment.author ||
                                  '익명'}
                              </button>

                              <div className="comment-side">
                                <time>
                                  {formatCreatedAt(
                                    savedComment.createdAt
                                  )}
                                </time>

                                {canDeleteComment && (
                                  <button
                                    className="comment-delete-button"
                                    type="button"
                                    onClick={() =>
                                      handleCommentDelete(
                                        savedComment
                                      )
                                    }
                                    aria-label="댓글 삭제"
                                  >
                                    <Trash2 />

                                    <span>
                                      삭제
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <p>
                              {
                                savedComment.content
                              }
                            </p>
                          </div>
                        </div>
                      </li>
                    )
                  }
                )}
              </ul>
            ) : (
              <p className="empty-comment-message">
                아직 댓글이 없어요.
                <br />
                첫 번째 댓글을 남겨보세요!
              </p>
            )}
          </section>
        </main>

        <form
          className="comment-form"
          onSubmit={
            handleCommentSubmit
          }
        >
          <div className="comment-form-inner">
            <label
              className="comment-input-label"
              htmlFor="post-comment"
            >
              댓글 작성
            </label>

            <textarea
              id="post-comment"
              value={comment}
              onChange={(event) =>
                setComment(
                  event.target.value
                )
              }
              placeholder="댓글을 입력해 주세요."
              maxLength={1000}
              rows={1}
            />

            <button
              className="comment-send-button"
              type="submit"
              disabled={
                !comment.trim()
              }
              aria-label="댓글 전송"
            >
              <Send />
            </button>
          </div>
        </form>

        {isImageModalOpen &&
          postImages.length > 0 && (
            <div
              className="post-image-modal"
              role="dialog"
              aria-modal="true"
              aria-label="사진 크게 보기"
              onClick={
                handleImageModalClose
              }
            >
              <div
                className="post-image-modal-content"
                onClick={(event) =>
                  event.stopPropagation()
                }
              >
                <button
                  className="post-image-modal-close"
                  type="button"
                  onClick={
                    handleImageModalClose
                  }
                  aria-label="사진 크게 보기 닫기"
                >
                  <X />
                </button>

                <img
                  className="post-image-modal-image"
                  src={resolveMediaUrl(
                    postImages[
                      currentImageIndex
                    ]
                  )}
                  alt={`${
                    post.breed ||
                    '동물'
                  } 사진 ${
                    currentImageIndex +
                    1
                  } 크게 보기`}
                />
              </div>
            </div>
          )}
      </div>
    </div>
  )
}

export default PostDetail