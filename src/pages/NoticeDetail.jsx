import { ArrowLeft } from 'lucide-react'
import {
  useEffect,
  useState,
} from 'react'

import './NoticeDetail.css'

const API_BASE_URL =
  'http://localhost:8080'

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

function NoticeDetail({
  noticeId,
  onBack,
}) {
  const [notice, setNotice] =
    useState(null)

  const [isLoading, setIsLoading] =
    useState(true)

  const [loadError, setLoadError] =
    useState('')

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadNotice = async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setLoadError(
          '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
        )
        setIsLoading(false)
        return
      }

      if (!noticeId) {
        setLoadError(
          '선택한 공지사항을 찾을 수 없어요.'
        )
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError('')

        const response = await fetch(
          `${API_BASE_URL}/api/notices/${noticeId}`,
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

        if (response.status === 404) {
          throw new Error(
            '삭제되었거나 찾을 수 없는 공지사항이에요.'
          )
        }

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

        const responseNotice =
          await response.json()

        setNotice(responseNotice)
      } catch (error) {
        if (
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(
          '공지사항 상세 내용을 불러오지 못했습니다.',
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

    loadNotice()

    return () => {
      abortController.abort()
    }
  }, [noticeId])

  return (
    <div className="notice-detail-page">
      <div className="notice-detail-inner">
        <header className="notice-detail-header">
          <button
            className="notice-detail-back-button"
            type="button"
            onClick={onBack}
            aria-label="공지사항 목록으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="notice-detail-page-title">
            공지사항
          </h1>
        </header>

        <main className="notice-detail-content">
          {isLoading ? (
            <article className="notice-detail-article">
              <p className="notice-detail-body">
                공지사항을 불러오는 중이에요.
              </p>
            </article>
          ) : loadError ? (
            <article className="notice-detail-article">
              <p className="notice-detail-body">
                {loadError}
              </p>
            </article>
          ) : notice ? (
            <article className="notice-detail-article">
              <header className="notice-detail-information">
                <div className="notice-detail-title-row">
                  {notice.important && (
                    <span className="notice-detail-important">
                      중요
                    </span>
                  )}

                  <h2 className="notice-detail-title">
                    {notice.title}
                  </h2>
                </div>

                <time className="notice-detail-date">
                  {formatNoticeDate(
                    notice.createdAt
                  )}
                </time>
              </header>

              <div className="notice-detail-divider" />

              <p className="notice-detail-body">
                {notice.content}
              </p>
            </article>
          ) : null}
        </main>
      </div>
    </div>
  )
}

export default NoticeDetail