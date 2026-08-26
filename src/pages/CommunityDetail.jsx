import {
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
  Heart,
  MessageCircle,
  MoreVertical,
  Trash2,
} from 'lucide-react'

import './CommunityDetail.css'

import LoadingScreen from './LoadingScreen'

import footprint from '../assets/footprint.png'
import resolveMediaUrl from '../utils/mediaUrl'

const API_BASE_URL =
  ''

function CommunityDetail({
  postId,
  profileImages = {},
  onBack,
  onEdit,
}) {
  const [
    post,
    setPost,
  ] = useState(null)

  const [
    comments,
    setComments,
  ] = useState([])

  const [
    commentText,
    setCommentText,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isLikeProcessing,
    setIsLikeProcessing,
  ] = useState(false)

  const [
    isCommentSubmitting,
    setIsCommentSubmitting,
  ] = useState(false)

  const [
    isActionSheetOpen,
    setIsActionSheetOpen,
  ] = useState(false)

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false)

  const [
    isReportSheetOpen,
    setIsReportSheetOpen,
  ] = useState(false)

  const [
    isReporting,
    setIsReporting,
  ] = useState(false)

  const [
    isBlocking,
    setIsBlocking,
  ] = useState(false)

  useEffect(() => {
    const loadDetail =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          window.alert(
            '로그인이 필요합니다.'
          )

          onBack?.()
          return
        }

        try {
          setIsLoading(true)

          const [
            postResponse,
            commentsResponse,
          ] =
            await Promise.all([
              fetch(
                `${API_BASE_URL}/api/community/posts/${postId}`,
                {
                  method: 'GET',

                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              ),

              fetch(
                `${API_BASE_URL}/api/community/posts/${postId}/comments`,
                {
                  method: 'GET',

                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              ),
            ])

          if (
            postResponse.status ===
              401 ||
            postResponse.status ===
              403
          ) {
            throw new Error(
              '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
            )
          }

          if (
            postResponse.status ===
            404
          ) {
            window.alert(
              '삭제되었거나 찾을 수 없는 글이에요.'
            )

            onBack?.()
            return
          }

          if (
            !postResponse.ok
          ) {
            throw new Error(
              '커뮤니티 글을 불러오지 못했습니다.'
            )
          }

          if (
            !commentsResponse.ok
          ) {
            throw new Error(
              '댓글을 불러오지 못했습니다.'
            )
          }

          const postBody =
            await postResponse.json()

          const commentsBody =
            await commentsResponse.json()

          setPost(
            postBody
          )

          setComments(
            Array.isArray(
              commentsBody
            )
              ? commentsBody
              : []
          )
        } catch (error) {
          console.error(
            '커뮤니티 상세 조회 실패:',
            error
          )

          window.alert(
            error.message ||
              '커뮤니티 글을 불러오지 못했어요.'
          )
        } finally {
          setIsLoading(false)
        }
      }

    if (postId) {
      loadDetail()
    }
  }, [
    postId,
  ])

  const formatCreatedAt =
    (createdAt) => {
      if (!createdAt) {
        return ''
      }

      const date =
        new Date(createdAt)

      if (
        Number.isNaN(
          date.getTime()
        )
      ) {
        return ''
      }

      return date.toLocaleString(
        'ko-KR',
        {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
        }
      )
    }

  const getProfileImage =
    (
      username,
      profileImageUrl
    ) => {
      const mappedProfileImage =
        username
          ? profileImages[
              username
            ]
          : ''

      if (
        mappedProfileImage &&
        mappedProfileImage.trim()
      ) {
        return resolveMediaUrl(
          mappedProfileImage
        )
      }

      if (
        profileImageUrl &&
        profileImageUrl.trim()
      ) {
        return resolveMediaUrl(
          profileImageUrl
        )
      }

      return footprint
    }

  const handleLike =
    async () => {
      if (
        !post ||
        isLikeProcessing
      ) {
        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        return
      }

      try {
        setIsLikeProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/community/posts/${post.id}/like`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '좋아요 처리에 실패했습니다.'
          )
        }

        const updatedPost =
          await response.json()

        setPost(
          updatedPost
        )
      } catch (error) {
        console.error(
          '좋아요 처리 실패:',
          error
        )

        window.alert(
          error.message ||
            '좋아요 처리에 실패했어요.'
        )
      } finally {
        setIsLikeProcessing(false)
      }
    }

  const handleCommentSubmit =
    async (event) => {
      event.preventDefault()

      if (
        isCommentSubmitting
      ) {
        return
      }

      if (!commentText.trim()) {
        window.alert(
          '댓글 내용을 입력해 주세요.'
        )
        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        return
      }

      try {
        setIsCommentSubmitting(
          true
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/community/posts/${postId}/comments`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  content:
                    commentText.trim(),
                }),
            }
          )

        if (!response.ok) {
          throw new Error(
            '댓글을 등록하지 못했습니다.'
          )
        }

        const newComment =
          await response.json()

        setComments(
          (
            previousComments
          ) => [
            ...previousComments,
            newComment,
          ]
        )

        setCommentText('')

        setPost(
          (
            previousPost
          ) => ({
            ...previousPost,

            commentCount:
              Number(
                previousPost
                  ?.commentCount ??
                  0
              ) + 1,
          })
        )
      } catch (error) {
        console.error(
          '커뮤니티 댓글 등록 실패:',
          error
        )

        window.alert(
          error.message ||
            '댓글을 등록하지 못했어요.'
        )
      } finally {
        setIsCommentSubmitting(
          false
        )
      }
    }

  const handleCommentDelete =
    async (commentId) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        return
      }

      const shouldDelete =
        window.confirm(
          '댓글을 삭제할까요?'
        )

      if (!shouldDelete) {
        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/community/comments/${commentId}`,
            {
              method: 'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status !==
            204 &&
          !response.ok
        ) {
          throw new Error(
            '댓글을 삭제하지 못했습니다.'
          )
        }

        setComments(
          (
            previousComments
          ) =>
            previousComments.filter(
              (comment) =>
                comment.id !==
                commentId
            )
        )

        setPost(
          (
            previousPost
          ) => ({
            ...previousPost,

            commentCount:
              Math.max(
                0,
                Number(
                  previousPost
                    ?.commentCount ??
                    0
                ) - 1
              ),
          })
        )
      } catch (error) {
        console.error(
          '댓글 삭제 실패:',
          error
        )

        window.alert(
          error.message ||
            '댓글을 삭제하지 못했어요.'
        )
      }
    }

  const handleEdit =
    () => {
      if (!post?.mine) {
        return
      }

      setIsActionSheetOpen(
        false
      )

      onEdit?.(
        post
      )
    }

  const handlePostDelete =
    async () => {
      if (
        !post?.mine ||
        isDeleting
      ) {
        return
      }

      const shouldDelete =
        window.confirm(
          '게시글을 삭제하시겠어요?'
        )

      if (!shouldDelete) {
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

      try {
        setIsDeleting(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/community/posts/${post.id}`,
            {
              method: 'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status !==
            204 &&
          !response.ok
        ) {
          throw new Error(
            '게시글을 삭제하지 못했습니다.'
          )
        }

        setIsActionSheetOpen(
          false
        )

        onBack?.()
      } catch (error) {
        console.error(
          '커뮤니티 게시글 삭제 실패:',
          error
        )

        window.alert(
          error.message ||
            '게시글을 삭제하지 못했어요.'
        )
      } finally {
        setIsDeleting(false)
      }
    }

  const handleReportOpen =
    () => {
      if (
        !post ||
        post.mine
      ) {
        return
      }

      setIsActionSheetOpen(
        false
      )

      setIsReportSheetOpen(
        true
      )
    }

  const handleReportSubmit =
    async (
      reason
    ) => {
      if (
        !post ||
        post.mine ||
        isReporting
      ) {
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

      try {
        setIsReporting(
          true
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/community/reports/posts/${post.id}`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  reason,
                  detail: null,
                }),
            }
          )

        if (!response.ok) {

          let errorMessage =
            '신고를 접수하지 못했습니다.'

          try {
            const errorBody =
              await response.json()

            errorMessage =
              errorBody.message ||
              errorBody.error ||
              errorMessage
          } catch {
            // JSON 응답이 아니면 기본 문구 사용
          }

          throw new Error(
            errorMessage
          )
        }

        setIsReportSheetOpen(
          false
        )

        window.alert(
          '신고가 접수됐어요. 관리자가 확인 후 필요한 조치를 진행할게요.'
        )
      } catch (error) {
        console.error(
          '커뮤니티 게시글 신고 실패:',
          error
        )

        window.alert(
          error.message ||
            '신고를 접수하지 못했어요.'
        )
      } finally {
        setIsReporting(
          false
        )
      }
    }

  const handleBlockUser =
    async () => {
      if (
        !post ||
        post.mine ||
        isBlocking
      ) {
        return
      }

      const blockedUsername =
        post.authorUsername

      if (!blockedUsername) {
        window.alert(
          '차단할 사용자 정보를 찾을 수 없어요.'
        )

        return
      }

      const displayName =
        post.authorNickname ||
        blockedUsername

      const shouldBlock =
        window.confirm(
          `${displayName}님을 차단할까요?\n차단하면 이 사용자의 커뮤니티 글과 댓글이 보이지 않아요.`
        )

      if (!shouldBlock) {
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

      try {
        setIsBlocking(
          true
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/community/blocks/${encodeURIComponent(
              blockedUsername
            )}`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status !== 204 &&
          !response.ok
        ) {
          throw new Error(
            '사용자를 차단하지 못했습니다.'
          )
        }

        setIsActionSheetOpen(
          false
        )

        window.alert(
          `${displayName}님을 차단했어요.`
        )

        /*
         * 차단한 사용자의 현재 글도
         * 즉시 화면에서 벗어나도록 이전 화면으로 이동
         */
        onBack?.()
      } catch (error) {
        console.error(
          '커뮤니티 사용자 차단 실패:',
          error
        )

        window.alert(
          error.message ||
            '사용자를 차단하지 못했어요.'
        )
      } finally {
        setIsBlocking(
          false
        )
      }
    }

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  if (!post) {
    return null
  }

  const imageUrls =
    Array.isArray(
      post.imageUrls
    )
      ? post.imageUrls
      : []

  return (
    <div className="community-detail-page">
      <header className="community-detail-header">
        <button
          className="community-detail-back-button"
          type="button"
          onClick={onBack}
          aria-label="커뮤니티로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          커뮤니티
        </h1>
      </header>

      <main className="community-detail-content">
        <article className="community-detail-post">
          <div className="community-detail-author-row">
            <img
              className="community-detail-author-profile"
              src={getProfileImage(
                post.authorUsername,
                post.authorProfileImageUrl
              )}
              alt=""
            />

            <div className="community-detail-author-text">
              <strong>
                {post.authorNickname ||
                  post.authorUsername ||
                  '닉네임'}
              </strong>

              <time>
                {formatCreatedAt(
                  post.createdAt
                )}
              </time>
            </div>

            <button
              className="community-detail-more-button"
              type="button"
              onClick={() =>
                setIsActionSheetOpen(
                  true
                )
              }
              aria-label={
                post.mine
                  ? '게시글 관리 메뉴 열기'
                  : '게시글 신고 또는 차단 메뉴 열기'
              }
            >
              <MoreVertical />
            </button>
          </div>

          <h2 className="community-detail-title">
            {post.title}
          </h2>

          {imageUrls.length > 0 && (
            <div className="community-detail-images">
              {imageUrls.map(
                (
                  imageUrl,
                  index
                ) => (
                  <img
                    key={`${imageUrl}-${index}`}
                    src={resolveMediaUrl(
                      imageUrl
                    )}
                    alt={`게시글 사진 ${
                      index + 1
                    }`}
                  />
                )
              )}
            </div>
          )}

          <p className="community-detail-body">
            {post.content}
          </p>

          <div className="community-detail-engagement">
            <button
              className={`community-detail-like-button ${
                post.likedByMe
                  ? 'liked'
                  : ''
              }`}
              type="button"
              onClick={
                handleLike
              }
              disabled={
                isLikeProcessing
              }
              aria-label={
                post.likedByMe
                  ? '좋아요 취소'
                  : '좋아요'
              }
            >
              <Heart
                fill={
                  post.likedByMe
                    ? 'currentColor'
                    : 'none'
                }
              />

              <span>
                {post.likeCount ??
                  0}
              </span>
            </button>

            <div className="community-detail-comment-count">
              <MessageCircle />

              <span>
                {post.commentCount ??
                  0}
              </span>
            </div>
          </div>
        </article>

        <section className="community-comment-section">
          <h3>
            댓글 {comments.length}
          </h3>

          <form
            className="community-comment-form"
            onSubmit={
              handleCommentSubmit
            }
          >
            <input
              type="text"
              value={
                commentText
              }
              onChange={(
                event
              ) =>
                setCommentText(
                  event.target.value
                )
              }
              placeholder="댓글을 입력해 주세요."
              maxLength={1000}
              disabled={
                isCommentSubmitting
              }
            />

            <button
              type="submit"
              disabled={
                isCommentSubmitting
              }
            >
              등록
            </button>
          </form>

          <div className="community-comment-list">
            {comments.length > 0 ? (
              comments.map(
                (comment) => (
                  <article
                    className="community-comment-item"
                    key={
                      comment.id
                    }
                  >
                    <div className="community-comment-top">
                      <div className="community-comment-author-area">
                        <img
                          className="community-comment-profile"
                          src={getProfileImage(
                            comment.authorUsername,
                            comment.authorProfileImageUrl
                          )}
                          alt=""
                        />

                        <div className="community-comment-author-text">
                          <strong>
                            {comment.authorNickname ||
                              comment.authorUsername ||
                              '닉네임'}
                          </strong>

                          <time>
                            {formatCreatedAt(
                              comment.createdAt
                            )}
                          </time>
                        </div>
                      </div>

                      {comment.deletable && (
                        <button
                          type="button"
                          onClick={() =>
                            handleCommentDelete(
                              comment.id
                            )
                          }
                          aria-label="댓글 삭제"
                        >
                          <Trash2 />
                        </button>
                      )}
                    </div>

                    <p>
                      {comment.content}
                    </p>
                  </article>
                )
              )
            ) : (
              <p className="community-comment-empty">
                아직 댓글이 없어요.
              </p>
            )}
          </div>
        </section>
      </main>

      {isActionSheetOpen && (
        <div
          className="community-post-action-overlay"
          onClick={() =>
            setIsActionSheetOpen(
              false
            )
          }
        >
          <div
            className="community-post-action-area"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >
            <div className="community-post-action-group">
              {post.mine ? (
                <>
                  <button
                    className="community-post-action-button"
                    type="button"
                    onClick={
                      handleEdit
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    게시글 수정
                  </button>

                  <button
                    className="community-post-action-button community-post-delete-button"
                    type="button"
                    onClick={
                      handlePostDelete
                    }
                    disabled={
                      isDeleting
                    }
                  >
                    {isDeleting
                      ? '삭제 중...'
                      : '게시글 삭제'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="community-post-action-button community-post-report-button"
                    type="button"
                    onClick={
                      handleReportOpen
                    }
                    disabled={
                      isReporting ||
                      isBlocking
                    }
                  >
                    신고하기
                  </button>

                  <button
                    className="community-post-action-button community-post-block-button"
                    type="button"
                    onClick={
                      handleBlockUser
                    }
                    disabled={
                      isReporting ||
                      isBlocking
                    }
                  >
                    {isBlocking
                      ? '차단 중...'
                      : '차단하기'}
                  </button>
                </>
              )}
            </div>

            <button
              className="community-post-action-cancel-button"
              type="button"
              onClick={() =>
                setIsActionSheetOpen(
                  false
                )
              }
              disabled={
                isDeleting ||
                isReporting ||
                isBlocking
              }
            >
              취소
            </button>
          </div>
        </div>
      )}

      {isReportSheetOpen && (
        <div
          className="community-report-overlay"
          onClick={() => {
            if (!isReporting) {
              setIsReportSheetOpen(
                false
              )
            }
          }}
        >
          <section
            className="community-report-sheet"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
            aria-label="신고 사유 선택"
          >
            <div className="community-report-sheet-header">
              <strong>
                신고 사유를 선택해 주세요
              </strong>

              <span>
                신고 내용은 관리자에게 전달돼요.
              </span>
            </div>

            <div className="community-report-reason-list">
              <button
                type="button"
                onClick={() =>
                  handleReportSubmit(
                    'ABUSE'
                  )
                }
                disabled={
                  isReporting
                }
              >
                욕설·비방·괴롭힘
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReportSubmit(
                    'SPAM'
                  )
                }
                disabled={
                  isReporting
                }
              >
                광고·홍보·도배
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReportSubmit(
                    'INAPPROPRIATE'
                  )
                }
                disabled={
                  isReporting
                }
              >
                부적절한 내용
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReportSubmit(
                    'FALSE_INFORMATION'
                  )
                }
                disabled={
                  isReporting
                }
              >
                허위 정보
              </button>

              <button
                type="button"
                onClick={() =>
                  handleReportSubmit(
                    'OTHER'
                  )
                }
                disabled={
                  isReporting
                }
              >
                기타
              </button>
            </div>

            <button
              className="community-report-cancel-button"
              type="button"
              onClick={() =>
                setIsReportSheetOpen(
                  false
                )
              }
              disabled={
                isReporting
              }
            >
              {isReporting
                ? '신고 접수 중...'
                : '취소'}
            </button>
          </section>
        </div>
      )}
    </div>
  )
}

export default CommunityDetail
