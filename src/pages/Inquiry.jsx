import {
  ArrowLeft,
  Send,
} from 'lucide-react'
import {
  useEffect,
  useRef,
  useState,
} from 'react'

import './Inquiry.css'

import footprint from '../assets/footprint.png'

const API_BASE_URL =
  'http://localhost:8080'

function formatMessageTime(createdAt) {
  if (!createdAt) {
    return ''
  }

  const date = new Date(createdAt)

  if (Number.isNaN(date.getTime())) {
    return ''
  }

  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function Inquiry({
  username,
  onBack,
}) {
  const [messages, setMessages] =
    useState([])

  const [messageText, setMessageText] =
    useState('')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSending, setIsSending] =
    useState(false)

  const [loadError, setLoadError] =
    useState('')

  const messageEndRef = useRef(null)

  useEffect(() => {
    const abortController =
      new AbortController()

    const loadMessages = async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setLoadError(
          '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
        )
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setLoadError('')

        const response = await fetch(
          `${API_BASE_URL}/api/inquiries/messages`,
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
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐어요. 다시 로그인해 주세요.'
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
          Array.isArray(responseMessages)
            ? responseMessages
            : []
        )
      } catch (error) {
        if (
          error.name === 'AbortError'
        ) {
          return
        }

        console.error(
          '문의 내용을 불러오지 못했습니다.',
          error
        )

        setLoadError(
          error.message ||
            '문의 내용을 불러오지 못했어요.'
        )
      } finally {
        if (
          !abortController.signal.aborted
        ) {
          setIsLoading(false)
        }
      }
    }

    loadMessages()

    return () => {
      abortController.abort()
    }
  }, [username])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleMessageSend = async () => {
    const trimmedMessage =
      messageText.trim()

    if (
      !trimmedMessage ||
      isSending
    ) {
      return
    }

    const token =
      localStorage.getItem('token')

    if (!token) {
      window.alert(
        '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
      )
      return
    }

    try {
      setIsSending(true)

      const response = await fetch(
        `${API_BASE_URL}/api/inquiries/messages`,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json; charset=utf-8',
          },
          body: JSON.stringify({
            content: trimmedMessage,
          }),
        }
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          '로그인 시간이 만료됐어요. 다시 로그인해 주세요.'
        )
      }

      if (!response.ok) {
        throw new Error(
          '메시지를 전송하지 못했어요.'
        )
      }

      const createdMessage =
        await response.json()

      setMessages(
        (previousMessages) => [
          ...previousMessages,
          createdMessage,
        ]
      )

      setMessageText('')
    } catch (error) {
      console.error(
        '문의 메시지 전송에 실패했습니다.',
        error
      )

      window.alert(
        error.message ||
          '메시지를 전송하지 못했어요.'
      )
    } finally {
      setIsSending(false)
    }
  }

  const handleMessageKeyDown = (
    event
  ) => {
    if (
      event.key === 'Enter' &&
      !event.shiftKey
    ) {
      event.preventDefault()
      handleMessageSend()
    }
  }

  return (
    <div className="inquiry-page">
      <div className="inquiry-inner">
        <header className="inquiry-header">
          <button
            className="inquiry-back-button"
            type="button"
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="inquiry-title">
            문의하기
          </h1>

          <span
            className="inquiry-header-space"
            aria-hidden="true"
          />
        </header>

        <main className="inquiry-content">
          <section className="inquiry-guide-message">
            <span className="inquiry-guide-icon">
              <img
                src={footprint}
                alt=""
              />
            </span>

            <div className="inquiry-guide-bubble">
              <strong>
                발자국 문의하기 페이지입니다!
              </strong>

              <span>
                메시지를 남겨 주세요.
              </span>
            </div>
          </section>

          <section
            className="inquiry-message-list"
            aria-label="문의 메시지 목록"
          >
            {isLoading && (
              <p className="inquiry-status-message">
                문의 내용을 불러오는 중이에요.
              </p>
            )}

            {!isLoading &&
              loadError && (
                <p className="inquiry-status-message inquiry-error-message">
                  {loadError}
                </p>
              )}

            {!isLoading &&
              !loadError &&
              messages.map((message) => {
                const isAdmin =
                  message.sender ===
                  'ADMIN'

                return (
                  <article
                    className={
                      isAdmin
                        ? 'inquiry-admin-message'
                        : 'inquiry-user-message'
                    }
                    key={message.id}
                  >
                    {isAdmin ? (
                      <>
                        <p className="inquiry-admin-bubble">
                          {message.content}
                        </p>

                        <span className="inquiry-message-time">
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inquiry-message-time">
                          {formatMessageTime(
                            message.createdAt
                          )}
                        </span>

                        <p className="inquiry-user-bubble">
                          {message.content}
                        </p>
                      </>
                    )}
                  </article>
                )
              })}

            <div ref={messageEndRef} />
          </section>
        </main>

        <form
          className="inquiry-input-area"
          onSubmit={(event) => {
            event.preventDefault()
            handleMessageSend()
          }}
        >
          <textarea
            className="inquiry-message-input"
            value={messageText}
            onChange={(event) =>
              setMessageText(
                event.target.value
              )
            }
            onKeyDown={
              handleMessageKeyDown
            }
            placeholder="메시지를 입력해 주세요."
            rows="1"
            maxLength="1000"
            disabled={isSending}
            aria-label="문의 메시지 입력"
          />

          <button
            className="inquiry-send-button"
            type="submit"
            disabled={
              isSending ||
              !messageText.trim()
            }
            aria-label="문의 메시지 전송"
          >
            <Send />
          </button>
        </form>
      </div>
    </div>
  )
}

export default Inquiry