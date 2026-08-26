import {
  ArrowLeft,
  Pencil,
  Trash2,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import './AdminNoticeDetail.css'

const API_BASE_URL =
  ''

function formatDateTime(value) {
  if (!value) {
    return ''
  }

  const date =
    new Date(value)

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

function AdminNoticeDetail({
  noticeId,
  onBack,
  onEdit,
  onDeleted,
}) {
  const [
    notice,
    setNotice,
  ] = useState(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isDeleting,
    setIsDeleting,
  ] = useState(false)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadNotice =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (
          !token ||
          !noticeId
        ) {
          setLoadError(
            '공지사항 정보를 찾을 수 없어요.'
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

          const response =
            await fetch(
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

          if (!response.ok) {
            throw new Error(
              '공지사항을 불러오지 못했어요.'
            )
          }

          setNotice(
            await response.json()
          )
        } catch (error) {
          if (
            error.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '관리자 공지 상세 조회 실패:',
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

    loadNotice()

    return () => {
      abortController.abort()
    }
  }, [
    noticeId,
  ])

  const handleDelete =
    async () => {
      if (
        isDeleting ||
        !noticeId
      ) {
        return
      }

      const shouldDelete =
        window.confirm(
          '이 공지사항을 삭제할까요?\n삭제한 공지사항은 복구할 수 없어요.'
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
          '로그인 정보를 찾을 수 없어요.'
        )

        return
      }

      try {
        setIsDeleting(
          true
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/notices/${noticeId}`,
            {
              method: 'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status ===
          403
        ) {
          throw new Error(
            '관리자 권한이 필요해요.'
          )
        }

        if (
          response.status !==
            204 &&
          !response.ok
        ) {
          throw new Error(
            '공지사항을 삭제하지 못했어요.'
          )
        }

        window.alert(
          '공지사항을 삭제했어요.'
        )

        onDeleted?.()
      } catch (error) {
        console.error(
          '관리자 공지 삭제 실패:',
          error
        )

        window.alert(
          error.message ||
            '공지사항을 삭제하지 못했어요.'
        )
      } finally {
        setIsDeleting(
          false
        )
      }
    }

  if (isLoading) {
    return (
      <div className="admin-notice-detail-page">
        <section className="admin-notice-detail-message">
          <span className="admin-notice-detail-spinner" />

          <p>
            공지사항을 불러오는 중이에요.
          </p>
        </section>
      </div>
    )
  }

  if (
    loadError ||
    !notice
  ) {
    return (
      <div className="admin-notice-detail-page">
        <header className="admin-notice-detail-header">
          <button
            type="button"
            onClick={
              onBack
            }
            aria-label="공지 목록으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1>
            공지사항 관리
          </h1>
        </header>

        <section className="admin-notice-detail-message">
          <p>
            {loadError ||
              '공지사항을 찾을 수 없어요.'}
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="admin-notice-detail-page">
      <header className="admin-notice-detail-header">
        <button
          type="button"
          onClick={
            onBack
          }
          aria-label="공지 목록으로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          공지사항 관리
        </h1>
      </header>

      <main className="admin-notice-detail-content">
        <article className="admin-notice-detail-card">
          <div className="admin-notice-detail-title-row">
            {notice.important && (
              <span className="admin-notice-detail-important">
                중요
              </span>
            )}

            <h2>
              {notice.title}
            </h2>
          </div>

          <time>
            {formatDateTime(
              notice.createdAt
            )}
          </time>

          <div className="admin-notice-detail-divider" />

          <p className="admin-notice-detail-body">
            {notice.content}
          </p>
        </article>

        <div className="admin-notice-detail-actions">
          <button
            className="admin-notice-edit-button"
            type="button"
            onClick={() =>
              onEdit?.(
                notice.id
              )
            }
            disabled={
              isDeleting
            }
          >
            <Pencil />
            <span>
              수정하기
            </span>
          </button>

          <button
            className="admin-notice-delete-button"
            type="button"
            onClick={
              handleDelete
            }
            disabled={
              isDeleting
            }
          >
            <Trash2 />
            <span>
              {isDeleting
                ? '삭제 중...'
                : '삭제하기'}
            </span>
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminNoticeDetail
