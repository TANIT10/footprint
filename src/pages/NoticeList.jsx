import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import './NoticeList.css'

const API_BASE_URL =
  ''

function formatNoticeDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
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

function NoticeList({
  onBack,
  onNoticeSelect,
}) {
  const [noticeItems, setNoticeItems] =
    useState([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadNotices = async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setLoadError(
          '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
        )
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError('')

        const response = await fetch(
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
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐어요. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '공지사항을 불러오지 못했어요.'
          )
        }

        const noticePage =
          await response.json()

        setNoticeItems(
          Array.isArray(
            noticePage.notices
          )
            ? noticePage.notices
            : []
        )
      } catch (error) {
        if (
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(
          '공지사항을 불러오지 못했습니다.',
          error
        )

        setLoadError(
          error.message ||
            '공지사항을 불러오지 못했어요.'
        )
      } finally {
        if (
          !abortController.signal.aborted
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

  return (
    <div className="notice-list-page">
      <div className="notice-list-inner">
        <header className="notice-list-header">
          <button
            className="notice-list-back-button"
            type="button"
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="notice-list-title">
            공지사항
          </h1>
        </header>

        <main className="notice-list-content">
          {isLoading ? (
            <section className="notice-list-empty">
              <p>
                공지사항을 불러오는 중이에요.
              </p>
            </section>
          ) : loadError ? (
            <section className="notice-list-empty">
              <p>{loadError}</p>

              <span>
                잠시 후 다시 시도해 주세요.
              </span>
            </section>
          ) : noticeItems.length > 0 ? (
            <section
              className="notice-list"
              aria-label="공지사항 목록"
            >
              {noticeItems.map(
                (notice) => (
                  <button
                    className="notice-list-item"
                    type="button"
                    key={notice.id}
                    onClick={() =>
                      onNoticeSelect?.(
                        notice.id
                      )
                    }
                  >
                    <span className="notice-list-information">
                      <span className="notice-title-row">
                        {notice.important && (
                          <span className="important-label">
                            중요
                          </span>
                        )}

                        <strong className="notice-item-title">
                          {notice.title}
                        </strong>
                      </span>

                      <span className="notice-item-summary">
                        {notice.summary}
                      </span>

                      <time className="notice-item-date">
                        {formatNoticeDate(
                          notice.createdAt
                        )}
                      </time>
                    </span>

                    <ChevronRight
                      className="notice-list-arrow"
                      aria-hidden="true"
                    />
                  </button>
                )
              )}
            </section>
          ) : (
            <section className="notice-list-empty">
              <p>
                등록된 공지사항이 없어요.
              </p>

              <span>
                새로운 소식이 생기면
                알려드릴게요.
              </span>
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default NoticeList