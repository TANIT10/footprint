import {
  Bell,
  ChevronLeft,
  MessageCircleMore,
  Megaphone,
  ShieldAlert,
} from 'lucide-react'

import './AdminPage.css'

function AdminPage({
  onBack,
  onReports,
  onInquiries,
  onNotices,
}) {
  return (
    <div className="admin-page">
      <header className="admin-header">
        <button
          type="button"
          className="admin-back-button"
          onClick={onBack}
          aria-label="뒤로가기"
        >
          <ChevronLeft />
        </button>

        <h1>
          관리자
        </h1>
      </header>

      <main className="admin-content">
        <section className="admin-intro">
          <div className="admin-intro-icon">
            <ShieldAlert />
          </div>

          <div>
            <strong>
              발자국 관리자
            </strong>

            <p>
              신고, 문의, 공지사항을 관리할 수 있어요.
            </p>
          </div>
        </section>

        <section className="admin-section">
          <h2>
            커뮤니티 관리
          </h2>

          <button
            type="button"
            className="admin-menu-card"
            onClick={
              onReports
            }
          >
            <div className="admin-menu-icon">
              <Bell />
            </div>

            <div className="admin-menu-text">
              <strong>
                신고 관리
              </strong>

              <span>
                접수된 커뮤니티 신고를 확인하고
                처리해요.
              </span>
            </div>

            <ChevronLeft
              className="admin-menu-arrow"
            />
          </button>

          <button
            type="button"
            className="admin-menu-card"
            onClick={
              onInquiries
            }
          >
            <div className="admin-menu-icon">
              <MessageCircleMore />
            </div>

            <div className="admin-menu-text">
              <strong>
                문의 확인하기
              </strong>

              <span>
                사용자 문의를 확인하고
                답변해요.
              </span>
            </div>

            <ChevronLeft
              className="admin-menu-arrow"
            />
          </button>
        </section>

        <section className="admin-section">
          <h2>
            서비스 관리
          </h2>

          <button
            type="button"
            className="admin-menu-card"
            onClick={
              onNotices
            }
          >
            <div className="admin-menu-icon">
              <Megaphone />
            </div>

            <div className="admin-menu-text">
              <strong>
                공지사항 관리
              </strong>

              <span>
                공지사항을 등록하고 수정하거나
                삭제해요.
              </span>
            </div>

            <ChevronLeft
              className="admin-menu-arrow"
            />
          </button>
        </section>
      </main>
    </div>
  )
}

export default AdminPage