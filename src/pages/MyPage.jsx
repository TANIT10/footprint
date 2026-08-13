import {
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  X,
} from 'lucide-react'

import './MyPage.css'

import bell from '../assets/bell.png'
import footprint from '../assets/footprint.png'
import myPageHouse from '../assets/mypage-house.png'

const PROFILE_IMAGES_KEY =
  'footprint-profile-images'

const LEGACY_PROFILE_IMAGE_KEY =
  'footprint-profile-image'

function readProfileImageMap() {
  try {
    const savedProfileImages =
      localStorage.getItem(
        PROFILE_IMAGES_KEY
      )

    const parsedProfileImages =
      savedProfileImages
        ? JSON.parse(savedProfileImages)
        : {}

    if (
      parsedProfileImages &&
      typeof parsedProfileImages ===
        'object' &&
      !Array.isArray(parsedProfileImages)
    ) {
      return parsedProfileImages
    }

    return {}
  } catch (error) {
    console.error(
      '프로필 사진 정보를 불러오지 못했습니다.',
      error
    )

    return {}
  }
}

function compressProfileImage(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onerror = () => {
      reject(
        new Error(
          '사진 파일을 읽지 못했습니다.'
        )
      )
    }

    reader.onload = () => {
      const image = new Image()

      image.onerror = () => {
        reject(
          new Error(
            '사진을 불러오지 못했습니다.'
          )
        )
      }

      image.onload = () => {
        const maximumSize = 720

        const scale = Math.min(
          1,
          maximumSize / image.width,
          maximumSize / image.height
        )

        const canvas =
          document.createElement('canvas')

        canvas.width = Math.max(
          1,
          Math.round(image.width * scale)
        )

        canvas.height = Math.max(
          1,
          Math.round(image.height * scale)
        )

        const context =
          canvas.getContext('2d')

        if (!context) {
          reject(
            new Error(
              '사진 압축 기능을 사용할 수 없습니다.'
            )
          )
          return
        }

        context.fillStyle = '#ffffff'
        context.fillRect(
          0,
          0,
          canvas.width,
          canvas.height
        )

        context.drawImage(
          image,
          0,
          0,
          canvas.width,
          canvas.height
        )

        const compressedImage =
          canvas.toDataURL(
            'image/jpeg',
            0.78
          )

        resolve(compressedImage)
      }

      image.src = reader.result
    }

    reader.readAsDataURL(file)
  })
}

function MyPage({
  nickname,
  username,
  onBack,
  onMyPosts,
  onNotices,
  onNotifications,
  hasUnreadNotification,
  onInquiry,
  onWithdraw,
  onProfileImageChange,
}) {
  const fileInputRef = useRef(null)

  const [profileImage, setProfileImage] =
    useState(() => {
      const profileImageMap =
        readProfileImageMap()

      return username
        ? profileImageMap[username] ?? ''
        : ''
    })

  const [
    isProfileMenuOpen,
    setIsProfileMenuOpen,
  ] = useState(false)

  const [
    isLargeProfileOpen,
    setIsLargeProfileOpen,
  ] = useState(false)

  const [
    isProfileImageProcessing,
    setIsProfileImageProcessing,
  ] = useState(false)

  /*
   * 예전 공통 키에 저장된 프로필 사진이
   * 있다면 현재 로그인 계정으로 한 번 이전
   */
  useEffect(() => {
    if (!username) {
      setProfileImage('')
      return
    }

    const profileImageMap =
      readProfileImageMap()

    const savedUserProfileImage =
      profileImageMap[username]

    if (savedUserProfileImage) {
      setProfileImage(
        savedUserProfileImage
      )
      return
    }

    const legacyProfileImage =
      localStorage.getItem(
        LEGACY_PROFILE_IMAGE_KEY
      )

    if (!legacyProfileImage) {
      setProfileImage('')
      return
    }

    try {
      const updatedProfileImageMap = {
        ...profileImageMap,
        [username]: legacyProfileImage,
      }

      localStorage.setItem(
        PROFILE_IMAGES_KEY,
        JSON.stringify(
          updatedProfileImageMap
        )
      )

      localStorage.removeItem(
        LEGACY_PROFILE_IMAGE_KEY
      )

      setProfileImage(
        legacyProfileImage
      )

      onProfileImageChange?.(
        username,
        legacyProfileImage
      )
    } catch (error) {
      console.error(
        '기존 프로필 사진 이전 실패:',
        error
      )
    }
  }, [username, onProfileImageChange])

  const handleProfileChange = async (
    event
  ) => {
    const file = event.target.files?.[0]

    event.target.value = ''

    if (!file) {
      return
    }

    if (!file.type.startsWith('image/')) {
      window.alert(
        '이미지 파일만 선택할 수 있어요.'
      )
      return
    }

    if (!username) {
      window.alert(
        '로그인 정보를 찾을 수 없어요. 다시 로그인해 주세요.'
      )
      return
    }

    setIsProfileImageProcessing(true)

    try {
      const compressedImage =
        await compressProfileImage(file)

      const profileImageMap =
        readProfileImageMap()

      const updatedProfileImageMap = {
        ...profileImageMap,
        [username]: compressedImage,
      }

      localStorage.setItem(
        PROFILE_IMAGES_KEY,
        JSON.stringify(
          updatedProfileImageMap
        )
      )

      setProfileImage(compressedImage)
      setIsProfileMenuOpen(false)

      onProfileImageChange?.(
        username,
        compressedImage
      )
    } catch (error) {
      console.error(
        '프로필 사진 저장 실패:',
        error
      )

      window.alert(
        '프로필 사진을 저장하지 못했어요. 다른 사진을 선택해 주세요.'
      )
    } finally {
      setIsProfileImageProcessing(false)
    }
  }

  const handleLargeProfileOpen = () => {
    setIsProfileMenuOpen(false)
    setIsLargeProfileOpen(true)
  }

  const handleProfileFileOpen = () => {
    if (isProfileImageProcessing) {
      return
    }

    fileInputRef.current?.click()
  }

  return (
    <div className="my-page">
      <div className="my-page-inner">
        <header className="my-page-header">
          <button
            className="my-page-back-button"
            type="button"
            onClick={onBack}
            aria-label="게시글 목록으로 돌아가기"
          >
            <ArrowLeft />
          </button>

          <button
            className="my-page-notification-button"
            type="button"
            onClick={onNotifications}
            aria-label={
              hasUnreadNotification
                ? '알림, 읽지 않은 알림 있음'
                : '알림'
            }
          >
            <img src={bell} alt="" />

            {hasUnreadNotification && (
              <span
                className="my-page-notification-badge"
                aria-hidden="true"
              />
            )}
          </button>
        </header>

        <main className="my-page-content">
          <section className="profile-section">
            <button
              className="profile-image-button"
              type="button"
              onClick={() =>
                setIsProfileMenuOpen(true)
              }
              aria-label="프로필 사진 메뉴 열기"
            >
              <span className="profile-image-box">
                <img
                  className={
                    profileImage
                      ? 'profile-image'
                      : 'default-profile-image'
                  }
                  src={
                    profileImage ||
                    footprint
                  }
                  alt="프로필"
                />
              </span>
            </button>

            <div className="profile-information">
              <strong className="profile-nickname">
                {nickname || '닉네임'}
              </strong>

              <span className="profile-username">
                @{username || '아이디'}
              </span>
            </div>
          </section>

          <div className="my-page-divider" />

          <nav className="my-page-menu">
            <button
              className="my-page-menu-button"
              type="button"
              onClick={onMyPosts}
            >
              <span>
                내가 작성한 게시글
              </span>

              <span className="menu-arrow">
                ›
              </span>
            </button>

            <button
              className="my-page-menu-button"
              type="button"
              onClick={onNotices}
            >
              <span>공지사항</span>

              <span className="menu-arrow">
                ›
              </span>
            </button>

            <button
              className="my-page-menu-button"
              type="button"
              onClick={onInquiry}
            >
              <span>문의하기</span>

              <span className="menu-arrow">
                ›
              </span>
            </button>

            <button
              className="my-page-menu-button withdraw-button"
              type="button"
              onClick={onWithdraw}
            >
              <span>탈퇴하기</span>

              <span className="menu-arrow">
                ›
              </span>
            </button>
          </nav>
        </main>

        <img
          className="my-page-house-image"
          src={myPageHouse}
          alt=""
        />

        <input
          ref={fileInputRef}
          className="profile-file-input"
          type="file"
          accept="image/*"
          onChange={handleProfileChange}
        />

        {isProfileMenuOpen && (
          <div
            className="profile-modal-background"
            onClick={() =>
              setIsProfileMenuOpen(false)
            }
          >
            <section
              className="profile-action-sheet"
              onClick={(event) =>
                event.stopPropagation()
              }
              aria-label="프로필 사진 메뉴"
            >
              <button
                type="button"
                onClick={
                  handleLargeProfileOpen
                }
              >
                프로필 크게 보기
              </button>

              <button
                type="button"
                onClick={
                  handleProfileFileOpen
                }
                disabled={
                  isProfileImageProcessing
                }
              >
                {isProfileImageProcessing
                  ? '사진 처리 중...'
                  : '프로필 사진 변경'}
              </button>

              <button
                className="profile-cancel-button"
                type="button"
                onClick={() =>
                  setIsProfileMenuOpen(false)
                }
                disabled={
                  isProfileImageProcessing
                }
              >
                취소
              </button>
            </section>
          </div>
        )}

        {isLargeProfileOpen && (
          <div
            className="large-profile-background"
            onClick={() =>
              setIsLargeProfileOpen(false)
            }
          >
            <button
              className="large-profile-close-button"
              type="button"
              onClick={() =>
                setIsLargeProfileOpen(false)
              }
              aria-label="프로필 크게 보기 닫기"
            >
              <X />
            </button>

            <div
              className="large-profile-image-box"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <img
                className={
                  profileImage
                    ? 'large-profile-image'
                    : 'large-default-profile-image'
                }
                src={
                  profileImage ||
                  footprint
                }
                alt="프로필 크게 보기"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default MyPage