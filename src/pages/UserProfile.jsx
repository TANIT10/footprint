import {
  useEffect,
  useState,
} from 'react'
import { ArrowLeft } from 'lucide-react'

import './PostList.css'
import './UserProfile.css'

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

function UserProfile({
  username,
  nickname,
  profileImage,
  posts = [],
  onBack,
  onPostSelect,
}) {
  const postsPerPage = 30

  const [
    currentPage,
    setCurrentPage,
  ] = useState(1)

  const userPosts = posts.filter(
    (post) =>
      post.author === username
  )

  const totalPages = Math.ceil(
    userPosts.length / postsPerPage
  )

  const startIndex =
    (currentPage - 1) *
    postsPerPage

  const visiblePosts =
    userPosts.slice(
      startIndex,
      startIndex + postsPerPage
    )

  useEffect(() => {
    setCurrentPage(1)
  }, [username])

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

  return (
    <div className="user-profile-page">
      <div className="user-profile-inner">
        <header className="user-profile-header">
          <button
            className="user-profile-back-button"
            type="button"
            onClick={onBack}
            aria-label="이전 화면으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="user-profile-title">
            프로필
          </h1>
        </header>

        <main className="user-profile-content">
          <section className="user-profile-information">
            <span className="user-profile-image-box">
              <img
                className={
                  profileImage
                    ? 'user-profile-image'
                    : 'user-profile-default-image'
                }
                src={
                  profileImage ||
                  footprint
                }
                alt={`${nickname || '사용자'} 프로필`}
              />
            </span>

            <div className="user-profile-name-area">
              <strong className="user-profile-nickname">
                {nickname || '닉네임'}
              </strong>

              <span className="user-profile-message">
                  우리 함께 발자국을 이어가요. 🐾
              </span>
            </div>
          </section>

          <div className="user-profile-divider" />

          <section className="user-profile-post-section">
            <div className="user-profile-post-title-row">
              <h2>작성한 게시글</h2>

              <span>
                {userPosts.length}
              </span>
            </div>

            {userPosts.length > 0 ? (
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
                        <article
                          className="user-profile-post-wrapper"
                          key={
                            post.id ??
                            `${startIndex}-${index}`
                          }
                        >
                          <button
                            className="post-card"
                            type="button"
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
                        </article>
                      )
                    }
                  )}
                </div>

                {totalPages > 1 && (
                  <nav
                    className="pagination"
                    aria-label="사용자 게시글 페이지"
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
                              setCurrentPage(
                                pageNumber
                              )
                            }
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
              <section className="user-profile-empty">
                <p>
                  아직 작성한 게시글이 없어요.
                </p>

                <span>
                  이 사용자가 게시글을 작성하면
                  이곳에 표시돼요.
                </span>
              </section>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}

export default UserProfile