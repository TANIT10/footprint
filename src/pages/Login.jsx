import { useState } from 'react'

import './Login.css'

import logo from '../assets/logo.png'

import LoadingScreen from './LoadingScreen'

function Login({
  onSignup,
  onLoginSuccess,
}) {
  const [
    username,
    setUsername,
  ] = useState('')

  const [
    password,
    setPassword,
  ] = useState('')

  const [
    loginMessage,
    setLoginMessage,
  ] = useState('')

  const [
    isLoggingIn,
    setIsLoggingIn,
  ] = useState(false)

  const handleUsernameChange = (
    event
  ) => {
    setUsername(event.target.value)
    setLoginMessage('')
  }

  const handlePasswordChange = (
    event
  ) => {
    setPassword(event.target.value)
    setLoginMessage('')
  }

  const handleLogin = async (
    event
  ) => {
    event?.preventDefault()

    const trimmedUsername =
      username.trim()

    if (
      !trimmedUsername ||
      !password
    ) {
      setLoginMessage(
        '아이디와 비밀번호를 입력해 주세요.'
      )
      return
    }

    if (isLoggingIn) {
      return
    }

    setIsLoggingIn(true)
    setLoginMessage('')

    try {
      const response = await fetch(
        'http://localhost:8080/api/users/login',
        {
          method: 'POST',
          headers: {
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            username:
              trimmedUsername,
            password,
          }),
        }
      )

      if (!response.ok) {
        setLoginMessage(
          '아이디 또는 비밀번호가 올바르지 않습니다.'
        )
        return
      }

      const data =
        await response.json()

      const nickname =
        data.nickname

      if (!nickname) {
        setLoginMessage(
          '이 계정에는 닉네임이 등록되어 있지 않습니다.'
        )
        return
      }

      localStorage.setItem(
        'token',
        data.token
      )

      localStorage.setItem(
        'footprint-current-nickname',
        nickname
      )

      onLoginSuccess?.({
        nickname,
        username:
          data.username ||
          trimmedUsername,
      })
    } catch (error) {
      console.error(
        '로그인 오류:',
        error
      )

      setLoginMessage(
        '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.'
      )
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (isLoggingIn) {
    return <LoadingScreen />
  }

  return (
    <div className="login-page">
      <main className="login-container">
        <div className="login-logo">
          <img
            src={logo}
            alt="발자국 로고"
          />
        </div>

        <form
          className="login-form"
          onSubmit={handleLogin}
        >
          <div className="login-input-box">
            <div className="login-input">
              <label
                className="login-hidden-label"
                htmlFor="login-username"
              >
                아이디
              </label>

              <input
                id="login-username"
                type="text"
                placeholder="아이디"
                value={username}
                onChange={
                  handleUsernameChange
                }
                maxLength={10}
                autoComplete="username"
              />
            </div>

            <div className="login-input">
              <label
                className="login-hidden-label"
                htmlFor="login-password"
              >
                비밀번호
              </label>

              <input
                id="login-password"
                type="password"
                placeholder="비밀번호"
                value={password}
                onChange={
                  handlePasswordChange
                }
                maxLength={16}
                autoComplete="current-password"
              />
            </div>
          </div>

          <div
            className="login-message-area"
            aria-live="polite"
          >
            {loginMessage && (
              <p className="login-message">
                {loginMessage}
              </p>
            )}
          </div>

          <button
            className="login-button"
            type="submit"
          >
            로그인
          </button>
        </form>

        <button
          className="signup-button"
          type="button"
          onClick={onSignup}
        >
          회원가입
        </button>
      </main>
    </div>
  )
}

export default Login