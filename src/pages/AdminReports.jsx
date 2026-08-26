import {
  ArrowLeft,
  ChevronRight,
  CircleAlert,
} from 'lucide-react'

import {
  useEffect,
  useState,
} from 'react'

import './AdminReports.css'

const API_BASE_URL =
  ''

const REPORT_STATUS_INFO = {
  PENDING: {
    label: '접수',
  },

  REVIEWING: {
    label: '검토 중',
  },

  RESOLVED: {
    label: '처리 완료',
  },

  DISMISSED: {
    label: '기각',
  },
}

const REPORT_REASON_INFO = {
  ABUSE: '욕설·비방·괴롭힘',
  SPAM: '광고·홍보·도배',
  INAPPROPRIATE: '부적절한 내용',
  FALSE_INFORMATION: '허위 정보',
  OTHER: '기타',
}

function formatReportDate(
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

function AdminReports({
  onBack,
  onReportSelect,
}) {
  const [
    selectedStatus,
    setSelectedStatus,
  ] = useState(
    'PENDING'
  )

  const [
    reports,
    setReports,
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

    const loadReports =
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          setReports([])
          setLoadError(
            '로그인 정보를 찾을 수 없어요.'
          )
          setIsLoading(false)

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
              `${API_BASE_URL}/api/admin/community/reports?status=${selectedStatus}`,
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
              '관리자 권한이 필요해요.'
            )
          }

          if (!response.ok) {
            throw new Error(
              '신고 목록을 불러오지 못했어요.'
            )
          }

          const responseBody =
            await response.json()

          setReports(
            Array.isArray(
              responseBody
            )
              ? responseBody
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
            '관리자 신고 목록 조회 실패:',
            error
          )

          setReports(
            []
          )

          setLoadError(
            error.message ||
              '신고 목록을 불러오지 못했어요.'
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

    loadReports()

    return () => {
      abortController.abort()
    }
  }, [
    selectedStatus,
  ])

  return (
    <div className="admin-reports-page">
      <header className="admin-reports-header">
        <button
          className="admin-reports-back-button"
          type="button"
          onClick={onBack}
          aria-label="관리자 화면으로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          신고 관리
        </h1>
      </header>

      <main className="admin-reports-content">
        <section
          className="admin-report-status-tabs"
          aria-label="신고 처리 상태"
        >
          {Object.entries(
            REPORT_STATUS_INFO
          ).map(
            ([
              status,
              info,
            ]) => (
              <button
                type="button"
                key={status}
                className={
                  selectedStatus ===
                  status
                    ? 'active'
                    : ''
                }
                onClick={() =>
                  setSelectedStatus(
                    status
                  )
                }
              >
                {info.label}
              </button>
            )
          )}
        </section>

        {isLoading ? (
          <section className="admin-reports-message">
            <span className="admin-reports-spinner" />

            <p>
              신고 목록을 불러오는 중이에요.
            </p>
          </section>
        ) : loadError ? (
          <section className="admin-reports-message">
            <CircleAlert />

            <p>
              {loadError}
            </p>
          </section>
        ) : reports.length > 0 ? (
          <section className="admin-report-list">
            {reports.map(
              (report) => (
                <button
                  className="admin-report-card"
                  type="button"
                  key={
                    report.id
                  }
                  onClick={() =>
                    onReportSelect?.(
                      report.id
                    )
                  }
                >
                  <span className="admin-report-information">
                    <span className="admin-report-top-row">
                      <span className="admin-report-status">
                        {
                          REPORT_STATUS_INFO[
                            report.status
                          ]?.label ??
                          report.status
                        }
                      </span>

                      <time>
                        {formatReportDate(
                          report.createdAt
                        )}
                      </time>
                    </span>

                    <strong className="admin-report-post-title">
                      {report.postTitle ||
                        '제목 없는 게시글'}
                    </strong>

                    <span className="admin-report-reason">
                      {
                        REPORT_REASON_INFO[
                          report.reason
                        ] ??
                        report.reason
                      }
                    </span>

                    <span className="admin-report-user">
                      신고 대상 ·{' '}
                      {report.reportedNickname ||
                        report.reportedUsername ||
                        '사용자 정보 없음'}
                    </span>

                    <span className="admin-report-reporter">
                      신고자 ·{' '}
                      {report.reporterNickname ||
                        report.reporterUsername ||
                        '사용자 정보 없음'}
                    </span>
                  </span>

                  <ChevronRight
                    className="admin-report-arrow"
                    aria-hidden="true"
                  />
                </button>
              )
            )}
          </section>
        ) : (
          <section className="admin-reports-message">
            <p>
              해당 상태의 신고가 없어요.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminReports