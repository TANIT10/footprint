import {
  ArrowLeft,
  ChevronRight,
  Plus,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import './AdminNotices.css'

const API_BASE_URL =
  'http://localhost:8080'

function formatNoticeDate(
  createdAt
) {
  if (!createdAt) {
    return ''
  }

  const date =
    new Date(
      createdAt
    )

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
            setIsLoading(
              false
            )
          }
        }
      }

    loadNotices()

    return () => {
      abortController.abort()
    }
  }, [])

  return (
    <div className="admin-notices-page">
      <header className="admin-notices-header">
        <button
          className="admin-notices-back-button"
          type="button"
          onClick={
            onBack
          }
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
          onClick={
            onCreate
          }
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
              (
                notice
              ) => (
                <button
                  className="admin-notice-card"
                  type="button"
                  key={
                    notice.id
                  }
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
