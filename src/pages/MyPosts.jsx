import { useEffect, useState } from 'react'
import { ArrowLeft, MoreVertical } from 'lucide-react'

import './PostList.css'
import './MyPosts.css'

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

function MyPosts({
  posts = [],
  currentUsername,
  onBack,
  onPostSelect,
  onPostDelete,
  onPostEdit,
}) {
  const postsPerPage = 30

  const [currentPage, setCurrentPage] = useState(1)
  const [menuPost, setMenuPost] = useState(null)

  const myPosts = posts.filter(
    (post) => post.author === currentUsername
  )

  const totalPages = Math.ceil(
    myPosts.length / postsPerPage
  )

  const startIndex =
    (currentPage - 1) * postsPerPage

  const visiblePosts = myPosts.slice(
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
  }, [currentPage, totalPages])

  const handleMenuOpen = (event, post) => {
    event.stopPropagation()
    setMenuPost(post)
  }

  const handleMenuClose = () => {
    setMenuPost(null)
  }

  const handleEdit = () => {
    if (!menuPost) {
      return
    }

    onPostEdit?.(menuPost.id)
    setMenuPost(null)
  }

  const handleDelete = () => {
    if (!menuPost) {
      return
    }

    const shouldDelete = window.confirm(
      '이 게시글을 삭제할까요?\n삭제한 게시글은 복구할 수 없어요.'
    )

    if (!shouldDelete) {
      return
    }

    onPostDelete?.(menuPost.id)
    setMenuPost(null)
  }

  return (
    <div className="my-posts-page">
      <div className="my-posts-inner">
        <header className="my-posts-header">
          <button
            className="my-posts-back-button"
            type="button"
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="my-posts-title">
            내가 작성한 게시글
          </h1>
        </header>

        <main className="my-posts-content">
          {myPosts.length > 0 ? (
            <>
              <div className="post-grid">
                {visiblePosts.map((post, index) => {
                  const typeInfo =
                    POST_TYPE_INFO[post.postType] ??
                    POST_TYPE_INFO.MISSING

                  return (
                    <article
                      className="my-post-card-wrapper"
                      key={
                        post.id ??
                        `${startIndex}-${index}`
                      }
                    >
                      <button
                        className="post-card"
                        type="button"
                        onClick={() =>
                          onPostSelect(post.id)
                        }
                        aria-label={`${
                          post.breed || '동물'
                        } 게시글 상세 보기`}
                      >
                        <div className="post-card-status">
                          <img
                            className={`post-status-image ${
                              post.postType === 'RETURNED'
                                ? 'returned-status-image'
                                : post.postType === 'SIGHTED'
                                  ? 'sighted-status-image'
                                  : ''
                            }`}
                            src={typeInfo.image}
                            alt={typeInfo.label}
                          />
                        </div>

                        <div className="post-card-image-box">
                          {post.representativeImage ? (
                            <img
                              className="post-card-image"
                              src={post.representativeImage}
                              alt={`${
                                post.breed || '동물'
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
                            {post.breed || '품종 미상'}
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

                      <button
                        className="my-post-menu-button"
                        type="button"
                        onClick={(event) =>
                          handleMenuOpen(event, post)
                        }
                        aria-label="게시글 메뉴 열기"
                      >
                        <MoreVertical />
                      </button>
                    </article>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <nav
                  className="pagination"
                  aria-label="내 게시글 페이지"
                >
                  {Array.from(
                    { length: totalPages },
                    (_, index) => {
                      const pageNumber = index + 1

                      return (
                        <button
                          className={
                            currentPage === pageNumber
                              ? 'active-page'
                              : ''
                          }
                          type="button"
                          key={pageNumber}
                          onClick={() =>
                            setCurrentPage(pageNumber)
                          }
                          aria-current={
                            currentPage === pageNumber
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
            <section className="my-posts-empty">
              <p>아직 작성한 게시글이 없어요.</p>

              <span>
                게시글을 작성하면 이곳에서 확인할 수 있어요.
              </span>
            </section>
          )}
        </main>

        {menuPost && (
          <div
            className="my-post-menu-background"
            onClick={handleMenuClose}
          >
            <section
              className="my-post-action-sheet"
              onClick={(event) => event.stopPropagation()}
              aria-label="게시글 관리 메뉴"
            >
              <button
                type="button"
                onClick={handleEdit}
              >
                게시글 수정
              </button>

              <button
                className="my-post-delete-button"
                type="button"
                onClick={handleDelete}
              >
                게시글 삭제
              </button>

              <button
                className="my-post-cancel-button"
                type="button"
                onClick={handleMenuClose}
              >
                취소
              </button>
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPosts