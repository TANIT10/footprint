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
  const storageKey = username
    ? `footprint-inquiries-${username}`
    : 'footprint-inquiries-guest'

  const [messages, setMessages] = useState(
    () => {
      try {
        const savedMessages =
          localStorage.getItem(storageKey)

        return savedMessages
          ? JSON.parse(savedMessages)
          : []
      } catch (error) {
        console.error(
          '저장된 문의 내용을 불러오지 못했습니다.',
          error
        )

        return []
      }
    }
  )

  const [messageText, setMessageText] =
    useState('')

  const messageEndRef = useRef(null)

  useEffect(() => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify(messages)
      )
    } catch (error) {
      console.error(
        '문의 내용을 저장하지 못했습니다.',
        error
      )

      window.alert(
        '문의 내용을 저장하지 못했어요.'
      )
    }
  }, [messages, storageKey])

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    })
  }, [messages])

  const handleMessageSend = () => {
    const trimmedMessage = messageText.trim()

    if (!trimmedMessage) {
      return
    }

    const newMessage = {
      id: crypto.randomUUID(),
      content: trimmedMessage,
      createdAt: new Date().toISOString(),
      sender: 'USER',
    }

    setMessages((previousMessages) => [
      ...previousMessages,
      newMessage,
    ])

    setMessageText('')
  }

  const handleMessageKeyDown = (event) => {
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
            {messages.map((message) => (
              <article
                className="inquiry-user-message"
                key={message.id}
              >
                <span className="inquiry-message-time">
                  {formatMessageTime(
                    message.createdAt
                  )}
                </span>

                <p className="inquiry-user-bubble">
                  {message.content}
                </p>
              </article>
            ))}

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
              setMessageText(event.target.value)
            }
            onKeyDown={handleMessageKeyDown}
            placeholder="메시지를 입력해 주세요."
            rows="1"
            maxLength="1000"
            aria-label="문의 메시지 입력"
          />

          <button
            className="inquiry-send-button"
            type="submit"
            disabled={!messageText.trim()}
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