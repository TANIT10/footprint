import {
  useEffect,
  useState,
} from 'react'

import './PostList.css'

import logo from '../assets/logo.png'
import bell from '../assets/bell.png'
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

function PostList({
  posts = [],
  onWrite,
  onPostSelect,
  onMyPage,
  onNotifications,
  hasUnreadNotification,
}) {
  /*
   * 게시글은 한 페이지에 최대 50개 표시
   */
  const postsPerPage = 50

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const totalPages = Math.ceil(
    posts.length / postsPerPage
  )

  const startIndex =
    (currentPage - 1) *
    postsPerPage

  const visiblePosts = posts.slice(
    startIndex,
    startIndex + postsPerPage
  )

  useEffect(() => {
    if (totalPages === 0) {
      setCurrentPage(1)
      return
    }

    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [
    currentPage,
    totalPages,
  ])

  /*
   * 페이지 번호를 누르면 해당 페이지로 이동한 뒤
   * 게시글 목록 맨 위로 부드럽게 올라감
   */
  const handlePageChange = (
    pageNumber
  ) => {
    setCurrentPage(pageNumber)

    window.requestAnimationFrame(
      () => {
        const postListPage =
          document.querySelector(
            '.post-list-page'
          )

        if (postListPage) {
          postListPage.scrollTo({
            top: 0,
            behavior: 'smooth',
          })
          return
        }

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        })
      }
    )
  }

  return (
    <div className="post-list-page">
      <div className="post-list-inner">
        <header className="post-list-header">
          <img
            className="post-list-logo"
            src={logo}
            alt="발자국 로고"
          />

          <button
            className="notification-button"
            type="button"
            onClick={onNotifications}
            aria-label={
              hasUnreadNotification
                ? '알림, 읽지 않은 알림 있음'
                : '알림'
            }
          >
            <img
              className="notification-icon"
              src={bell}
              alt=""
            />

            {hasUnreadNotification && (
              <span
                className="notification-badge"
                aria-hidden="true"
              />
            )}
          </button>
        </header>

        <main className="post-list-content">
          {posts.length > 0 ? (
            <>
              <div className="post-grid">
                {visiblePosts.map(
                  (post, index) => {
                    const typeInfo =
                      POST_TYPE_INFO[
                        post.postType
                      ] ??
                      POST_TYPE_INFO.MISSING

                    return (
                      <button
                        className="post-card"
                        type="button"
                        key={
                          post.id ??
                          `${startIndex}-${index}`
                        }
                        onClick={() =>
                          onPostSelect?.(
                            post.id
                          )
                        }
                        aria-label={`${
                          post.breed ||
                          '동물'
                        } 게시글 상세 보기`}
                      >
                        <div className="post-card-status">
                          <img
                            className={`post-status-image ${
                              post.postType ===
                              'RETURNED'
                                ? 'returned-status-image'
                                : post.postType ===
                                    'SIGHTED'
                                  ? 'sighted-status-image'
                                  : ''
                            }`}
                            src={
                              typeInfo.image
                            }
                            alt={
                              typeInfo.label
                            }
                          />
                        </div>

                        <div className="post-card-image-box">
                          {post.representativeImage ? (
                            <img
                              className="post-card-image"
                              src={
                                post.representativeImage
                              }
                              alt={`${
                                post.breed ||
                                '동물'
                              } 대표 사진`}
                            />
                          ) : (
                            <div className="post-card-no-image">
                              사진 없음
                            </div>
                          )}
                        </div>

                        <div className="post-card-information">
                          <strong className="post-card-breed">
                            {post.breed ||
                              '품종 미상'}
                          </strong>

                          <p className="post-card-location">
                            {post.location ||
                              '장소 정보 없음'}
                          </p>

                          <time className="post-card-date">
                            {post.date ||
                              '날짜 정보 없음'}
                          </time>
                        </div>
                      </button>
                    )
                  }
                )}
              </div>

              {totalPages > 1 && (
                <nav
                  className="pagination"
                  aria-label="게시글 페이지"
                >
                  {Array.from(
                    {
                      length:
                        totalPages,
                    },
                    (_, index) => {
                      const pageNumber =
                        index + 1

                      return (
                        <button
                          className={
                            currentPage ===
                            pageNumber
                              ? 'active-page'
                              : ''
                          }
                          type="button"
                          key={pageNumber}
                          onClick={() =>
                            handlePageChange(
                              pageNumber
                            )
                          }
                          aria-label={`${pageNumber}페이지로 이동`}
                          aria-current={
                            currentPage ===
                            pageNumber
                              ? 'page'
                              : undefined
                          }
                        >
                          {pageNumber}
                        </button>
                      )
                    }
                  )}
                </nav>
              )}
            </>
          ) : (
            <section className="post-list-empty">
              <p>
                아직 등록된 게시글이 없어요.
              </p>

              <span>
                첫 번째 발자국을 남겨보세요.
              </span>
            </section>
          )}
        </main>

        <aside
          className="post-side-menu"
          aria-label="빠른 메뉴"
        >
          <button
            className="side-menu-button my-page-button"
            type="button"
            onClick={onMyPage}
            aria-label="내 페이지로 이동"
          >
            내
            <br />
            페이지
          </button>

          <button
            className="side-menu-button write-button"
            type="button"
            onClick={onWrite}
            aria-label="게시글 작성"
          >
            <img
              className="paw-icon"
              src={footprint}
              alt=""
            />

            <span>글쓰기</span>
          </button>
        </aside>
      </div>
    </div>
  )
}

export default PostList