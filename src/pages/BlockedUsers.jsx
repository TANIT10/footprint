import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import {
  ArrowLeft,
} from 'lucide-react'

import './BlockedUsers.css'

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
    useCallback(
      async () => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          setBlockedUsers([])
          setIsLoading(false)

          return
        }

        setIsLoading(true)

        try {
          const response =
            await fetch(
              '/api/community/blocks',
              {
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          if (!response.ok) {
            throw new Error(
              '차단한 사용자 목록을 불러오지 못했어요.'
            )
          }

          const data =
            await response.json()

          setBlockedUsers(
            Array.isArray(data)
              ? data
              : []
          )
        } catch (error) {
          console.error(
            '차단한 사용자 목록 조회 실패:',
            error
          )

          setBlockedUsers([])

          window.alert(
            error.message ||
              '차단한 사용자 목록을 불러오지 못했어요.'
          )
        } finally {
          setIsLoading(false)
        }
      },
      []
    )

  useEffect(
    () => {
      loadBlockedUsers()
    },
    [
      loadBlockedUsers,
    ]
  )

  const handleUnblock =
    async (
      blockedUsername
    ) => {
      if (
        processingUsername
      ) {
        return
      }

      const confirmed =
        window.confirm(
          `${blockedUsername}님의 차단을 해제하시겠습니까?`
        )

      if (!confirmed) {
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

      setProcessingUsername(
        blockedUsername
      )

      try {
        const response =
          await fetch(
            `/api/community/blocks/${encodeURIComponent(
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

        if (!response.ok) {
          throw new Error(
            '차단을 해제하지 못했어요.'
          )
        }

        setBlockedUsers(
          (
            previousUsers
          ) =>
            previousUsers.filter(
              (
                username
              ) =>
                username !==
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
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <div className="blocked-users-title-area">
            <h1>
              차단한 사용자 관리
            </h1>
            
          </div>
        </header>

        <main className="blocked-users-content">
          {isLoading ? (
            <p className="blocked-users-state">
              불러오는 중...
            </p>
          ) : blockedUsers.length ===
            0 ? (
            <p className="blocked-users-state">
              차단한 사용자가 없어요.
            </p>
          ) : (
            <ul className="blocked-users-list">
              {blockedUsers.map(
                (
                  blockedUsername
                ) => (
                  <li
                    className="blocked-users-item"
                    key={
                      blockedUsername
                    }
                  >
                    <span className="blocked-users-username">
                      @
                      {
                        blockedUsername
                      }
                    </span>

                    <button
                      className="blocked-users-unblock-button"
                      type="button"
                      onClick={() =>
                        handleUnblock(
                          blockedUsername
                        )
                      }
                      disabled={
                        processingUsername ===
                        blockedUsername
                      }
                    >
                      {processingUsername ===
                      blockedUsername
                        ? '해제 중...'
                        : '차단 해제'}
                    </button>
                  </li>
                )
              )}
            </ul>
          )}
        </main>
      </div>
    </div>
  )
}

export default BlockedUsers
