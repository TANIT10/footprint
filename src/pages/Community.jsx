import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  ArrowUp,
  Heart,
  MessageCircle,
} from 'lucide-react'

import './Community.css'

import LoadingScreen from './LoadingScreen'

import footprint from '../assets/footprint.png'
import bell from '../assets/bell.png'
import resolveMediaUrl from '../utils/mediaUrl'

const API_BASE_URL =
  ''

function Community({
  onBack,
  onWrite,
  onPostSelect,
  onNotifications,
  onNoticeSelect,
  onNoticeList,
  onMyPage,
  hasUnreadNotification = false,
}) {
  const [
    posts,
    setPosts,
  ] = useState([])

  const [
    searchKeyword,
    setSearchKeyword,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  const [
    featuredNotice,
    setFeaturedNotice,
  ] = useState(null)

  const [
    currentPage,
    setCurrentPage,
  ] = useState(0)

  const [
    hasMorePosts,
    setHasMorePosts,
  ] = useState(false)

  const [
    isLoadingMore,
    setIsLoadingMore,
  ] = useState(false)

  const [
    showScrollTop,
    setShowScrollTop,
  ] = useState(false)

  const loadMoreTriggerRef =
    useRef(null)

  const communityPageRef =
    useRef(null)

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadFeaturedNotice =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          setFeaturedNotice(null)
          return
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/notices/banner`,
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
            setFeaturedNotice(null)
            return
          }

          const text =
            await response.text()

          if (!text) {
            setFeaturedNotice(null)
            return
          }

          const notice =
            JSON.parse(text)

          if (!notice?.id) {
            setFeaturedNotice(null)
            return
          }

          setFeaturedNotice(notice)
        } catch (error) {
          if (
            error.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '대표 공지 조회 실패:',
            error
          )

          setFeaturedNotice(null)
        }
      }

    loadFeaturedNotice()

    return () => {
      abortController.abort()
    }
  }, [])

  useEffect(() => {
    const timerId =
      window.setTimeout(
        async () => {
          const token =
            localStorage.getItem(
              'token'
            )

          if (!token) {
            setPosts([])
            setCurrentPage(0)
            setHasMorePosts(false)
            setIsLoading(false)
            setLoadError(
              '로그인 정보를 찾을 수 없어요.'
            )
            return
          }

          try {
            setIsLoading(true)
            setLoadError('')

            const trimmedKeyword =
              searchKeyword.trim()

            const queryString =
              trimmedKeyword
                ? `?page=0&keyword=${encodeURIComponent(
                    trimmedKeyword
                  )}`
                : '?page=0'

            const response =
              await fetch(
                `${API_BASE_URL}/api/community/posts${queryString}`,
                {
                  method: 'GET',
                  headers: {
                    Authorization:
                      `Bearer ${token}`,
                  },
                }
              )

            if (
              response.status === 401 ||
              response.status === 403
            ) {
              throw new Error(
                '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
              )
            }

            if (!response.ok) {
              throw new Error(
                '커뮤니티 글을 불러오지 못했습니다.'
              )
            }

            const responseBody =
              await response.json()

            setPosts(
              Array.isArray(
                responseBody.content
              )
                ? responseBody.content
                : []
            )

            setCurrentPage(
              Number(
                responseBody.number ?? 0
              ) || 0
            )

            setHasMorePosts(
              responseBody.last === false
            )
          } catch (error) {
            console.error(
              '커뮤니티 목록 조회 실패:',
              error
            )

            setPosts([])
            setCurrentPage(0)
            setHasMorePosts(false)

            setLoadError(
              error.message ||
                '커뮤니티 글을 불러오지 못했어요.'
            )
          } finally {
            setIsLoading(false)
          }
        },
        350
      )

    return () => {
      window.clearTimeout(
        timerId
      )
    }
  }, [searchKeyword])

  useEffect(() => {
    const triggerElement =
      loadMoreTriggerRef.current

    const pageElement =
      communityPageRef.current

    if (
      !triggerElement ||
      !pageElement ||
      !hasMorePosts ||
      isLoading ||
      isLoadingMore ||
      loadError
    ) {
      return undefined
    }

    const observer =
      new IntersectionObserver(
        (entries) => {
          const firstEntry =
            entries[0]

          if (
            !firstEntry?.isIntersecting
          ) {
            return
          }

          const loadNextPage =
            async () => {
              const token =
                localStorage.getItem(
                  'token'
                )

              if (!token) {
                return
              }

              try {
                setIsLoadingMore(
                  true
                )

                const nextPage =
                  currentPage + 1

                const trimmedKeyword =
                  searchKeyword.trim()

                const queryString =
                  trimmedKeyword
                    ? `?page=${nextPage}&keyword=${encodeURIComponent(
                        trimmedKeyword
                      )}`
                    : `?page=${nextPage}`

                const response =
                  await fetch(
                    `${API_BASE_URL}/api/community/posts${queryString}`,
                    {
                      method: 'GET',
                      headers: {
                        Authorization:
                          `Bearer ${token}`,
                      },
                    }
                  )

                if (
                  response.status === 401 ||
                  response.status === 403
                ) {
                  throw new Error(
                    '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
                  )
                }

                if (!response.ok) {
                  throw new Error(
                    '다음 커뮤니티 글을 불러오지 못했습니다.'
                  )
                }

                const responseBody =
                  await response.json()

                const nextPosts =
                  Array.isArray(
                    responseBody.content
                  )
                    ? responseBody.content
                    : []

                setPosts(
                  (previousPosts) => {
                    const existingIds =
                      new Set(
                        previousPosts.map(
                          (post) =>
                            post.id
                        )
                      )

                    return [
                      ...previousPosts,
                      ...nextPosts.filter(
                        (post) =>
                          !existingIds.has(
                            post.id
                          )
                      ),
                    ]
                  }
                )

                setCurrentPage(
                  Number(
                    responseBody.number ??
                      nextPage
                  ) || nextPage
                )

                setHasMorePosts(
                  responseBody.last ===
                    false
                )
              } catch (error) {
                console.error(
                  '커뮤니티 추가 목록 조회 실패:',
                  error
                )
              } finally {
                setIsLoadingMore(
                  false
                )
              }
            }

          loadNextPage()
        },
        {
          root: pageElement,
          rootMargin:
            '0px 0px 260px 0px',
          threshold: 0.01,
        }
      )

    observer.observe(
      triggerElement
    )

    return () => {
      observer.disconnect()
    }
  }, [
    currentPage,
    hasMorePosts,
    isLoading,
    isLoadingMore,
    loadError,
    searchKeyword,
  ])

  const handleCommunityScroll =
    (event) => {
      setShowScrollTop(
        event.currentTarget.scrollTop >
          20
      )
    }

  const handleScrollToTop = () => {
    communityPageRef.current
      ?.scrollTo({
        top: 0,
        behavior: 'smooth',
      })

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

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

      const now =
        new Date()

      const difference =
        now.getTime() -
        date.getTime()

      const minutes =
        Math.floor(
          difference /
            (1000 * 60)
        )

      const hours =
        Math.floor(
          difference /
            (1000 * 60 * 60)
        )

      const days =
        Math.floor(
          difference /
            (1000 * 60 * 60 * 24)
        )

      if (minutes < 1) {
        return '방금 전'
      }

      if (minutes < 60) {
        return `${minutes}분 전`
      }

      if (hours < 24) {
        return `${hours}시간 전`
      }

      if (days < 7) {
        return `${days}일 전`
      }

      return date.toLocaleDateString(
        'ko-KR',
        {
          month: '2-digit',
          day: '2-digit',
        }
      )
    }

  const handleNoticeOpen = () => {
    onNoticeList?.()
  }

  const handlePostKeyDown = (
    event,
    postId
  ) => {
    if (
      event.key === 'Enter' ||
      event.key === ' '
    ) {
      event.preventDefault()

      onPostSelect?.(
        postId
      )
    }
  }

  if (isLoading) {
    return (
      <LoadingScreen />
    )
  }

  return (
    <div
      className="community-page"
      ref={communityPageRef}
      onScroll={
        handleCommunityScroll
      }
    >
      <div className="community-inner">
        <header className="community-header">
          <button
            className="community-back-button"
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            ←
          </button>

          <h1 className="community-title">
            커뮤니티
          </h1>

          <button
            className="community-notification-button"
            type="button"
            onClick={onNotifications}
            aria-label={
              hasUnreadNotification
                ? '알림, 읽지 않은 알림 있음'
                : '알림'
            }
          >
            <img
              className="community-notification-icon"
              src={bell}
              alt=""
            />

            {hasUnreadNotification && (
              <span
                className="community-notification-badge"
                aria-hidden="true"
              />
            )}
          </button>
        </header>

        <main className="community-content">
          <div className="community-search-box">
            <input
              className="community-search-input"
              type="search"
              value={searchKeyword}
              onChange={(
                event
              ) =>
                setSearchKeyword(
                  event.target.value
                )
              }
              placeholder="글 제목이나 내용을 검색해보세요"
              aria-label="커뮤니티 게시글 검색"
            />
          </div>

          {featuredNotice && (
            <section
              className="community-notice"
              role="button"
              tabIndex={0}
              onClick={
                handleNoticeOpen
              }
              onKeyDown={(
                event
              ) => {
                if (
                  event.key === 'Enter' ||
                  event.key === ' '
                ) {
                  event.preventDefault()

                  handleNoticeOpen()
                }
              }}
              aria-label={`${featuredNotice.title} 공지사항 목록 보기`}
            >
              <span className="community-notice-badge">
                공지
              </span>

              <strong className="community-notice-title">
                {featuredNotice.title}
              </strong>

              <span
                className="community-notice-arrow"
                aria-hidden="true"
              >
                ›
              </span>
            </section>
          )}

          {loadError ? (
            <section className="community-empty">
              <p>
                {loadError}
              </p>
            </section>
          ) : posts.length > 0 ? (
            <section className="community-post-list">
              {posts.map(
                (post) => {
                  const imageUrls =
                    Array.isArray(
                      post.imageUrls
                    )
                      ? post.imageUrls
                      : []

                  const representativeImage =
                    imageUrls[0] ?? ''

                  const likeCount =
                    Number(
                      post.likeCount ?? 0
                    ) || 0

                  const commentCount =
                    Number(
                      post.commentCount ?? 0
                    ) || 0

                  return (
                    <article
                      className="community-post-card"
                      key={post.id}
                      role="button"
                      tabIndex={0}
                      onClick={() =>
                        onPostSelect?.(
                          post.id
                        )
                      }
                      onKeyDown={(
                        event
                      ) =>
                        handlePostKeyDown(
                          event,
                          post.id
                        )
                      }
                      aria-label={`${post.title} 게시글 상세 보기`}
                    >
                      <div className="community-post-info">
                        <div className="community-post-meta">
                          <span className="community-post-author">
                            {post.authorNickname ||
                              post.authorUsername ||
                              '닉네임'}
                          </span>

                          <span className="community-post-meta-divider">
                            ·
                          </span>

                          <time className="community-post-time">
                            {formatCreatedAt(
                              post.createdAt
                            )}
                          </time>
                        </div>

                        <h2 className="community-post-title">
                          {post.title}
                        </h2>

                        <div
                          className="community-post-engagement"
                          aria-label={`좋아요 ${likeCount}개, 댓글 ${commentCount}개`}
                        >
                          <span className="community-post-engagement-item">
                            <Heart
                              aria-hidden="true"
                            />

                            <span>
                              {likeCount}
                            </span>
                          </span>

                          <span className="community-post-engagement-item">
                            <MessageCircle
                              aria-hidden="true"
                            />

                            <span>
                              {commentCount}
                            </span>
                          </span>
                        </div>
                      </div>

                      {representativeImage && (
                        <div className="community-post-image-box">
                          <img
                            className="community-post-image"
                            src={resolveMediaUrl(
                              representativeImage
                            )}
                            alt=""
                          />
                        </div>
                      )}
                    </article>
                  )
                }
              )}
              <div
                className="community-load-more-trigger"
                ref={loadMoreTriggerRef}
                aria-hidden="true"
              />

              {isLoadingMore && (
                <div
                  className="community-load-more"
                  role="status"
                  aria-label="게시글 더 불러오는 중"
                >
                  <span className="community-load-more-spinner" />
                </div>
              )}
            </section>
          ) : (
            <section className="community-empty">
              <p>
                {searchKeyword.trim()
                  ? '검색 결과가 없어요.'
                  : '아직 등록된 커뮤니티 글이 없어요.'}
              </p>

              {!searchKeyword.trim() && (
                <span>
                  첫 번째 이야기를 남겨보세요.
                </span>
              )}
            </section>
          )}
        </main>

        {showScrollTop && (
          <button
            className="community-scroll-top-button"
            type="button"
            onClick={handleScrollToTop}
            aria-label="맨 위로 이동"
          >
            <ArrowUp
              aria-hidden="true"
            />
          </button>
        )}

        <button
          className="community-my-page-button"
          type="button"
          onClick={onMyPage}
          aria-label="내 페이지로 이동"
        >
          내
          <br />
          페이지
        </button>

        <button
          className="community-write-button"
          type="button"
          onClick={onWrite}
          aria-label="커뮤니티 글쓰기"
        >
          <img
            className="community-write-icon"
            src={footprint}
            alt=""
          />

          <span>
            글쓰기
          </span>
        </button>
      </div>
    </div>
  )
}

export default Community
