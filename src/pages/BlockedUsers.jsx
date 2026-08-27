import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
} from 'lucide-react'

import './BlockedUsers.css'

const API_BASE_URL = ''

function BlockedUsers({
  onBack,
}) {
  const [
    blockedUsers,
    setBlockedUsers,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    processingUsername,
    setProcessingUsername,
  ] = useState('')

  const loadBlockedUsers =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
        )

        setBlockedUsers([])
        setIsLoading(false)

        return
      }

      setIsLoading(true)

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/community/blocks`,
            {
              method: 'GET',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '차단한 사용자 목록을 불러오지 못했습니다.'
          )
        }

        const responseBody =
          await response.json()

        setBlockedUsers(
          Array.isArray(
            responseBody
          )
            ? responseBody
            : []
        )
      } catch (error) {
        console.error(
          '차단 사용자 목록 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '차단한 사용자 목록을 불러오지 못했어요.'
        )

        setBlockedUsers([])
      } finally {
        setIsLoading(false)
      }
    }, [])

  useEffect(() => {
    loadBlockedUsers()
  }, [
    loadBlockedUsers,
  ])

  const handleUnblock =
    async (
      blockedUsername
    ) => {
      if (
        !blockedUsername ||
        processingUsername
      ) {
        return
      }

      const shouldUnblock =
        window.confirm(
          `${blockedUsername}님의 차단을 해제하시겠습니까?`
        )

      if (!shouldUnblock) {
        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
        )

        return
      }

      setProcessingUsername(
        blockedUsername
      )

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/community/blocks/${encodeURIComponent(
              blockedUsername
            )}`,
            {
              method:
                'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '차단을 해제하지 못했습니다.'
          )
        }

        setBlockedUsers(
          (
            previousBlockedUsers
          ) =>
            previousBlockedUsers.filter(
              (
                savedUsername
              ) =>
                savedUsername !==
                blockedUsername
            )
        )

        window.alert(
          '차단이 해제됐어요.'
        )
      } catch (error) {
        console.error(
          '차단 해제 실패:',
          error
        )

        window.alert(
          error.message ||
            '차단을 해제하지 못했어요.'
        )
      } finally {
        setProcessingUsername(
          ''
        )
      }
    }

  return (
    <div className="blocked-users-page">
      <div className="blocked-users-inner">
        <header className="blocked-users-header">
          <button
            className="blocked-users-back-button"
            type="button"
            onClick={
              onBack
            }
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>
        </header>

        <main className="blocked-users-content">
          <section className="blocked-users-title-section">
            <h1>
              차단한 사용자 관리
            </h1>

            <p>
              차단한 사용자를 확인하고
              차단을 해제할 수 있어요.
            </p>
          </section>

          <div className="blocked-users-divider" />

          {isLoading ? (
            <div className="blocked-users-state">
              불러오는 중...
            </div>
          ) : blockedUsers.length ===
            0 ? (
            <div className="blocked-users-empty">
              차단한 사용자가 없어요.
            </div>
          ) : (
            <div className="blocked-users-list">
              {blockedUsers.map(
                (
                  blockedUsername
                ) => (
                  <div
                    className="blocked-user-item"
                    key={
                      blockedUsername
                    }
                  >
                    <div className="blocked-user-information">
                      <strong>
                        @
                        {
                          blockedUsername
                        }
                      </strong>
                    </div>

                    <button
                      className="blocked-user-unblock-button"
                      type="button"
                      disabled={
                        Boolean(
                          processingUsername
                        )
                      }
                      onClick={() =>
                        handleUnblock(
                          blockedUsername
                        )
                      }
                    >
                      {processingUsername ===
                      blockedUsername
                        ? '해제 중...'
                        : '차단 해제'}
                    </button>
                  </div>
                )
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default BlockedUsers