import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Star,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import './AdminNotices.css'

const API_BASE_URL = ''

function formatNoticeDate(
  createdAt
) {
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

  return date.toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  )
}

function AdminNotices({
  onBack,
  onNoticeSelect,
  onCreate,
}) {
  const [
    notices,
    setNotices,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  const [
    changingFeaturedId,
    setChangingFeaturedId,
  ] = useState(null)

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadNotices =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          setLoadError(
            '로그인 정보를 찾을 수 없어요.'
          )

          setIsLoading(false)

          return
        }

        try {
          setIsLoading(true)
          setLoadError('')

          const response =
            await fetch(
              `${API_BASE_URL}/api/notices?page=0`,
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

          if (
            response.status === 401
          ) {
            throw new Error(
              '로그인 시간이 만료됐어요.'
            )
          }

          if (
            response.status === 403
          ) {
            throw new Error(
              '관리자 권한을 확인할 수 없어요.'
            )
          }

          if (!response.ok) {
            throw new Error(
              '공지사항을 불러오지 못했어요.'
            )
          }

          const noticePage =
            await response.json()

          setNotices(
            Array.isArray(
              noticePage.notices
            )
              ? noticePage.notices
              : []
          )
        } catch (error) {
          if (
            error.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '관리자 공지사항 조회 실패:',
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
            setIsLoading(false)
          }
        }
      }

    loadNotices()

    return () => {
      abortController.abort()
    }
  }, [])

  /*
   * =========================================
   * 대표 공지 설정
   * =========================================
   */
  const handleSetFeatured =
    async (
      event,
      notice
    ) => {
      /*
       * 카드 클릭 이벤트가 같이 실행되어
       * 공지 상세로 이동하는 것을 막습니다.
       */
      event.stopPropagation()

      if (
        changingFeaturedId !==
        null
      ) {
        return
      }

      if (notice.featured) {
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

      const confirmed =
        window.confirm(
          `"${notice.title}" 공지를 상단 대표 공지로 설정할까요?`
        )

      if (!confirmed) {
        return
      }

      try {
        setChangingFeaturedId(
          notice.id
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/notices/${notice.id}/featured`,
            {
              method: 'PUT',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status === 401
        ) {
          throw new Error(
            '로그인 시간이 만료됐어요.'
          )
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            '관리자 권한이 필요해요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '대표 공지를 설정하지 못했어요.'
          )
        }

        /*
         * 서버 저장 성공 후
         * 화면에서도 선택된 공지만 featured=true
         */
        setNotices(
          (previousNotices) =>
            previousNotices.map(
              (
                previousNotice
              ) => ({
                ...previousNotice,

                featured:
                  previousNotice.id ===
                  notice.id,
              })
            )
        )

        window.alert(
          '대표 공지로 설정했어요.'
        )
      } catch (error) {
        console.error(
          '대표 공지 설정 실패:',
          error
        )

        window.alert(
          error.message ||
            '대표 공지를 설정하지 못했어요.'
        )
      } finally {
        setChangingFeaturedId(
          null
        )
      }
    }

  /*
   * =========================================
   * 대표 공지 해제
   * =========================================
   */
  const handleClearFeatured =
    async (
      event,
      notice
    ) => {
      event.stopPropagation()

      if (
        changingFeaturedId !==
        null
      ) {
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

      const confirmed =
        window.confirm(
          `"${notice.title}" 공지를 대표 공지에서 해제할까요?`
        )

      if (!confirmed) {
        return
      }

      try {
        setChangingFeaturedId(
          notice.id
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/notices/featured`,
            {
              method: 'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status === 401
        ) {
          throw new Error(
            '로그인 시간이 만료됐어요.'
          )
        }

        if (
          response.status === 403
        ) {
          throw new Error(
            '관리자 권한이 필요해요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '대표 공지를 해제하지 못했어요.'
          )
        }

        setNotices(
          (previousNotices) =>
            previousNotices.map(
              (
                previousNotice
              ) => ({
                ...previousNotice,

                featured: false,
              })
            )
        )

        window.alert(
          '대표 공지를 해제했어요.'
        )
      } catch (error) {
        console.error(
          '대표 공지 해제 실패:',
          error
        )

        window.alert(
          error.message ||
            '대표 공지를 해제하지 못했어요.'
        )
      } finally {
        setChangingFeaturedId(
          null
        )
      }
    }

  return (
    <div className="admin-notices-page">
      <header className="admin-notices-header">
        <button
          className="admin-notices-back-button"
          type="button"
          onClick={onBack}
          aria-label="관리자 페이지로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          공지사항 관리
        </h1>

        <button
          className="admin-notices-create-button"
          type="button"
          onClick={onCreate}
          aria-label="새 공지사항 작성"
        >
          <Plus />
        </button>
      </header>

      <main className="admin-notices-content">
        {isLoading ? (
          <section className="admin-notices-message">
            <span className="admin-notices-spinner" />

            <p>
              공지사항을 불러오는 중이에요.
            </p>
          </section>
        ) : loadError ? (
          <section className="admin-notices-message">
            <p>
              {loadError}
            </p>
          </section>
        ) : notices.length > 0 ? (
          <section
            className="admin-notices-list"
            aria-label="관리자 공지사항 목록"
          >
            {notices.map(
              (notice) => (
                <div
                  className="admin-notice-card-wrapper"
                  key={notice.id}
                >
                  <button
                    className="admin-notice-card"
                    type="button"
                    onClick={() =>
                      onNoticeSelect?.(
                        notice.id
                      )
                    }
                  >
                    <span className="admin-notice-information">
                      <span className="admin-notice-title-row">
                        {notice.important && (
                          <span className="admin-notice-important-badge">
                            중요
                          </span>
                        )}

                        {notice.featured && (
                          <span className="admin-notice-featured-badge">
                            대표
                          </span>
                        )}

                        <strong>
                          {notice.title}
                        </strong>
                      </span>

                      <span className="admin-notice-summary">
                        {notice.summary}
                      </span>

                      <time>
                        {formatNoticeDate(
                          notice.createdAt
                        )}
                      </time>
                    </span>

                    <ChevronRight
                      className="admin-notice-arrow"
                      aria-hidden="true"
                    />
                  </button>

                  <button
                    className={`admin-notice-featured-button ${
                      notice.featured
                        ? 'active'
                        : ''
                    }`}
                    type="button"
                    onClick={(
                      event
                    ) =>
                      notice.featured
                        ? handleClearFeatured(
                            event,
                            notice
                          )
                        : handleSetFeatured(
                            event,
                            notice
                          )
                    }
                    disabled={
                      changingFeaturedId !==
                      null
                    }
                  >
                    <Star
                      aria-hidden="true"
                    />

                    <span>
                      {changingFeaturedId ===
                      notice.id
                        ? '변경 중...'
                        : notice.featured
                          ? '대표 공지 해제'
                          : '대표로 설정'}
                    </span>
                  </button>
                </div>
              )
            )}
          </section>
        ) : (
          <section className="admin-notices-message">
            <p>
              등록된 공지사항이 없어요.
            </p>

            <span>
              오른쪽 위 + 버튼으로 첫 공지를 작성해 주세요.
            </span>
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminNotices