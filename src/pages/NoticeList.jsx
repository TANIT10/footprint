import {
  ArrowLeft,
  ChevronRight,
} from 'lucide-react'

import './NoticeList.css'

import notices from '../data/notices'

function formatNoticeDate(createdAt) {
  if (!createdAt) {
    return ''
  }

  return new Date(
    createdAt
  ).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
}

function NoticeList({
  noticeItems = notices,
  onBack,
  onNoticeSelect,
}) {
  /*
   * 기존 배열을 직접 변경하지 않고 복사한 뒤,
   * 중요 공지가 항상 위에 오도록 정렬
   *
   * 중요도가 같은 공지끼리는 notices.js에
   * 작성된 순서를 그대로 유지
   */
  const sortedNoticeItems = [
    ...noticeItems,
  ].sort((firstNotice, secondNotice) => {
    if (
      firstNotice.isImportant ===
      secondNotice.isImportant
    ) {
      return 0
    }

    return firstNotice.isImportant
      ? -1
      : 1
  })

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
          {sortedNoticeItems.length > 0 ? (
            <section
              className="notice-list"
              aria-label="공지사항 목록"
            >
              {sortedNoticeItems.map(
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
                        {notice.isImportant && (
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