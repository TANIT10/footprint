import { ArrowLeft } from 'lucide-react'

import './NoticeDetail.css'

function formatNoticeDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  return new Date(createdAt).toLocaleDateString(
    'ko-KR',
    {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }
  )
}

function NoticeDetail({
  notice,
  onBack,
}) {
  if (!notice) {
    return null
  }

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
          <article className="notice-detail-article">
            <header className="notice-detail-information">
              <div className="notice-detail-title-row">
                {notice.isImportant && (
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
        </main>
      </div>
    </div>
  )
}

export default NoticeDetail