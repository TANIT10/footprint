import {
  ArrowLeft,
  ChevronRight,
  MessageCircleMore,
} from 'lucide-react'

import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import './AdminInquiries.css'

const API_BASE_URL =
  'http://localhost:8080'

function formatConversationTime(
  createdAt
) {
  if (!createdAt) {
    return ''
  }

  const date =
    new Date(createdAt)

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
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function AdminInquiries({
  onBack,
  onConversationSelect,
}) {
  const [
    conversations,
    setConversations,
  ] = useState([])

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  const loadConversations =
    useCallback(
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
          setLoadError('')

          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/inquiries?page=0`,
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
              '문의 목록을 불러오지 못했어요.'
            )
          }

          const responseBody =
            await response.json()

          setConversations(
            Array.isArray(
              responseBody
                .conversations
            )
              ? responseBody
                  .conversations
              : []
          )
        } catch (error) {
          console.error(
            '관리자 문의 목록 조회 실패:',
            error
          )

          setLoadError(
            error.message ||
              '문의 목록을 불러오지 못했어요.'
          )
        } finally {
          setIsLoading(
            false
          )
        }
      },
      []
    )

  useEffect(() => {
    loadConversations()

    const intervalId =
      window.setInterval(
        loadConversations,
        3000
      )

    return () => {
      window.clearInterval(
        intervalId
      )
    }
  }, [
    loadConversations,
  ])

  return (
    <div className="admin-inquiries-page">
      <header className="admin-inquiries-header">
        <button
          className="admin-inquiries-back-button"
          type="button"
          onClick={
            onBack
          }
          aria-label="관리자 페이지로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <h1>
          문의 확인하기
        </h1>
      </header>

      <main className="admin-inquiries-content">
        {isLoading ? (
          <section className="admin-inquiries-message">
            <span className="admin-inquiries-spinner" />

            <p>
              문의 목록을 불러오는 중이에요.
            </p>
          </section>
        ) : loadError ? (
          <section className="admin-inquiries-message">
            <p>
              {loadError}
            </p>
          </section>
        ) : conversations.length > 0 ? (
          <section className="admin-inquiry-list">
            {conversations.map(
              (
                conversation
              ) => (
                <button
                  className="admin-inquiry-card"
                  type="button"
                  key={
                    conversation.userId
                  }
                  onClick={() =>
                    onConversationSelect?.(
                      conversation
                    )
                  }
                >
                  <span className="admin-inquiry-card-icon">
                    <MessageCircleMore />
                  </span>

                  <span className="admin-inquiry-card-information">
                    <span className="admin-inquiry-card-top">
                      <strong>
                        {conversation.nickname ||
                          conversation.username ||
                          '사용자'}
                      </strong>

                      <time>
                        {formatConversationTime(
                          conversation.lastMessageCreatedAt
                        )}
                      </time>
                    </span>

                    <span className="admin-inquiry-username">
                      @
                      {conversation.username ||
                        'unknown'}
                    </span>

                    <span className="admin-inquiry-preview">
                      {conversation.lastMessage ||
                        '문의 내용 없음'}
                    </span>
                  </span>

                  <span className="admin-inquiry-card-side">
                    {Number(
                      conversation.unreadCount ??
                        0
                    ) > 0 && (
                      <span className="admin-inquiry-new-badge">
                        NEW
                      </span>
                    )}

                    <ChevronRight />
                  </span>
                </button>
              )
            )}
          </section>
        ) : (
          <section className="admin-inquiries-message">
            <p>
              아직 접수된 문의가 없어요.
            </p>
          </section>
        )}
      </main>
    </div>
  )
}

export default AdminInquiries
