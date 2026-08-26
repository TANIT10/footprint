import {
  ArrowLeft,
  ExternalLink,
  ShieldAlert,
  Trash2,
  UserRoundCog,
} from 'lucide-react'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import './AdminReportDetail.css'

const API_BASE_URL =
  'http://localhost:8080'

const REPORT_REASON_INFO = {
  ABUSE: '욕설·비방·괴롭힘',
  SPAM: '광고·홍보·도배',
  INAPPROPRIATE: '부적절한 내용',
  FALSE_INFORMATION: '허위 정보',
  OTHER: '기타',
}

const REPORT_STATUS_INFO = {
  PENDING: '접수',
  REVIEWING: '검토 중',
  RESOLVED: '처리 완료',
  DISMISSED: '기각',
}

function formatDateTime(value) {
  if (!value) {
    return '-'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return '-'
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

function AdminReportDetail({
  reportId,
  onBack,
  onPostSelect,
}) {
  const [
    report,
    setReport,
  ] = useState(null)

  const [
    userStatus,
    setUserStatus,
  ] = useState(null)

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  const getToken = () =>
    localStorage.getItem(
      'token'
    )

  const loadUserStatus =
    useCallback(
      async (
        username
      ) => {
        if (!username) {
          setUserStatus(
            null
          )
          return
        }

        const token =
          getToken()

        if (!token) {
          return
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/community/users/${encodeURIComponent(
                username
              )}`,
              {
                method: 'GET',
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          if (!response.ok) {
            return
          }

          setUserStatus(
            await response.json()
          )
        } catch (error) {
          console.error(
            '관리자 사용자 상태 조회 실패:',
            error
          )
        }
      },
      []
    )

  const loadReport =
    useCallback(
      async () => {
        const token =
          getToken()

        if (
          !token ||
          !reportId
        ) {
          setLoadError(
            '신고 정보를 불러올 수 없어요.'
          )
          setIsLoading(false)
          return
        }

        try {
          setIsLoading(true)
          setLoadError('')

          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/community/reports/${reportId}`,
              {
                method: 'GET',
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

          if (!response.ok) {
            throw new Error(
              '신고 정보를 불러오지 못했어요.'
            )
          }

          const loadedReport =
            await response.json()

          setReport(
            loadedReport
          )

          await loadUserStatus(
            loadedReport
              .reportedUsername
          )
        } catch (error) {
          console.error(
            '관리자 신고 상세 조회 실패:',
            error
          )

          setLoadError(
            error.message ||
              '신고 정보를 불러오지 못했어요.'
          )
        } finally {
          setIsLoading(false)
        }
      },
      [
        reportId,
        loadUserStatus,
      ]
    )

  const refreshDetailState =
    useCallback(
      async () => {
        const token =
          getToken()

        if (
          !token ||
          !reportId
        ) {
          return
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/community/reports/${reportId}`,
              {
                method: 'GET',

                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          if (!response.ok) {
            return
          }

          const refreshedReport =
            await response.json()

          setReport(
            refreshedReport
          )

          await loadUserStatus(
            refreshedReport
              .reportedUsername
          )
        } catch (error) {
          console.error(
            '관리자 상세 상태 새로고침 실패:',
            error
          )
        }
      },
      [
        reportId,
        loadUserStatus,
      ]
    )

  useEffect(() => {
    loadReport()
  }, [
    loadReport,
  ])

  const updateReportStatus =
    async (
      status
    ) => {
      if (
        !report ||
        isProcessing
      ) {
        return
      }

      const token =
        getToken()

      if (!token) {
        return
      }

      try {
        setIsProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/community/reports/${report.id}/status`,
            {
              method: 'PATCH',
              headers: {
                Authorization:
                  `Bearer ${token}`,
                'Content-Type':
                  'application/json',
              },
              body:
                JSON.stringify({
                  status,
                }),
            }
          )

        if (!response.ok) {
          throw new Error(
            '신고 상태를 변경하지 못했어요.'
          )
        }

        setReport(
          await response.json()
        )

        await refreshDetailState()
      } catch (error) {
        console.error(
          '신고 상태 변경 실패:',
          error
        )
        window.alert(error.message)
      } finally {
        setIsProcessing(false)
      }
    }

  const addWarning =
    async () => {
      if (
        !report?.reportedUsername ||
        isProcessing
      ) {
        return
      }

      const shouldContinue =
        window.confirm(
          `${report.reportedNickname || report.reportedUsername}님에게 경고 1회를 추가할까요?`
        )

      if (!shouldContinue) {
        return
      }

      const token =
        getToken()

      try {
        setIsProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/community/users/${encodeURIComponent(
              report.reportedUsername
            )}/warning`,
            {
              method: 'POST',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '경고를 적용하지 못했어요.'
          )
        }

        setUserStatus(
          await response.json()
        )

        await refreshDetailState()

        window.alert(
          '경고 1회가 추가됐어요.'
        )
      } catch (error) {
        console.error(
          '관리자 경고 적용 실패:',
          error
        )
        window.alert(error.message)
      } finally {
        setIsProcessing(false)
      }
    }

  const suspendUser =
    async (
      days
    ) => {
      if (
        !report?.reportedUsername ||
        isProcessing
      ) {
        return
      }

      const shouldContinue =
        window.confirm(
          `${report.reportedNickname || report.reportedUsername}님을 ${days}일 동안 커뮤니티 이용 정지할까요?`
        )

      if (!shouldContinue) {
        return
      }

      const token =
        getToken()

      try {
        setIsProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/community/users/${encodeURIComponent(
              report.reportedUsername
            )}/suspension?days=${days}`,
            {
              method: 'POST',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '이용 정지를 적용하지 못했어요.'
          )
        }

        setUserStatus(
          await response.json()
        )

        await refreshDetailState()

        window.alert(
          `${days}일 이용 정지가 적용됐어요.`
        )
      } catch (error) {
        console.error(
          '관리자 정지 적용 실패:',
          error
        )
        window.alert(error.message)
      } finally {
        setIsProcessing(false)
      }
    }

  const clearSuspension =
    async () => {
      if (
        !report?.reportedUsername ||
        isProcessing
      ) {
        return
      }

      const shouldContinue =
        window.confirm(
          '이 사용자의 커뮤니티 이용 정지를 해제할까요?'
        )

      if (!shouldContinue) {
        return
      }

      const token =
        getToken()

      try {
        setIsProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/community/users/${encodeURIComponent(
              report.reportedUsername
            )}/suspension`,
            {
              method: 'DELETE',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '정지를 해제하지 못했어요.'
          )
        }

        setUserStatus(
          await response.json()
        )

        await refreshDetailState()

        window.alert(
          '커뮤니티 이용 정지를 해제했어요.'
        )
      } catch (error) {
        console.error(
          '관리자 정지 해제 실패:',
          error
        )
        window.alert(error.message)
      } finally {
        setIsProcessing(false)
      }
    }

  const deletePost =
    async () => {
      if (
        !report?.communityPostId ||
        isProcessing
      ) {
        return
      }

      const shouldDelete =
        window.confirm(
          '신고된 게시글을 관리자 권한으로 삭제할까요?\n삭제한 게시글은 복구할 수 없어요.'
        )

      if (!shouldDelete) {
        return
      }

      const token =
        getToken()

      try {
        setIsProcessing(true)

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/community/posts/${report.communityPostId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status !==
            204 &&
          !response.ok
        ) {
          throw new Error(
            '게시글을 삭제하지 못했어요.'
          )
        }

        window.alert(
          '게시글을 삭제했어요.'
        )

        onBack?.()
      } catch (error) {
        console.error(
          '관리자 게시글 삭제 실패:',
          error
        )
        window.alert(error.message)
      } finally {
        setIsProcessing(false)
      }
    }

  if (isLoading) {
    return (
      <div className="admin-report-detail-page">
        <div className="admin-report-detail-loading">
          <span />
          <p>
            신고 정보를 불러오는 중이에요.
          </p>
        </div>
      </div>
    )
  }

  if (
    loadError ||
    !report
  ) {
    return (
      <div className="admin-report-detail-page">
        <header className="admin-report-detail-header">
          <button
            type="button"
            onClick={onBack}
            aria-label="뒤로가기"
          >
            <ArrowLeft />
          </button>

          <h1>
            신고 상세
          </h1>
        </header>

        <div className="admin-report-detail-error">
          {loadError ||
            '신고 정보를 찾을 수 없어요.'}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-report-detail-page">
      <header className="admin-report-detail-header">
        <button
          type="button"
          onClick={onBack}
          aria-label="신고 목록으로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          신고 상세
        </h1>
      </header>

      <main className="admin-report-detail-content">
        <section className="admin-report-detail-card">
          <div className="admin-report-detail-heading">
            <ShieldAlert />

            <div>
              <strong>
                {
                  REPORT_REASON_INFO[
                    report.reason
                  ] ??
                  report.reason
                }
              </strong>

              <span>
                {
                  REPORT_STATUS_INFO[
                    report.status
                  ] ??
                  report.status
                }
              </span>
            </div>
          </div>

          <dl className="admin-report-detail-list">
            <div>
              <dt>
                신고된 글
              </dt>

              <dd>
                {report.postTitle ||
                  '제목 없음'}
              </dd>
            </div>

            <div>
              <dt>
                신고 대상
              </dt>

              <dd>
                {report.reportedNickname ||
                  report.reportedUsername}
                {' · '}
                {report.reportedUsername}
              </dd>
            </div>

            <div>
              <dt>
                신고자
              </dt>

              <dd>
                {report.reporterNickname ||
                  report.reporterUsername}
                {' · '}
                {report.reporterUsername}
              </dd>
            </div>

            <div>
              <dt>
                접수 시간
              </dt>

              <dd>
                {formatDateTime(
                  report.createdAt
                )}
              </dd>
            </div>

            <div>
              <dt>
                처리 시간
              </dt>

              <dd>
                {formatDateTime(
                  report.reviewedAt
                )}
              </dd>
            </div>

            <div>
              <dt>
                상세 내용
              </dt>

              <dd>
                {report.detail ||
                  '추가 설명 없음'}
              </dd>
            </div>
          </dl>

          {report.communityPostId && (
            <button
              className="admin-report-open-post-button"
              type="button"
              onClick={() =>
                onPostSelect?.(
                  report.communityPostId
                )
              }
            >
              <ExternalLink />
              <span>
                신고된 게시글 확인
              </span>
            </button>
          )}
        </section>

        <section className="admin-report-detail-section">
          <h2>
            신고 처리
          </h2>

          <div className="admin-report-status-actions">
            <button
              type="button"
              onClick={() =>
                updateReportStatus(
                  'REVIEWING'
                )
              }
              disabled={
                isProcessing
              }
            >
              검토 중
            </button>

            <button
              type="button"
              onClick={() =>
                updateReportStatus(
                  'DISMISSED'
                )
              }
              disabled={
                isProcessing
              }
            >
              신고 기각
            </button>

            <button
              type="button"
              onClick={() =>
                updateReportStatus(
                  'RESOLVED'
                )
              }
              disabled={
                isProcessing
              }
            >
              처리 완료
            </button>
          </div>
        </section>

        <section className="admin-report-detail-section">
          <h2>
            사용자 조치
          </h2>

          <div className="admin-user-status-card">
            <UserRoundCog />

            <div>
              <strong>
                {report.reportedNickname ||
                  report.reportedUsername}
              </strong>

              <span>
                누적 경고{' '}
                {userStatus
                  ?.communityWarningCount ??
                  0}
                회
              </span>

              <span>
                {userStatus
                  ?.communitySuspended
                  ? `정지 중 · ${formatDateTime(
                      userStatus.communitySuspendedUntil
                    )}까지`
                  : '현재 정지 상태 아님'}
              </span>
            </div>
          </div>

          <button
            className="admin-warning-button"
            type="button"
            onClick={
              addWarning
            }
            disabled={
              isProcessing
            }
          >
            경고 1회 추가
          </button>

          <div className="admin-suspension-buttons">
            {[1, 3, 7, 30].map(
              (days) => (
                <button
                  type="button"
                  key={days}
                  onClick={() =>
                    suspendUser(
                      days
                    )
                  }
                  disabled={
                    isProcessing
                  }
                >
                  {days}일 정지
                </button>
              )
            )}
          </div>

          {userStatus
            ?.communitySuspended && (
            <button
              className="admin-clear-suspension-button"
              type="button"
              onClick={
                clearSuspension
              }
              disabled={
                isProcessing
              }
            >
              정지 해제
            </button>
          )}
        </section>

        <section className="admin-report-danger-section">
          <h2>
            게시글 관리
          </h2>

          <button
            type="button"
            onClick={
              deletePost
            }
            disabled={
              isProcessing ||
              !report.communityPostId
            }
          >
            <Trash2 />
            <span>
              게시글 강제 삭제
            </span>
          </button>
        </section>
      </main>
    </div>
  )
}

export default AdminReportDetail
