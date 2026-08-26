import { useState } from 'react'
import {
  Eye,
  EyeOff,
} from 'lucide-react'

import './Signup.css'
import logo from '../assets/footprint.png'

const PASSWORD_PATTERN =
  /^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,20}$/

function Signup({ onBack }) {
  const [userId, setUserId] =
    useState('')

  const [nickname, setNickname] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    passwordConfirm,
    setPasswordConfirm,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [
    showPasswordConfirm,
    setShowPasswordConfirm,
  ] = useState(false)

  const [idMessage, setIdMessage] =
    useState('')

  const [
    nicknameMessage,
    setNicknameMessage,
  ] = useState('')

  const [message, setMessage] =
    useState('')

  const [
    isIdChecked,
    setIsIdChecked,
  ] = useState(false)

  const [
    isNicknameChecked,
    setIsNicknameChecked,
  ] = useState(false)

  const [
    isIdChecking,
    setIsIdChecking,
  ] = useState(false)

  const [
    isNicknameChecking,
    setIsNicknameChecking,
  ] = useState(false)

  const [
    isSigningUp,
    setIsSigningUp,
  ] = useState(false)

  const handleUserIdChange = (event) => {
    setUserId(event.target.value)
    setIdMessage('')
    setIsIdChecked(false)
    setMessage('')
  }

  const handleNicknameChange = (event) => {
    setNickname(event.target.value)
    setNicknameMessage('')
    setIsNicknameChecked(false)
    setMessage('')
  }

  const handlePasswordChange = (event) => {
    setPassword(event.target.value)
    setMessage('')
  }

  const handlePasswordConfirmChange = (
    event
  ) => {
    setPasswordConfirm(
      event.target.value
    )
    setMessage('')
  }

  const handleIdCheck = async () => {
    const trimmedUserId =
      userId.trim()

    if (!trimmedUserId) {
      setIdMessage(
        '아이디를 입력해주세요.'
      )
      setIsIdChecked(false)
      return
    }

    if (
      !/^[a-zA-Z0-9]{1,10}$/.test(
        trimmedUserId
      )
    ) {
      setIdMessage(
        '아이디는 영문·숫자 10글자 이내로 입력해주세요.'
      )
      setIsIdChecked(false)
      return
    }

    setIsIdChecking(true)
    setIdMessage('확인 중입니다...')

    try {
      const query =
        new URLSearchParams({
          username: trimmedUserId,
        })

      const response = await fetch(
        `/api/users/check-username?${query}`
      )

      if (!response.ok) {
        setIdMessage(
          '아이디 중복 확인에 실패했습니다.'
        )
        setIsIdChecked(false)
        return
      }

      const isDuplicated =
        await response.json()

      if (isDuplicated) {
        setIdMessage(
          '이미 사용 중인 아이디입니다.'
        )
        setIsIdChecked(false)
        return
      }

      setIdMessage(
        '사용 가능한 아이디입니다.'
      )
      setIsIdChecked(true)
    } catch (error) {
      console.error(
        '아이디 중복 확인 오류:',
        error
      )

      setIdMessage(
        '서버에 연결할 수 없습니다.'
      )
      setIsIdChecked(false)
    } finally {
      setIsIdChecking(false)
    }
  }

  const handleNicknameCheck =
    async () => {
      const trimmedNickname =
        nickname.trim()

      if (!trimmedNickname) {
        setNicknameMessage(
          '닉네임을 입력해주세요.'
        )
        setIsNicknameChecked(false)
        return
      }

      if (
        !/^[가-힣a-zA-Z0-9]{1,10}$/.test(
          trimmedNickname
        )
      ) {
        setNicknameMessage(
          '특수문자 제외, 10글자 이내로 입력해주세요.'
        )
        setIsNicknameChecked(false)
        return
      }

      setIsNicknameChecking(true)
      setNicknameMessage(
        '확인 중입니다...'
      )

      try {
        const query =
          new URLSearchParams({
            nickname:
              trimmedNickname,
          })

        const response = await fetch(
          `/api/users/check-nickname?${query}`
        )

        if (!response.ok) {
          setNicknameMessage(
            '닉네임 중복 확인에 실패했습니다.'
          )
          setIsNicknameChecked(false)
          return
        }

        const isDuplicated =
          await response.json()

        if (isDuplicated) {
          setNicknameMessage(
            '이미 사용 중인 닉네임입니다.'
          )
          setIsNicknameChecked(false)
          return
        }

        setNicknameMessage(
          '사용 가능한 닉네임입니다.'
        )
        setIsNicknameChecked(true)
      } catch (error) {
        console.error(
          '닉네임 중복 확인 오류:',
          error
        )

        setNicknameMessage(
          '서버에 연결할 수 없습니다.'
        )
        setIsNicknameChecked(false)
      } finally {
        setIsNicknameChecking(false)
      }
    }

  const handleSignup = async () => {
    const trimmedUserId =
      userId.trim()

    const trimmedNickname =
      nickname.trim()

    if (
      !/^[a-zA-Z0-9]{1,10}$/.test(
        trimmedUserId
      )
    ) {
      setMessage(
        '아이디는 영문·숫자 10글자 이내로 입력해주세요.'
      )
      return
    }

    if (!isIdChecked) {
      setMessage(
        '아이디 중복 확인을 해주세요.'
      )
      return
    }

    if (
      !/^[가-힣a-zA-Z0-9]{1,10}$/.test(
        trimmedNickname
      )
    ) {
      setMessage(
        '닉네임은 특수문자를 제외하고 10글자 이내로 입력해주세요.'
      )
      return
    }

    if (!isNicknameChecked) {
      setMessage(
        '닉네임 중복 확인을 해주세요.'
      )
      return
    }

    if (
      !PASSWORD_PATTERN.test(
        password
      )
    ) {
      setMessage(
        '비밀번호는 영문, 숫자, 특수문자를 각각 포함하여 8~20자로 입력해주세요. 사용 가능한 특수문자: !@#$%^&*'
      )
      return
    }

    if (
      password !== passwordConfirm
    ) {
      setMessage(
        '비밀번호가 일치하지 않습니다.'
      )
      return
    }

    setIsSigningUp(true)
    setMessage('')

    try {
      const response = await fetch(
        '/api/users/signup',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username:
              trimmedUserId,
            password,
            nickname:
              trimmedNickname,
          }),
        }
      )

      const result =
        await response.text()

      if (!response.ok) {
        setMessage(
          result ||
            '회원가입에 실패했습니다.'
        )
        return
      }

      setMessage(
        '회원가입이 완료되었습니다.'
      )

      setTimeout(() => {
        onBack?.()
      }, 1000)
    } catch (error) {
      console.error(
        '회원가입 오류:',
        error
      )

      setMessage(
        '서버에 연결할 수 없습니다.'
      )
    } finally {
      setIsSigningUp(false)
    }
  }

  return (
    <div className="signup-page">
      <div className="signup-container">
        <div className="signup-title">
          <h1>회원가입</h1>

          <img
            src={logo}
            alt="발자국"
          />
        </div>

        <div className="signup-field">
          <div className="label-row">
            <label htmlFor="signup-user-id">
              아이디
            </label>

            <span>
              영문, 숫자 10글자 내
            </span>
          </div>

          <div className="id-input-row">
            <input
              id="signup-user-id"
              type="text"
              value={userId}
              onChange={
                handleUserIdChange
              }
              maxLength={10}
              disabled={isSigningUp}
            />

            <button
              type="button"
              className="check-button"
              onClick={handleIdCheck}
              disabled={
                isIdChecking ||
                isSigningUp
              }
            >
              {isIdChecking ? (
                <>
                  확인
                  <br />
                  중
                </>
              ) : (
                <>
                  중복
                  <br />
                  확인
                </>
              )}
            </button>
          </div>

          {idMessage && (
            <p className="input-message">
              {idMessage}
            </p>
          )}
        </div>

        <div className="signup-field">
          <div className="label-row">
            <label htmlFor="signup-nickname">
              닉네임
            </label>

            <span>
              특수문자 제외, 10글자 내
              (한글, 영문, 숫자 가능)
            </span>
          </div>

          <div className="id-input-row">
            <input
              id="signup-nickname"
              type="text"
              value={nickname}
              onChange={
                handleNicknameChange
              }
              maxLength={10}
              disabled={isSigningUp}
            />

            <button
              type="button"
              className="check-button"
              onClick={
                handleNicknameCheck
              }
              disabled={
                isNicknameChecking ||
                isSigningUp
              }
            >
              {isNicknameChecking ? (
                <>
                  확인
                  <br />
                  중
                </>
              ) : (
                <>
                  중복
                  <br />
                  확인
                </>
              )}
            </button>
          </div>

          {nicknameMessage && (
            <p className="input-message">
              {nicknameMessage}
            </p>
          )}
        </div>

        <div className="signup-field">
          <div className="label-row">
            <label htmlFor="signup-password">
              비밀번호
            </label>

            <span>
              영문+숫자+특수문자
              (!@#$%^&*) 8~20자
            </span>
          </div>

          <div className="password-input-box">
            <input
              id="signup-password"
              type={
                showPassword
                  ? 'text'
                  : 'password'
              }
              value={password}
              onChange={
                handlePasswordChange
              }
              minLength={8}
              maxLength={20}
              autoComplete="new-password"
              disabled={isSigningUp}
            />

            <button
              type="button"
              className="password-eye"
              onClick={() =>
                setShowPassword(
                  (previousValue) =>
                    !previousValue
                )
              }
              disabled={isSigningUp}
              aria-label={
                showPassword
                  ? '비밀번호 숨기기'
                  : '비밀번호 보기'
              }
            >
              {showPassword ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        <div className="signup-field">
          <div className="label-row">
            <label htmlFor="signup-password-confirm">
              비밀번호 확인
            </label>
          </div>

          <div className="password-input-box">
            <input
              id="signup-password-confirm"
              type={
                showPasswordConfirm
                  ? 'text'
                  : 'password'
              }
              value={passwordConfirm}
              onChange={
                handlePasswordConfirmChange
              }
              minLength={8}
              maxLength={20}
              autoComplete="new-password"
              disabled={isSigningUp}
            />

            <button
              type="button"
              className="password-eye"
              onClick={() =>
                setShowPasswordConfirm(
                  (previousValue) =>
                    !previousValue
                )
              }
              disabled={isSigningUp}
              aria-label={
                showPasswordConfirm
                  ? '비밀번호 숨기기'
                  : '비밀번호 보기'
              }
            >
              {showPasswordConfirm ? (
                <EyeOff size={18} />
              ) : (
                <Eye size={18} />
              )}
            </button>
          </div>
        </div>

        {message && (
          <p className="signup-message">
            {message}
          </p>
        )}

        <button
          type="button"
          className="complete-button"
          onClick={handleSignup}
          disabled={isSigningUp}
        >
          {isSigningUp
            ? '처리 중...'
            : '완료'}
        </button>

        <button
          type="button"
          className="back-login-button"
          onClick={onBack}
          disabled={isSigningUp}
        >
          로그인으로 돌아가기
        </button>
      </div>
    </div>
  )
}

export default Signup