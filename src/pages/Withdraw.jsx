import { useState } from 'react'
import {
  ArrowLeft,
  Eye,
  EyeOff,
  TriangleAlert,
} from 'lucide-react'

import './Withdraw.css'

function Withdraw({
  onBack,
  onWithdrawSuccess,
}) {
  const [password, setPassword] = useState('')
  const [confirmationText, setConfirmationText] =
    useState('')
  const [showPassword, setShowPassword] =
    useState(false)
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] =
    useState(false)

  const canWithdraw =
    password.trim() !== '' &&
    confirmationText.trim() === '탈퇴하기' &&
    !isSubmitting

  const handleWithdraw = async () => {
    if (!password.trim()) {
      setMessage('비밀번호를 입력해 주세요.')
      return
    }

    if (confirmationText.trim() !== '탈퇴하기') {
      setMessage(
        '확인란에 “탈퇴하기”를 정확히 입력해 주세요.'
      )
      return
    }

    const token = localStorage.getItem('token')

    if (!token) {
      window.alert(
        '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
      )
      return
    }

    const finalConfirmation = window.confirm(
      '정말 탈퇴하시겠어요?\n탈퇴한 계정과 삭제된 데이터는 복구할 수 없어요.'
    )

    if (!finalConfirmation) {
      return
    }

    setIsSubmitting(true)
    setMessage('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/users/me',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            password,
          }),
        }
      )

      if (!response.ok) {
        if (
          response.status === 401 ||
          response.status === 403
        ) {
          setMessage(
            '비밀번호가 올바르지 않거나 로그인 정보가 만료됐어요.'
          )
          return
        }

        const errorMessage = await response.text()

        setMessage(
          errorMessage ||
            '회원 탈퇴에 실패했습니다.'
        )
        return
      }

      onWithdrawSuccess?.()
    } catch (error) {
      console.error('회원 탈퇴 오류:', error)

      setMessage(
        '서버에 연결할 수 없습니다.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="withdraw-page">
      <div className="withdraw-inner">
        <header className="withdraw-header">
          <button
            className="withdraw-back-button"
            type="button"
            onClick={onBack}
            aria-label="마이페이지로 돌아가기"
            disabled={isSubmitting}
          >
            <ArrowLeft />
          </button>

          <h1 className="withdraw-title">
            회원 탈퇴
          </h1>
        </header>

        <main className="withdraw-content">
          <section className="withdraw-warning">
            <span className="withdraw-warning-icon">
              <TriangleAlert />
            </span>

            <h2>탈퇴하기 전에 확인해 주세요.</h2>

            <p>
              회원 정보와 작성한 게시글 등 현재
              계정에 연결된 데이터가 삭제됩니다.
            </p>

            <p>
              삭제된 계정과 데이터는 다시 복구할 수
              없습니다.
            </p>
          </section>

          <section className="withdraw-form">
            <label htmlFor="withdraw-password">
              비밀번호 확인
            </label>

            <div className="withdraw-password-box">
              <input
                id="withdraw-password"
                type={
                  showPassword
                    ? 'text'
                    : 'password'
                }
                value={password}
                onChange={(event) =>
                  setPassword(event.target.value)
                }
                placeholder="현재 비밀번호를 입력해 주세요."
                disabled={isSubmitting}
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (previousValue) =>
                      !previousValue
                  )
                }
                aria-label={
                  showPassword
                    ? '비밀번호 숨기기'
                    : '비밀번호 보기'
                }
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff />
                ) : (
                  <Eye />
                )}
              </button>
            </div>

            <label htmlFor="withdraw-confirmation">
              탈퇴 확인
            </label>

            <p className="withdraw-confirmation-guide">
              아래 입력란에{' '}
              <strong>탈퇴하기</strong>를 정확히
              입력해 주세요.
            </p>

            <input
              id="withdraw-confirmation"
              className="withdraw-confirmation-input"
              type="text"
              value={confirmationText}
              onChange={(event) =>
                setConfirmationText(
                  event.target.value
                )
              }
              placeholder="탈퇴하기"
              autoComplete="off"
              disabled={isSubmitting}
            />

            {message && (
              <p className="withdraw-message">
                {message}
              </p>
            )}

            <button
              className="withdraw-submit-button"
              type="button"
              onClick={handleWithdraw}
              disabled={!canWithdraw}
            >
              {isSubmitting
                ? '탈퇴 처리 중...'
                : '회원 탈퇴'}
            </button>
          </section>
        </main>
      </div>
    </div>
  )
}

export default Withdraw