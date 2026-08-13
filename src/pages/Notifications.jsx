import {
  ArrowLeft,
  CheckCheck,
  CircleAlert,
  CircleCheckBig,
  MessageCircle,
} from 'lucide-react'

import './Notifications.css'

import footprint from '../assets/footprint.png'
import myPageHouse from '../assets/mypage-house.png'

function NotificationIcon({ type }) {
  if (type === 'AI_MATCH') {
    return (
      <img
        className="notification-type-paw"
        src={footprint}
        alt=""
      />
    )
  }

  if (type === 'COMMENT') {
    return <MessageCircle />
  }

  if (type === 'NOTICE') {
    return <CircleAlert />
  }

  return <CircleCheckBig />
}

function formatNotificationTime(createdAt) {
  if (!createdAt) {
    return ''
  }

  const createdTime = new Date(createdAt)
  const currentTime = new Date()

  const differenceInSeconds = Math.max(
    0,
    Math.floor(
      (currentTime.getTime() -
        createdTime.getTime()) /
        1000
    )
  )

  if (differenceInSeconds < 60) {
    return '방금 전'
  }

  const differenceInMinutes = Math.floor(
    differenceInSeconds / 60
  )

  if (differenceInMinutes < 60) {
    return `${differenceInMinutes}분 전`
  }

  const differenceInHours = Math.floor(
    differenceInMinutes / 60
  )

  if (differenceInHours < 24) {
    return `${differenceInHours}시간 전`
  }

  const differenceInDays = Math.floor(
    differenceInHours / 24
  )

  if (differenceInDays === 1) {
    return '어제'
  }

  if (differenceInDays < 7) {
    return `${differenceInDays}일 전`
  }

  return createdTime.toLocaleDateString('ko-KR')
}

function Notifications({
  notifications = [],
  onBack,
  onPostSelect,
  onNoticeSelect,
  onNotificationRead,
  onAllNotificationsRead,
}) {
  const hasUnreadNotification =
    notifications.some(
      (notification) => !notification.isRead
    )

  const handleNotificationSelect = (
    selectedNotification
  ) => {
    onNotificationRead?.(selectedNotification.id)

    if (
      selectedNotification.type === 'NOTICE' &&
      selectedNotification.noticeId
    ) {
      onNoticeSelect?.(
        selectedNotification.noticeId
      )
      return
    }

    if (
      selectedNotification.postId &&
      onPostSelect
    ) {
      onPostSelect(selectedNotification.postId)
    }
  }

  return (
    <div className="notifications-page">
      <div className="notifications-inner">
        <header className="notifications-header">
          <button
            className="notifications-back-button"
            type="button"
            onClick={onBack}
            aria-label="이전 화면으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <h1 className="notifications-title">
            알림
          </h1>

          {hasUnreadNotification && (
            <button
              className="notifications-read-all-button"
              type="button"
              onClick={onAllNotificationsRead}
            >
              <CheckCheck />
              <span>전체 읽음</span>
            </button>
          )}
        </header>

        <main className="notifications-content">
          {notifications.length > 0 ? (
            <section
              className="notification-list"
              aria-label="알림 목록"
            >
              {notifications.map(
                (notification) => (
                  <button
                    className={`notification-item ${
                      notification.isRead
                        ? 'read'
                        : 'unread'
                    }`}
                    type="button"
                    key={notification.id}
                    onClick={() =>
                      handleNotificationSelect(
                        notification
                      )
                    }
                  >
                    <span
                      className={`notification-type-icon ${notification.type.toLowerCase()}`}
                    >
                      <NotificationIcon
                        type={notification.type}
                      />
                    </span>

                    <span className="notification-information">
                      <strong className="notification-item-title">
                        {notification.title}
                      </strong>

                      <span className="notification-message">
                        {notification.message}
                      </span>

                      <span className="notification-time">
                        {formatNotificationTime(
                          notification.createdAt
                        )}
                      </span>
                    </span>

                    <span className="notification-side">
                      {!notification.isRead && (
                        <span
                          className="notification-unread-dot"
                          aria-label="읽지 않은 알림"
                        />
                      )}

                      <span className="notification-label">
                        {notification.label}
                      </span>
                    </span>
                  </button>
                )
              )}
            </section>
          ) : (
            <section className="notifications-empty">
              <p>아직 도착한 알림이 없어요.</p>

              <span>
                새로운 발자국이 발견되면 알려드릴게요.
              </span>

              <img
                className="notifications-empty-image"
                src={myPageHouse}
                alt=""
              />
            </section>
          )}
        </main>
      </div>
    </div>
  )
}

export default Notifications