import {
  ArrowLeft,
  Send,
} from 'lucide-react'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'

import './AdminInquiryDetail.css'

const API_BASE_URL =
  ''

function formatMessageTime(
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

  return date.toLocaleTimeString(
    'ko-KR',
    {
      hour: '2-digit',
      minute: '2-digit',
    }
  )
}

function AdminInquiryDetail({
  conversation,
  onBack,
}) {
  const [
    messages,
    setMessages,
  ] = useState([])

  const [
    messageText,
    setMessageText,
  ] = useState('')

  const [
    isLoading,
    setIsLoading,
  ] = useState(true)

  const [
    isSending,
    setIsSending,
  ] = useState(false)

  const [
    loadError,
    setLoadError,
  ] = useState('')

  const messageEndRef =
    useRef(null)

  const userId =
    conversation?.userId

  const loadMessages =
    useCallback(
      async (
        showLoading = false
      ) => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (
          !token ||
          !userId
        ) {
          setLoadError(
            '문의방 정보를 찾을 수 없어요.'
          )

          setIsLoading(
            false
          )

          return
        }

        try {
          if (showLoading) {
            setIsLoading(
              true
            )
          }

          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/inquiries/${userId}/messages`,
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
              '문의 내용을 불러오지 못했어요.'
            )
          }

          const responseMessages =
            await response.json()

          setMessages(
            Array.isArray(
              responseMessages
            )
              ? responseMessages
              : []
          )

          setLoadError('')
        } catch (error) {
          console.error(
            '관리자 문의 메시지 조회 실패:',
            error
          )

          setLoadError(
            error.message ||
              '문의 내용을 불러오지 못했어요.'
          )
        } finally {
          setIsLoading(
            false
          )
        }
      },
      [
        userId,
      ]
    )

  useEffect(() => {
    loadMessages(true)

    const intervalId =
      window.setInterval(
        () =>
          loadMessages(
            false
          ),
        3000
      )

    return () => {
      window.clearInterval(
        intervalId
      )
    }
  }, [
    loadMessages,
  ])

  useEffect(() => {
    messageEndRef
      .current
      ?.scrollIntoView({
        behavior:
          'smooth',
      })
  }, [
    messages,
  ])

  const handleSend =
    async () => {
      const normalizedMessage =
        messageText.trim()

      if (
        !normalizedMessage ||
        isSending ||
        !userId
      ) {
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
        setIsSending(
          true
        )

        const response =
          await fetch(
            `${API_BASE_URL}/api/admin/inquiries/${userId}/messages`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json; charset=utf-8',
              },

              body:
                JSON.stringify({
                  content:
                    normalizedMessage,
                }),
            }
          )

        if (!response.ok) {
          throw new Error(
            '답변을 전송하지 못했어요.'
          )
        }

        const createdMessage =
          await response.json()

        setMessages(
          (
            previousMessages
          ) => [
            ...previousMessages,
            createdMessage,
          ]
        )

        setMessageText('')
      } catch (error) {
        console.error(
          '관리자 문의 답변 전송 실패:',
          error
        )

        window.alert(
          error.message ||
            '답변을 전송하지 못했어요.'
        )
      } finally {
        setIsSending(
          false
        )
      }
    }

  const handleKeyDown =
    (
      event
    ) => {
      if (
        event.key ===
          'Enter' &&
        !event.shiftKey
      ) {
        event.preventDefault()

        handleSend()
      }
    }

  return (
    <div className="admin-inquiry-detail-page">
      <header className="admin-inquiry-detail-header">
        <button
          className="admin-inquiry-detail-back-button"
          type="button"
          onClick={
            onBack
          }
          aria-label="문의 목록으로 돌아가기"
        >
          <ArrowLeft />
        </button>

        <div className="admin-inquiry-detail-title">
          <strong>
            {conversation?.nickname ||
              conversation?.username ||
              '사용자'}
          </strong>

          <span>
            @
            {conversation?.username ||
              'unknown'}
          </span>
        </div>
      </header>

      <main className="admin-inquiry-detail-content">
        {isLoading ? (
          <p className="admin-inquiry-detail-status">
            문의 내용을 불러오는 중이에요.
          </p>
        ) : loadError ? (
          <p className="admin-inquiry-detail-status">
            {loadError}
          </p>
        ) : (
          <section className="admin-inquiry-message-list">
            {messages.map(
              (
                message
              ) => {
                const isAdmin =
                  message.sender ===
                  'ADMIN'

                return (
                  <article
                    className={
                      isAdmin
                        ? 'admin-inquiry-admin-message'
                        : 'admin-inquiry-user-message'
                    }
                    key={
                      message.id
                    }
                  >
                    {isAdmin ? (
                      <>
                        <span className="admin-inquiry-message-time">
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>

                        <p className="admin-inquiry-admin-bubble">
                          {message.content}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="admin-inquiry-user-bubble">
                          {message.content}
                        </p>

                        <span className="admin-inquiry-message-time">
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>
                      </>
                    )}
                  </article>
                )
              }
            )}

            <div
              ref={
                messageEndRef
              }
            />
          </section>
        )}
      </main>

      <form
        className="admin-inquiry-input-area"
        onSubmit={(
          event
        ) => {
          event.preventDefault()
          handleSend()
        }}
      >
        <textarea
          value={
            messageText
          }
          onChange={(
            event
          ) =>
            setMessageText(
              event
                .target
                .value
            )
          }
          onKeyDown={
            handleKeyDown
          }
          placeholder="답변을 입력해 주세요."
          rows="1"
          maxLength="1000"
          disabled={
            isSending
          }
        />

        <button
          type="submit"
          disabled={
            isSending ||
            !messageText.trim()
          }
          aria-label="답변 보내기"
        >
          <Send />
        </button>
      </form>
    </div>
  )
}

export default AdminInquiryDetail
