import {
  ArrowLeft,
  Check,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import './AdminNoticeWrite.css'

const API_BASE_URL =
  ''

function AdminNoticeWrite({
  noticeId = null,
  onBack,
  onComplete,
}) {
  const isEditMode =
    Boolean(noticeId)

  const [
    title,
    setTitle,
  ] = useState('')

  const [
    content,
    setContent,
  ] = useState('')

  const [
    important,
    setImportant,
  ] = useState(false)

  const [
    isLoading,
    setIsLoading,
  ] = useState(
    isEditMode
  )

  const [
    isSaving,
    setIsSaving,
  ] = useState(false)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  useEffect(() => {
    if (!isEditMode) {
      return
    }

    const abortController =
      new AbortController()

    const loadNotice =
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

          const notice =
            await response.json()

          setTitle(
            notice.title ?? ''
          )

          setContent(
            notice.content ?? ''
          )

          setImportant(
            Boolean(
              notice.important
            )
          )
        } catch (error) {
          if (
            error.name ===
            'AbortError'
          ) {
            return
          }

          console.error(
            '관리자 공지 조회 실패:',
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
    isEditMode,
    noticeId,
  ])

  const handleSubmit =
    async () => {
      if (
        isSaving
      ) {
        return
      }

      const normalizedTitle =
        title.trim()

      const normalizedContent =
        content.trim()

      if (!normalizedTitle) {
        window.alert(
          '공지사항 제목을 입력해 주세요.'
        )

        return
      }

      if (!normalizedContent) {
        window.alert(
          '공지사항 내용을 입력해 주세요.'
        )

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
        setIsSaving(
          true
        )

        const response =
          await fetch(
            isEditMode
              ? `${API_BASE_URL}/api/admin/notices/${noticeId}`
              : `${API_BASE_URL}/api/admin/notices`,
            {
              method:
                isEditMode
                  ? 'PUT'
                  : 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  title:
                    normalizedTitle,

                  content:
                    normalizedContent,

                  important,
                }),
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
            '관리자 권한이 필요해요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            isEditMode
              ? '공지사항을 수정하지 못했어요.'
              : '공지사항을 등록하지 못했어요.'
          )
        }

        const savedNotice =
          await response.json()

        window.alert(
          isEditMode
            ? '공지사항을 수정했어요.'
            : '공지사항을 등록했어요.'
        )

        onComplete?.(
          savedNotice
        )
      } catch (error) {
        console.error(
          '관리자 공지 저장 실패:',
          error
        )

        window.alert(
          error.message ||
            '공지사항을 저장하지 못했어요.'
        )
      } finally {
        setIsSaving(
          false
        )
      }
    }

  if (isLoading) {
    return (
      <div className="admin-notice-write-page">
        <section className="admin-notice-write-loading">
          <span />

          <p>
            공지사항을 불러오는 중이에요.
          </p>
        </section>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="admin-notice-write-page">
        <header className="admin-notice-write-header">
          <button
            type="button"
            onClick={
              onBack
            }
            aria-label="뒤로가기"
          >
            <ArrowLeft />
          </button>

          <h1>
            공지사항 수정
          </h1>
        </header>

        <section className="admin-notice-write-error">
          {loadError}
        </section>
      </div>
    )
  }

  return (
    <div className="admin-notice-write-page">
      <header className="admin-notice-write-header">
        <button
          type="button"
          onClick={
            onBack
          }
          aria-label="뒤로가기"
          disabled={
            isSaving
          }
        >
          <ArrowLeft />
        </button>

        <h1>
          {isEditMode
            ? '공지사항 수정'
            : '공지사항 작성'}
        </h1>
      </header>

      <main className="admin-notice-write-content">
        <section className="admin-notice-write-section">
          <label className="admin-notice-write-field">
            <span>
              제목
            </span>

            <input
              type="text"
              value={
                title
              }
              maxLength={
                100
              }
              onChange={(
                event
              ) =>
                setTitle(
                  event
                    .target
                    .value
                )
              }
              placeholder="공지사항 제목을 입력해 주세요."
              disabled={
                isSaving
              }
            />

            <small>
              {title.length}/100
            </small>
          </label>
        </section>

        <section className="admin-notice-write-section">
          <label className="admin-notice-write-field">
            <span>
              내용
            </span>

            <textarea
              value={
                content
              }
              maxLength={
                5000
              }
              onChange={(
                event
              ) =>
                setContent(
                  event
                    .target
                    .value
                )
              }
              placeholder="공지사항 내용을 입력해 주세요."
              disabled={
                isSaving
              }
            />

            <small>
              {content.length}/5000
            </small>
          </label>
        </section>

        <section className="admin-notice-write-section">
          <button
            className={`admin-notice-important-toggle ${
              important
                ? 'active'
                : ''
            }`}
            type="button"
            onClick={() =>
              setImportant(
                (
                  previous
                ) =>
                  !previous
              )
            }
            disabled={
              isSaving
            }
          >
            <span className="admin-notice-important-check">
              {important && (
                <Check />
              )}
            </span>

            <span className="admin-notice-important-text">
              <strong>
                중요 공지로 설정
              </strong>

              <small>
                일반 공지보다 위쪽에 표시돼요.
              </small>
            </span>
          </button>
        </section>

        <div className="admin-notice-write-actions">
          <button
            className="admin-notice-write-cancel-button"
            type="button"
            onClick={
              onBack
            }
            disabled={
              isSaving
            }
          >
            취소
          </button>

          <button
            className="admin-notice-write-submit-button"
            type="button"
            onClick={
              handleSubmit
            }
            disabled={
              isSaving
            }
          >
            {isSaving
              ? '저장 중...'
              : isEditMode
                ? '수정 완료'
                : '등록하기'}
          </button>
        </div>
      </main>
    </div>
  )
}

export default AdminNoticeWrite
