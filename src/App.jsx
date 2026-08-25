import {
  useCallback,
  useEffect,
  useState,
} from 'react'

import Start from './pages/Start'
import Login from './pages/Login'
import Signup from './pages/Signup'
import PostList from './pages/PostList'
import PostWrite from './pages/PostWrite'
import PostDetail from './pages/PostDetail'
import MyPage from './pages/MyPage'
import MyPosts from './pages/MyPosts'
import Notifications from './pages/Notifications'
import NoticeList from './pages/NoticeList'
import NoticeDetail from './pages/NoticeDetail'
import Inquiry from './pages/Inquiry'
import Withdraw from './pages/Withdraw'
import UserProfile from './pages/UserProfile'
import LoadingScreen from './pages/LoadingScreen'
import SimilarFootprints from './pages/SimilarFootprints'
import Community from './pages/Community'
import CommunityWrite from './pages/CommunityWrite'
import CommunityDetail from './pages/CommunityDetail'
import AdminPage from './pages/AdminPage'
import AdminReports from './pages/AdminReports'
import AdminReportDetail from './pages/AdminReportDetail'
import AdminNotices from './pages/AdminNotices'
import AdminNoticeWrite from './pages/AdminNoticeWrite'
import AdminNoticeDetail from './pages/AdminNoticeDetail'
import AdminInquiries from './pages/AdminInquiries'
import AdminInquiryDetail from './pages/AdminInquiryDetail'



const CURRENT_NICKNAME_KEY =
  'footprint-current-nickname'

const CURRENT_USERNAME_KEY =
  'footprint-current-username'

const PROFILE_IMAGES_KEY =
  'footprint-profile-images'

const API_BASE_URL =
  'http://localhost:8080'

const EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY = {
  hasNew: false,
  totalNewCount: 0,
  newCountByMissingPost: {},
}

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

async function readErrorMessage(
  response,
  defaultMessage
) {
  try {
    const errorBody =
      await response.json()

    return (
      errorBody.message ||
      errorBody.error ||
      defaultMessage
    )
  } catch {
    return defaultMessage
  }
}

function normalizeComment(comment) {
  return {
    ...comment,
    author:
      comment.authorNickname ||
      comment.authorUsername ||
      '익명',
  }
}

function createPostFormData(
  requestData,
  imageFiles,
  imagePartName
) {
  const multipartData =
    new FormData()

  multipartData.append(
    'data',
    new Blob(
      [
        JSON.stringify(
          requestData
        ),
      ],
      {
        type: 'application/json',
      }
    )
  )

  imageFiles.forEach(
    (imageFile) => {
      multipartData.append(
        imagePartName,
        imageFile
      )
    }
  )

  return multipartData
}

function normalizeSimilarFootprintNewSummary(
  value
) {
  if (
    !value ||
    typeof value !== 'object'
  ) {
    return {
      ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
    }
  }

  const rawCountMap =
    value.newCountByMissingPost

  const newCountByMissingPost =
    rawCountMap &&
    typeof rawCountMap === 'object' &&
    !Array.isArray(rawCountMap)
      ? rawCountMap
      : {}

  return {
    hasNew:
      Boolean(value.hasNew),

    totalNewCount:
      Number(
        value.totalNewCount ?? 0
      ) || 0,

    newCountByMissingPost,
  }
}

function getNewCountForMissingPost(
  summary,
  missingPostId
) {
  if (
    !summary ||
    !missingPostId
  ) {
    return 0
  }

  const countMap =
    summary.newCountByMissingPost ??
    {}

  const value =
    countMap[
      String(missingPostId)
    ] ??
    countMap[
      missingPostId
    ] ??
    0

  return Number(value) || 0
}

function App() {
  const [page, setPage] =
    useState('start')

  const [
    selectedPostId,
    setSelectedPostId,
  ] = useState(null)

  const [
    selectedPost,
    setSelectedPost,
  ] = useState(null)

  const [
    selectedNoticeId,
    setSelectedNoticeId,
  ] = useState(null)

  const [
    selectedCommunityPostId,
    setSelectedCommunityPostId,
  ] = useState(null)

  const [
    editingCommunityPost,
    setEditingCommunityPost,
  ] = useState(null)

  const [
    communityDetailBackPage,
    setCommunityDetailBackPage,
  ] = useState('community')

  const [
    detailBackPage,
    setDetailBackPage,
  ] = useState('postList')

  const [
    noticeDetailBackPage,
    setNoticeDetailBackPage,
  ] = useState('noticeList')

  const [
    noticeListBackPage,
    setNoticeListBackPage,
  ] = useState('myPage')

  const [
    notificationBackPage,
    setNotificationBackPage,
  ] = useState('postList')

  const [
    isAdmin,
    setIsAdmin,
  ] = useState(false)

  const [
    selectedAdminReportId,
    setSelectedAdminReportId,
  ] = useState(null)

  const [
    selectedAdminNoticeId,
    setSelectedAdminNoticeId,
  ] = useState(null)

  const [
    selectedAdminInquiry,
    setSelectedAdminInquiry,
  ] = useState(null)

  const [
    currentNickname,
    setCurrentNickname,
  ] = useState(
    () =>
      localStorage.getItem(
        CURRENT_NICKNAME_KEY
      ) ?? ''
  )

  const [
    currentUsername,
    setCurrentUsername,
  ] = useState(
    () =>
      localStorage.getItem(
        CURRENT_USERNAME_KEY
      ) ?? ''
  )

  const [
    profileImages,
    setProfileImages,
  ] = useState(
    () => readProfileImageMap()
  )

  const [
    selectedProfile,
    setSelectedProfile,
  ] = useState(null)

  const [
    profileBackPage,
    setProfileBackPage,
  ] = useState(
    'postDetail'
  )

  const [
    posts,
    setPosts,
  ] = useState([])

  const [
    myPosts,
    setMyPosts,
  ] = useState([])

  const [
    myCommunityPosts,
    setMyCommunityPosts,
  ] = useState([])

  const [
    notifications,
    setNotifications,
  ] = useState([])

  const [
    similarFootprintGroups,
    setSimilarFootprintGroups,
  ] = useState([])

  const [
    similarFootprintNewSummary,
    setSimilarFootprintNewSummary,
  ] = useState(
    {
      ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
    }
  )

  const checkAdminAccess =
    useCallback(
      async (
        username
      ) => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (
          !token ||
          !username
        ) {
          setIsAdmin(
            false
          )

          return false
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/admin/community/users/${encodeURIComponent(
                username
              )}`,
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
            setIsAdmin(
              false
            )

            return false
          }

          if (
            response.status ===
            401
          ) {
            setIsAdmin(
              false
            )

            return false
          }

          if (!response.ok) {
            setIsAdmin(
              false
            )

            return false
          }

          setIsAdmin(
            true
          )

          return true
        } catch (error) {
          console.error(
            '관리자 권한 확인 실패:',
            error
          )

          setIsAdmin(
            false
          )

          return false
        }
      },
      []
    )

  const loadPosts =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        setPosts([])
        return []
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/posts?page=0`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '게시글 목록을 불러오지 못했습니다.'
            )
          )
        }

        const postPage =
          await response.json()

        const loadedPosts =
          Array.isArray(
            postPage.posts
          )
            ? postPage.posts
            : []

        setPosts(
          loadedPosts
        )

        return loadedPosts
      } catch (error) {
        console.error(
          '게시글 목록 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '게시글 목록을 불러오지 못했어요.'
        )

        return []
      }
    }, [])

  const loadMyPosts =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        setMyPosts([])
        return []
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/posts/me?page=0`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '내 게시글을 불러오지 못했습니다.'
            )
          )
        }

        const postPage =
          await response.json()

        const loadedMyPosts =
          Array.isArray(
            postPage.posts
          )
            ? postPage.posts
            : []

        setMyPosts(
          loadedMyPosts
        )

        return loadedMyPosts
      } catch (error) {
        console.error(
          '내 게시글 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '내 게시글을 불러오지 못했어요.'
        )

        return []
      }
    }, [])

  const loadMyCommunityPosts =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        setMyCommunityPosts([])
        return []
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/community/posts/my?page=0`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '내 커뮤니티 글을 불러오지 못했습니다.'
            )
          )
        }

        const postPage =
          await response.json()

        const loadedPosts =
          Array.isArray(
            postPage.content
          )
            ? postPage.content
            : []

        setMyCommunityPosts(
          loadedPosts
        )

        return loadedPosts
      } catch (error) {
        console.error(
          '내 커뮤니티 글 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '내 커뮤니티 글을 불러오지 못했어요.'
        )

        setMyCommunityPosts([])

        return []
      }
    }, [])

  const loadPostDetail =
    useCallback(
      async (postId) => {
        const token =
          localStorage.getItem(
            'token'
          )

        if (!token) {
          window.alert(
            '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
          )

          return null
        }

        try {
          const response =
            await fetch(
              `${API_BASE_URL}/api/posts/${postId}`,
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
              401 ||
            response.status ===
              403
          ) {
            throw new Error(
              '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
            )
          }

          if (
            response.status ===
            404
          ) {
            throw new Error(
              '삭제되었거나 찾을 수 없는 게시글이에요.'
            )
          }

          if (!response.ok) {
            throw new Error(
              await readErrorMessage(
                response,
                '게시글을 불러오지 못했습니다.'
              )
            )
          }

          const postDetail =
            await response.json()

          const commentsResponse =
            await fetch(
              `${API_BASE_URL}/api/posts/${postId}/comments`,
              {
                method: 'GET',
                headers: {
                  Authorization:
                    `Bearer ${token}`,
                },
              }
            )

          if (
            commentsResponse.status ===
              401 ||
            commentsResponse.status ===
              403
          ) {
            throw new Error(
              '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
            )
          }

          if (
            !commentsResponse.ok
          ) {
            throw new Error(
              await readErrorMessage(
                commentsResponse,
                '댓글을 불러오지 못했습니다.'
              )
            )
          }

          const commentResponses =
            await commentsResponse.json()

          const comments =
            Array.isArray(
              commentResponses
            )
              ? commentResponses.map(
                  normalizeComment
                )
              : []

          setProfileImages(
            (
              previousProfileImages
            ) => {
              const updatedProfileImages =
                {
                  ...previousProfileImages,
                }

              comments.forEach(
                (savedComment) => {
                  if (
                    savedComment
                      .authorUsername &&
                    savedComment
                      .authorProfileImageUrl
                  ) {
                    updatedProfileImages[
                      savedComment
                        .authorUsername
                    ] =
                      savedComment
                        .authorProfileImageUrl
                  }
                }
              )

              return updatedProfileImages
            }
          )

          setSelectedPost({
            ...postDetail,
            comments,
          })

          setSelectedPostId(
            postDetail.id
          )

          return postDetail
        } catch (error) {
          console.error(
            '게시글 상세 조회 실패:',
            error
          )

          window.alert(
            error.message ||
              '게시글을 불러오지 못했어요.'
          )

          return null
        }
      },
      []
    )

  const loadNotifications =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        setNotifications([])
        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications?page=0`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다.'
          )
        }

        if (!response.ok) {
          throw new Error(
            '알림을 불러오지 못했습니다.'
          )
        }

        const notificationPage =
          await response.json()

        setNotifications(
          Array.isArray(
            notificationPage
              .notifications
          )
            ? notificationPage
                .notifications
            : []
        )
      } catch (error) {
        console.error(
          '알림을 불러오지 못했습니다.',
          error
        )
      }
    }, [])

  const loadSimilarFootprintNewSummary =
    useCallback(async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        const emptySummary = {
          ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
        }

        setSimilarFootprintNewSummary(
          emptySummary
        )

        return emptySummary
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/ai-match/status/new`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '닮은 발자국 NEW 상태를 불러오지 못했습니다.'
            )
          )
        }

        const responseBody =
          await response.json()

        const normalizedSummary =
          normalizeSimilarFootprintNewSummary(
            responseBody
          )

        setSimilarFootprintNewSummary(
          normalizedSummary
        )

        return normalizedSummary
      } catch (error) {
        console.error(
          '닮은 발자국 NEW 상태 조회 실패:',
          error
        )

        const emptySummary = {
          ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
        }

        setSimilarFootprintNewSummary(
          emptySummary
        )

        return emptySummary
      }
    }, [])

  const applyNewSummaryToGroups =
    useCallback(
      (summary) => {
        setSimilarFootprintGroups(
          (previousGroups) =>
            previousGroups.map(
              (group) => {
                const newCount =
                  getNewCountForMissingPost(
                    summary,
                    group.missingPostId
                  )

                return {
                  ...group,
                  newCount,
                  hasNew:
                    newCount > 0,
                }
              }
            )
        )
      },
      []
    )

  useEffect(() => {
    if (!currentUsername) {
      setIsAdmin(
        false
      )

      return
    }

    checkAdminAccess(
      currentUsername
    )
  }, [
    currentUsername,
    checkAdminAccess,
  ])

  useEffect(() => {
    if (
      page ===
        'postList' ||
      page ===
        'userProfile'
    ) {
      loadPosts()
    }
  }, [
    page,
    loadPosts,
  ])

  useEffect(() => {
    if (
      page ===
      'myPosts'
    ) {
      loadMyPosts()
      loadMyCommunityPosts()
    }
  }, [
    page,
    loadMyPosts,
    loadMyCommunityPosts,
  ])

  useEffect(() => {
    if (!currentUsername) {
      setNotifications([])
      return
    }

    if (
      page ===
        'postList' ||
      page ===
        'myPage' ||
      page ===
        'notifications'
    ) {
      loadNotifications()
    }
  }, [
    currentUsername,
    page,
    loadNotifications,
  ])

  useEffect(() => {
    if (!currentUsername) {
      setSimilarFootprintNewSummary({
        ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
      })

      return
    }

    if (
      page ===
        'postList' ||
      page ===
        'myPage'
    ) {
      loadSimilarFootprintNewSummary()
    }
  }, [
    currentUsername,
    page,
    loadSimilarFootprintNewSummary,
  ])

  /*
   * 로그인 중에는 어느 화면에 있더라도
   * 새 알림을 자동으로 갱신합니다.
   *
   * 관리자 경고/정지 같은 SYSTEM 알림도
   * 새로고침 없이 최대 약 3초 안에 반영됩니다.
   */
  useEffect(() => {
    if (!currentUsername) {
      return undefined
    }

    const refreshNotifications =
      () => {
        loadNotifications()
      }

    refreshNotifications()

    const intervalId =
      window.setInterval(
        refreshNotifications,
        3000
      )

    const handleWindowFocus =
      () => {
        refreshNotifications()
      }

    window.addEventListener(
      'focus',
      handleWindowFocus
    )

    return () => {
      window.clearInterval(
        intervalId
      )

      window.removeEventListener(
        'focus',
        handleWindowFocus
      )
    }
  }, [
    currentUsername,
    page,
    loadNotifications,
  ])

  /*
   * 닮은 발자국 NEW 상태는 필요한 화면에서만
   * 기존처럼 가볍게 갱신합니다.
   */
  useEffect(() => {
    if (!currentUsername) {
      return undefined
    }

    const shouldRefreshSimilarStatus =
      page === 'postList' ||
      page === 'myPage' ||
      page === 'notifications'

    if (!shouldRefreshSimilarStatus) {
      return undefined
    }

    const refreshSimilarStatus =
      () => {
        loadSimilarFootprintNewSummary()
      }

    const intervalId =
      window.setInterval(
        refreshSimilarStatus,
        5000
      )

    return () => {
      window.clearInterval(
        intervalId
      )
    }
  }, [
    currentUsername,
    page,
    loadSimilarFootprintNewSummary,
  ])

  const currentUserNotifications = [
    ...notifications,
  ].sort(
    (
      firstNotification,
      secondNotification
    ) =>
      new Date(
        secondNotification
          .createdAt
      ).getTime() -
      new Date(
        firstNotification
          .createdAt
      ).getTime()
  )

  const hasUnreadNotification =
    currentUserNotifications.some(
      (notification) =>
        !notification.isRead
    )

  const handleProfileImageChange =
    useCallback(
      (
        username,
        profileImage
      ) => {
        if (!username) {
          return
        }

        setProfileImages(
          (
            previousProfileImages
          ) => {
            const updatedProfileImages =
              {
                ...previousProfileImages,
                [username]:
                  profileImage,
              }

            try {
              localStorage.setItem(
                PROFILE_IMAGES_KEY,
                JSON.stringify(
                  updatedProfileImages
                )
              )
            } catch (error) {
              console.error(
                '프로필 사진 정보 저장 실패:',
                error
              )
            }

            return updatedProfileImages
          }
        )
      },
      []
    )

  const handleLoginSuccess =
    async ({
      nickname,
      username,
    }) => {
      setCurrentNickname(
        nickname
      )

      setCurrentUsername(
        username
      )

      localStorage.setItem(
        CURRENT_NICKNAME_KEY,
        nickname
      )

      localStorage.setItem(
        CURRENT_USERNAME_KEY,
        username
      )

      setProfileImages(
        readProfileImageMap()
      )

      await checkAdminAccess(
        username
      )

      setPage('loading')

      await Promise.all([
        loadPosts(),

        new Promise(
          (resolve) => {
            window.setTimeout(
              resolve,
              3200
            )
          }
        ),
      ])

      setPage('postList')
    }

  const handlePostComplete =
    async ({
      data,
      newImages,
    }) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        throw new Error(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )
      }

      const multipartData =
        createPostFormData(
          data,
          newImages,
          'images'
        )

      const response =
        await fetch(
          `${API_BASE_URL}/api/posts`,
          {
            method: 'POST',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body:
              multipartData,
          }
        )

      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        throw new Error(
          '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
        )
      }

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            '게시글을 등록하지 못했습니다.'
          )
        )
      }

      await response.json()

      await loadPosts()

      setPage(
        'postList'
      )

      window.alert(
        '게시글이 등록됐어요.'
      )
    }

  const handleAiMatch =
    async (
      missingPostId
    ) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인이 필요합니다.'
        )

        return []
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/ai-match/posts/${missingPostId}`,
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
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              'AI 매칭 결과를 불러오지 못했습니다.'
            )
          )
        }

        const results =
          await response.json()

        return Array.isArray(
          results
        )
          ? results
          : []
      } catch (error) {
        console.error(
          'AI 매칭 실패:',
          error
        )

        window.alert(
          error.message ||
            'AI 매칭에 실패했습니다.'
        )

        return []
      }
    }

  const handleSimilarFootprintsOpen =
    async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인이 필요합니다.'
        )

        return
      }

      /*
       * 1. 내 찾아요 게시글만 먼저 조회한다.
       */
      const loadedMyPosts =
        await loadMyPosts()

      const missingPosts =
        loadedMyPosts.filter(
          (post) =>
            post.postType ===
            'MISSING'
        )

      if (
        missingPosts.length ===
        0
      ) {
        setSimilarFootprintGroups(
          []
        )

        const newSummary =
          await loadSimilarFootprintNewSummary()

        setSimilarFootprintNewSummary(
          newSummary
        )

        setPage(
          'similarFootprints'
        )

        return
      }

      /*
       * 2. 찾아요 글별 저장된 후보를 병렬 조회한다.
       *
       * 서버의 GET /api/ai-match/posts/{missingPostId}는
       * 이제 FastAPI를 다시 실행하지 않고
       * AiMatchCandidateStatus에 저장된 결과만 반환한다.
       *
       * 후보 카드에 필요한 breed/location/date/createdAt/
       * representativeImage도 서버가 함께 내려주므로
       * 후보마다 /api/posts/{id}를 다시 호출하지 않는다.
       */
      const [groups, newSummary] =
        await Promise.all([
          Promise.all(
            missingPosts.map(
              async (
                missingPost
              ) => {
                const savedResults =
                  await handleAiMatch(
                    missingPost.id
                  )

                const candidates =
                  savedResults
                    .filter(
                      (result) =>
                        Number(
                          result.combined_score ??
                            0
                        ) >= 60
                    )
                    .map(
                      (result) => ({
                        ...result,

                        breed:
                          result.breed ??
                          '품종 미상',

                        location:
                          result.location ??
                          '장소 정보 없음',

                        date:
                          result.date ??
                          null,

                        createdAt:
                          result.createdAt ??
                          null,

                        representativeImage:
                          result.representativeImage ??
                          '',

                        requiresAttention:
                          Boolean(
                            result.requiresAttention
                          ) ||
                          Number(
                            result.combined_score ??
                              0
                          ) >= 70,

                        newCandidate:
                          Boolean(
                            result.newCandidate
                          ),
                      })
                    )

                return {
                  missingPostId:
                    missingPost.id,

                  breed:
                    missingPost.breed,

                  location:
                    missingPost.location,

                  representativeImage:
                    missingPost
                      .representativeImage ??
                    missingPost
                      .images?.[0] ??
                    '',

                  candidates,
                }
              }
            )
          ),

          loadSimilarFootprintNewSummary(),
        ])

      const groupsWithNewState =
        groups
          .filter(
            (group) =>
              group.candidates
                .length > 0
          )
          .map(
            (group) => {
              const newCount =
                getNewCountForMissingPost(
                  newSummary,
                  group.missingPostId
                )

              return {
                ...group,

                newCount,

                hasNew:
                  newCount > 0,
              }
            }
          )

      setSimilarFootprintGroups(
        groupsWithNewState
      )

      setPage(
        'similarFootprints'
      )
    }

  const markSimilarFootprintCandidateCheckedLocally =
    useCallback(
      (
        missingPostId,
        sightedPostId
      ) => {
        let wasNewCandidate =
          false

        /*
         * 후보 카드의 NEW 상태를 즉시 제거한다.
         * 서버 응답을 기다리지 않으므로 한 번 눌렀을 때 바로 반영된다.
         */
        setSimilarFootprintGroups(
          (previousGroups) =>
            previousGroups.map(
              (group) => {
                if (
                  group.missingPostId !==
                  missingPostId
                ) {
                  return group
                }

                const updatedCandidates =
                  group.candidates.map(
                    (candidate) => {
                      if (
                        candidate.postId !==
                        sightedPostId
                      ) {
                        return candidate
                      }

                      if (
                        candidate.newCandidate
                      ) {
                        wasNewCandidate =
                          true
                      }

                      return {
                        ...candidate,
                        newCandidate:
                          false,
                      }
                    }
                  )

                if (!wasNewCandidate) {
                  return {
                    ...group,
                    candidates:
                      updatedCandidates,
                  }
                }

                const nextNewCount =
                  Math.max(
                    0,
                    Number(
                      group.newCount ??
                        0
                    ) - 1
                  )

                return {
                  ...group,
                  candidates:
                    updatedCandidates,
                  newCount:
                    nextNewCount,
                  hasNew:
                    nextNewCount > 0,
                }
              }
            )
        )

        if (!wasNewCandidate) {
          return
        }

        /*
         * 마이페이지 NEW 배지도 같은 순간 즉시 갱신한다.
         */
        setSimilarFootprintNewSummary(
          (previousSummary) => {
            const previousCount =
              getNewCountForMissingPost(
                previousSummary,
                missingPostId
              )

            if (previousCount <= 0) {
              return previousSummary
            }

            const nextCount =
              Math.max(
                0,
                previousCount - 1
              )

            const nextCountMap = {
              ...(
                previousSummary
                  .newCountByMissingPost ??
                {}
              ),
            }

            if (nextCount > 0) {
              nextCountMap[
                String(
                  missingPostId
                )
              ] = nextCount
            } else {
              delete nextCountMap[
                String(
                  missingPostId
                )
              ]

              delete nextCountMap[
                missingPostId
              ]
            }

            const nextTotalNewCount =
              Math.max(
                0,
                Number(
                  previousSummary
                    .totalNewCount ??
                    0
                ) - 1
              )

            return {
              hasNew:
                nextTotalNewCount > 0,
              totalNewCount:
                nextTotalNewCount,
              newCountByMissingPost:
                nextCountMap,
            }
          }
        )
      },
      []
    )

  const handleSimilarFootprintCandidateChecked =
    async (
      missingPostId,
      sightedPostId
    ) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (
        !token ||
        !missingPostId ||
        !sightedPostId
      ) {
        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/ai-match/status/missing/${missingPostId}/candidate/${sightedPostId}/check`,
            {
              method: 'PUT',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '새 후보 확인 처리에 실패했습니다.'
            )
          )
        }
      } catch (error) {
        console.error(
          '닮은 발자국 후보 확인 처리 실패:',
          error
        )

        /*
         * 낙관적 UI 반영 후 서버 저장에 실패한 경우에만
         * 서버 상태를 다시 읽어 실제 NEW 상태로 복구한다.
         */
        const newSummary =
          await loadSimilarFootprintNewSummary()

        applyNewSummaryToGroups(
          newSummary
        )
      }
    }

  const handleSimilarFootprintCandidateSelect =
    (
      missingPostId,
      sightedPostId
    ) => {
      if (!sightedPostId) {
        window.alert(
          '연결된 봤어요 게시글을 찾을 수 없어요.'
        )

        return
      }

      /*
       * 1. NEW를 즉시 없앤다.
       */
      markSimilarFootprintCandidateCheckedLocally(
        missingPostId,
        sightedPostId
      )

      /*
       * 2. 서버 확인 저장은 상세 조회와 동시에 진행한다.
       *    이 요청 때문에 상세 화면 진입을 막지 않는다.
       */
      handleSimilarFootprintCandidateChecked(
        missingPostId,
        sightedPostId
      )

      /*
       * 3. 바로 게시글 상세를 연다.
       */
      openPostDetail(
        sightedPostId,
        'similarFootprints'
      )
    }

  const handleNoticeSelect =
    (noticeId) => {
      if (!noticeId) {
        window.alert(
          '선택한 공지사항을 찾을 수 없어요.'
        )

        return
      }

      setSelectedNoticeId(
        noticeId
      )

      setNoticeDetailBackPage(
        'noticeList'
      )

      setPage(
        'noticeDetail'
      )
    }

  const openPostDetail =
    async (
      postId,
      backPage
    ) => {
      const loadedPost =
        await loadPostDetail(
          postId
        )

      if (!loadedPost) {
        return
      }

      setDetailBackPage(
        backPage
      )

      setPage(
        'postDetail'
      )
    }

  const handlePostSelectFromList =
    (postId) => {
      openPostDetail(
        postId,
        'postList'
      )
    }

  const handlePostSelectFromMyPosts =
    (postId) => {
      openPostDetail(
        postId,
        'myPosts'
      )
    }

  const handleAiMatchPostSelect =
    (postId) => {
      if (!postId) {
        window.alert(
          '연결된 봤어요 게시글을 찾을 수 없어요.'
        )

        return
      }

      openPostDetail(
        postId,
        'postList'
      )
    }

  const handleSimilarFootprintPostSelect =
    (postId) => {
      if (!postId) {
        window.alert(
          '연결된 봤어요 게시글을 찾을 수 없어요.'
        )

        return
      }

      openPostDetail(
        postId,
        'similarFootprints'
      )
    }

  const handleUserProfileSelect =
    (
      username,
      nickname
    ) => {
      if (!username) {
        return
      }

      setSelectedProfile({
        username,

        nickname:
          nickname ||
          '닉네임',
      })

      setProfileBackPage(
        'postDetail'
      )

      setPage(
        'userProfile'
      )
    }

  const handlePostSelectFromUserProfile =
    (postId) => {
      openPostDetail(
        postId,
        'userProfile'
      )
    }

  const handlePostSelectFromNotification =
    (postId) => {
      if (!postId) {
        window.alert(
          '연결된 게시글을 찾을 수 없어요.'
        )

        return
      }

      openPostDetail(
        postId,
        'notifications'
      )
    }

  const handleNoticeSelectFromCommunity =
    (noticeId) => {
      if (!noticeId) {
        window.alert(
          '선택한 공지사항을 찾을 수 없어요.'
        )

        return
      }

      setSelectedNoticeId(
        noticeId
      )

      setNoticeDetailBackPage(
        'community'
      )

      setPage(
        'noticeDetail'
      )
    }

  const handleNoticeSelectFromNotification =
    (noticeId) => {
      if (!noticeId) {
        window.alert(
          '선택한 공지사항을 찾을 수 없어요.'
        )

        return
      }

      setSelectedNoticeId(
        noticeId
      )

      setNoticeDetailBackPage(
        'notifications'
      )

      setPage(
        'noticeDetail'
      )
    }

  const handleInquirySelectFromNotification =
    () => {
      setPage(
        'inquiry'
      )
    }

  const handleNotificationsFromPostList =
    () => {
      setNotificationBackPage(
        'postList'
      )

      setPage(
        'notifications'
      )
    }

  const handleNotificationsFromMyPage =
    () => {
      setNotificationBackPage(
        'myPage'
      )

      setPage(
        'notifications'
      )
    }

  const handleNotificationsFromCommunity =
    () => {
      setNotificationBackPage(
        'community'
      )

      setPage(
        'notifications'
      )
    }

  const handleCommunityPostSelectFromNotification =
    (
      communityPostId
    ) => {
      if (!communityPostId) {
        window.alert(
          '연결된 커뮤니티 게시글을 찾을 수 없어요.'
        )

        return
      }

      setSelectedCommunityPostId(
        communityPostId
      )

      setCommunityDetailBackPage(
        'notifications'
      )

      setPage(
        'communityDetail'
      )
    }

  const handlePostDelete =
    async (postId) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )

        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/posts/${postId}`,
            {
              method:
                'DELETE',
              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '본인이 작성한 게시글만 삭제할 수 있어요.'
          )
        }

        if (
          response.status ===
          404
        ) {
          throw new Error(
            '삭제할 게시글을 찾을 수 없어요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '게시글을 삭제하지 못했습니다.'
            )
          )
        }

        setPosts(
          (
            previousPosts
          ) =>
            previousPosts.filter(
              (post) =>
                post.id !==
                postId
            )
        )

        setMyPosts(
          (
            previousPosts
          ) =>
            previousPosts.filter(
              (post) =>
                post.id !==
                postId
            )
        )

        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.filter(
              (notification) =>
                notification
                  .postId !==
                postId
            )
        )

        if (
          selectedPostId ===
          postId
        ) {
          setSelectedPostId(
            null
          )

          setSelectedPost(
            null
          )
        }

        window.alert(
          '게시글이 삭제됐어요.'
        )
      } catch (error) {
        console.error(
          '게시글 삭제 실패:',
          error
        )

        window.alert(
          error.message ||
            '게시글을 삭제하지 못했어요.'
        )

        await loadMyPosts()
      }
    }

  const handlePostEdit =
    async (postId) => {
      const postToEdit =
        await loadPostDetail(
          postId
        )

      if (!postToEdit) {
        return
      }

      if (
        postToEdit
          .authorUsername !==
        currentUsername
      ) {
        window.alert(
          '본인이 작성한 게시글만 수정할 수 있어요.'
        )

        return
      }

      setPage(
        'postEdit'
      )
    }

  const handlePostUpdate =
    async ({
      data,
      newImages,
    }) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        throw new Error(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )
      }

      if (
        !selectedPostId
      ) {
        throw new Error(
          '수정할 게시글을 찾을 수 없습니다.'
        )
      }

      const multipartData =
        createPostFormData(
          data,
          newImages,
          'newImages'
        )

      const response =
        await fetch(
          `${API_BASE_URL}/api/posts/${selectedPostId}`,
          {
            method: 'PUT',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            body:
              multipartData,
          }
        )

      if (
        response.status ===
          401 ||
        response.status ===
          403
      ) {
        throw new Error(
          '본인이 작성한 게시글만 수정할 수 있어요.'
        )
      }

      if (
        response.status ===
        404
      ) {
        throw new Error(
          '수정할 게시글을 찾을 수 없어요.'
        )
      }

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            '게시글을 수정하지 못했습니다.'
          )
        )
      }

      const updatedPost =
        await response.json()

      setSelectedPost({
        ...updatedPost,

        comments:
          selectedPost
            ?.comments ??
          [],
      })

      setSelectedPostId(
        updatedPost.id
      )

      await Promise.all([
        loadPosts(),
        loadMyPosts(),
      ])

      setPage(
        'myPosts'
      )

      window.alert(
        '게시글이 수정됐어요.'
      )
    }

  const handleCommentAdd =
    async (
      postId,
      commentText
    ) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
        )

        return
      }

      if (
        !selectedPost ||
        selectedPost.id !==
          postId
      ) {
        window.alert(
          '댓글을 작성할 게시글을 찾을 수 없어요.'
        )

        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/posts/${postId}/comments`,
            {
              method: 'POST',

              headers: {
                Authorization:
                  `Bearer ${token}`,

                'Content-Type':
                  'application/json',
              },

              body:
                JSON.stringify({
                  content:
                    commentText,
                }),
            }
          )

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '댓글을 등록하지 못했습니다.'
            )
          )
        }

        const newComment =
          normalizeComment(
            await response.json()
          )

        if (
          newComment
            .authorUsername &&
          newComment
            .authorProfileImageUrl
        ) {
          setProfileImages(
            (
              previousProfileImages
            ) => ({
              ...previousProfileImages,

              [newComment
                .authorUsername]:
                newComment
                  .authorProfileImageUrl,
            })
          )
        }

        setSelectedPost(
          (
            previousPost
          ) => ({
            ...previousPost,

            comments: [
              ...(
                previousPost
                  .comments ??
                []
              ),

              newComment,
            ],
          })
        )
      } catch (error) {
        console.error(
          '댓글 등록 실패:',
          error
        )

        window.alert(
          error.message ||
            '댓글을 등록하지 못했어요.'
        )
      }
    }

  const handleCommentDelete =
    async (
      postId,
      commentId
    ) => {
      if (
        !selectedPost ||
        selectedPost.id !==
          postId
      ) {
        window.alert(
          '게시글을 찾을 수 없어요.'
        )

        return
      }

      const targetComment =
        (
          selectedPost.comments ??
          []
        ).find(
          (savedComment) =>
            savedComment.id ===
            commentId
        )

      if (
        !targetComment
      ) {
        window.alert(
          '삭제할 댓글을 찾을 수 없어요.'
        )

        return
      }

      if (
        !targetComment.deletable
      ) {
        window.alert(
          '본인이 작성한 댓글만 삭제할 수 있어요.'
        )

        return
      }

      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )

        return
      }

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/comments/${commentId}`,
            {
              method:
                'DELETE',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (
          response.status ===
            401 ||
          response.status ===
            403
        ) {
          throw new Error(
            '본인이 작성한 댓글만 삭제할 수 있어요.'
          )
        }

        if (
          response.status ===
          404
        ) {
          throw new Error(
            '삭제할 댓글을 찾을 수 없어요.'
          )
        }

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(
              response,
              '댓글을 삭제하지 못했습니다.'
            )
          )
        }

        setSelectedPost(
          (
            previousPost
          ) => ({
            ...previousPost,

            comments: (
              previousPost
                .comments ??
              []
            ).filter(
              (savedComment) =>
                savedComment.id !==
                commentId
            ),
          })
        )
      } catch (error) {
        console.error(
          '댓글 삭제 실패:',
          error
        )

        window.alert(
          error.message ||
            '댓글을 삭제하지 못했어요.'
        )
      }
    }

  const handleNotificationRead =
    async (
      notificationId
    ) => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        return
      }

      setNotifications(
        (
          previousNotifications
        ) =>
          previousNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead:
                      true,
                  }
                : notification
          )
      )

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/${notificationId}/read`,
            {
              method: 'PUT',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '알림 읽음 처리에 실패했습니다.'
          )
        }

        const updatedNotification =
          await response.json()

        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.map(
              (notification) =>
                notification.id ===
                notificationId
                  ? updatedNotification
                  : notification
            )
        )
      } catch (error) {
        console.error(
          '알림 읽음 처리에 실패했습니다.',
          error
        )

        loadNotifications()
      }
    }

  const handleAllNotificationsRead =
    async () => {
      const token =
        localStorage.getItem(
          'token'
        )

      if (!token) {
        return
      }

      setNotifications(
        (
          previousNotifications
        ) =>
          previousNotifications.map(
            (notification) => ({
              ...notification,
              isRead:
                true,
            })
          )
      )

      try {
        const response =
          await fetch(
            `${API_BASE_URL}/api/notifications/read-all`,
            {
              method: 'PUT',

              headers: {
                Authorization:
                  `Bearer ${token}`,
              },
            }
          )

        if (!response.ok) {
          throw new Error(
            '알림 전체 읽음 처리에 실패했습니다.'
          )
        }
      } catch (error) {
        console.error(
          '알림 전체 읽음 처리에 실패했습니다.',
          error
        )

        loadNotifications()
      }
    }

  const handleLogout =
    () => {
      const shouldLogout =
        window.confirm(
          '로그아웃할까요?'
        )

      if (!shouldLogout) {
        return
      }

      localStorage.removeItem(
        'token'
      )

      localStorage.removeItem(
        CURRENT_NICKNAME_KEY
      )

      localStorage.removeItem(
        CURRENT_USERNAME_KEY
      )

      setCurrentNickname('')
      setCurrentUsername('')

      setPosts([])
      setMyPosts([])
      setMyCommunityPosts([])
      setNotifications([])

      setSelectedPostId(null)
      setSelectedPost(null)
      setSelectedNoticeId(null)
      setSelectedCommunityPostId(null)
      setEditingCommunityPost(null)
      setSelectedProfile(null)
      setSelectedAdminReportId(null)
      setSelectedAdminNoticeId(null)
      setSelectedAdminInquiry(null)

      setSimilarFootprintGroups(
        []
      )

      setSimilarFootprintNewSummary({
        ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
      })

      setIsAdmin(false)

      setPage(
        'login'
      )
    }

  const handleWithdrawSuccess =
    () => {
      const withdrawnUsername =
        currentUsername

      setPosts([])
      setMyPosts([])
      setMyCommunityPosts([])
      setSelectedPost(null)
      setNotifications([])
      setIsAdmin(false)
      setSelectedAdminReportId(
        null
      )

      setSelectedAdminNoticeId(
        null
      )

      setSelectedAdminInquiry(
        null
      )

      setSimilarFootprintGroups(
        []
      )

      setSimilarFootprintNewSummary({
        ...EMPTY_SIMILAR_FOOTPRINT_NEW_SUMMARY,
      })

      localStorage.removeItem(
        `footprint-inquiries-${withdrawnUsername}`
      )

      setProfileImages(
        (
          previousProfileImages
        ) => {
          const updatedProfileImages =
            {
              ...previousProfileImages,
            }

          delete updatedProfileImages[
            withdrawnUsername
          ]

          try {
            localStorage.setItem(
              PROFILE_IMAGES_KEY,
              JSON.stringify(
                updatedProfileImages
              )
            )
          } catch (error) {
            console.error(
              '프로필 사진 정리에 실패했습니다.',
              error
            )
          }

          return updatedProfileImages
        }
      )

      localStorage.removeItem(
        'footprint-profile-image'
      )

      localStorage.removeItem(
        'token'
      )

      localStorage.removeItem(
        CURRENT_NICKNAME_KEY
      )

      localStorage.removeItem(
        CURRENT_USERNAME_KEY
      )

      try {
        const nicknameMap =
          JSON.parse(
            localStorage.getItem(
              'footprint-user-nicknames'
            ) ?? '{}'
          )

        delete nicknameMap[
          withdrawnUsername
        ]

        localStorage.setItem(
          'footprint-user-nicknames',
          JSON.stringify(
            nicknameMap
          )
        )
      } catch (error) {
        console.error(
          '닉네임 임시 정보 정리에 실패했습니다.',
          error
        )
      }

      setSelectedPostId(
        null
      )

      setSelectedNoticeId(
        null
      )

      setCurrentNickname(
        ''
      )

      setCurrentUsername(
        ''
      )

      setPage(
        'login'
      )

      window.alert(
        '회원 탈퇴가 완료되었습니다.'
      )
    }

  if (
    page === 'start'
  ) {
    return (
      <Start
        onFinish={() =>
          setPage('login')
        }
      />
    )
  }

  if (
    page === 'login'
  ) {
    return (
      <Login
        onSignup={() =>
          setPage('signup')
        }
        onLoginSuccess={
          handleLoginSuccess
        }
      />
    )
  }

  if (
    page === 'signup'
  ) {
    return (
      <Signup
        onBack={() =>
          setPage('login')
        }
      />
    )
  }

  if (
    page === 'loading'
  ) {
    return (
      <LoadingScreen />
    )
  }

  if (
    page === 'postList'
  ) {
    return (
      <PostList
        posts={posts}

        onWrite={() =>
          setPage(
            'postWrite'
          )
        }

        onPostSelect={
          handlePostSelectFromList
        }

        onMyPage={() =>
          setPage(
            'myPage'
          )
        }

        onCommunity={() =>
          setPage(
            'community'
          )
        }

        onNotifications={
          handleNotificationsFromPostList
        }

        hasUnreadNotification={
          hasUnreadNotification
        }
      />
    )
  }

  if (
    page === 'community'
  ) {
    return (
      <Community
        onBack={() =>
          setPage(
            'postList'
          )
        }

        onWrite={() => {
          setEditingCommunityPost(
            null
          )

          setPage(
            'communityWrite'
          )
        }}

        onPostSelect={(
          communityPostId
        ) => {
          setSelectedCommunityPostId(
            communityPostId
          )

          setCommunityDetailBackPage(
            'community'
          )

          setPage(
            'communityDetail'
          )
        }}

        onNotifications={
          handleNotificationsFromCommunity
        }

        onNoticeSelect={
          handleNoticeSelectFromCommunity
        }

        onMyPage={() =>
          setPage(
            'myPage'
          )
        }

        hasUnreadNotification={
          hasUnreadNotification
        }
      />
    )
  }

  if (
    page === 'communityDetail' &&
    selectedCommunityPostId
  ) {
    return (
      <CommunityDetail
        postId={
          selectedCommunityPostId
        }

        profileImages={
          profileImages
        }

        onBack={() =>
          setPage(
            communityDetailBackPage
          )
        }

        onEdit={(
          communityPost
        ) => {
          setEditingCommunityPost(
            communityPost
          )

          setPage(
            'communityEdit'
          )
        }}
      />
    )
  }

  if (
    page === 'communityWrite'
  ) {
    return (
      <CommunityWrite
        onBack={() => {
          setEditingCommunityPost(
            null
          )

          setPage(
            'community'
          )
        }}

        onComplete={(
          savedPost
        ) => {
          setEditingCommunityPost(
            null
          )

          if (savedPost?.id) {
            setSelectedCommunityPostId(
              savedPost.id
            )
          }

          setPage(
            'community'
          )
        }}
      />
    )
  }

  if (
    page === 'communityEdit' &&
    editingCommunityPost
  ) {
    return (
      <CommunityWrite
        key={
          editingCommunityPost.id
        }

        editingPost={
          editingCommunityPost
        }

        onBack={() => {
          setEditingCommunityPost(
            null
          )

          setPage(
            'communityDetail'
          )
        }}

        onComplete={(
          updatedPost
        ) => {
          if (updatedPost?.id) {
            setSelectedCommunityPostId(
              updatedPost.id
            )
          }

          setEditingCommunityPost(
            null
          )

          setPage(
            'communityDetail'
          )
        }}
      />
    )
  }

  if (
    page === 'postWrite'
  ) {
    return (
      <PostWrite
        onBack={() =>
          setPage(
            'postList'
          )
        }

        onComplete={
          handlePostComplete
        }
      />
    )
  }

  if (
    page === 'postEdit' &&
    selectedPost
  ) {
    return (
      <PostWrite
        key={
          selectedPost.id
        }

        editingPost={
          selectedPost
        }

        onBack={() =>
          setPage(
            'myPosts'
          )
        }

        onComplete={
          handlePostUpdate
        }
      />
    )
  }

  if (
    page ===
      'postDetail' &&
    selectedPost
  ) {
    return (
      <PostDetail
        post={
          selectedPost
        }

        currentUsername={
          currentUsername
        }

        profileImages={
          profileImages
        }

        onBack={() =>
          setPage(
            detailBackPage
          )
        }

        onCommentAdd={
          handleCommentAdd
        }

        onCommentDelete={
          handleCommentDelete
        }

        onUserProfileSelect={
          handleUserProfileSelect
        }

        onAiMatch={
          handleAiMatch
        }

        onAiMatchPostSelect={
          handleAiMatchPostSelect
        }
      />
    )
  }

  if (
    page ===
    'similarFootprints'
  ) {
    return (
      <SimilarFootprints
        groups={
          similarFootprintGroups
        }

        onBack={() =>
          setPage(
            'myPage'
          )
        }

        /*
         * 후보 클릭 시
         * missingPostId + sightedPostId를 함께 넘겨
         * NEW 즉시 제거 + 서버 확인 처리를 수행한다.
         */
        onCandidateSelect={
          handleSimilarFootprintCandidateSelect
        }

        /* 기존 코드와의 호환용 */
        onPostSelect={
          handleSimilarFootprintPostSelect
        }
      />
    )
  }

  if (
    page ===
      'userProfile' &&
    selectedProfile
  ) {
    return (
      <UserProfile
        username={
          selectedProfile
            .username
        }

        nickname={
          selectedProfile
            .nickname
        }

        profileImage={
          profileImages[
            selectedProfile
              .username
          ] ?? ''
        }

        posts={
          posts
        }

        onBack={() =>
          setPage(
            profileBackPage
          )
        }

        onPostSelect={
          handlePostSelectFromUserProfile
        }
      />
    )
  }

  if (
    page === 'myPage'
  ) {
    return (
      <MyPage
        nickname={
          currentNickname
        }

        username={
          currentUsername
        }

        onBack={() =>
          setPage(
            'postList'
          )
        }

        onMyPosts={() =>
          setPage(
            'myPosts'
          )
        }

        onSimilarFootprints={
          handleSimilarFootprintsOpen
        }

        /*
         * 새 후보가 하나라도 있으면
         * MyPage에서 NEW 표시.
         */
        hasNewSimilarFootprints={
          similarFootprintNewSummary
            .hasNew
        }

        similarFootprintNewCount={
          similarFootprintNewSummary
            .totalNewCount
        }

        onNotices={() => {
          setNoticeListBackPage(
            'myPage'
          )

          setPage(
            'noticeList'
          )
        }}

        onNotifications={
          handleNotificationsFromMyPage
        }

        hasUnreadNotification={
          hasUnreadNotification
        }

        onInquiry={() =>
          setPage(
            'inquiry'
          )
        }

        onLogout={
          handleLogout
        }

        isAdmin={
          isAdmin
        }

        onAdmin={() =>
          setPage(
            'admin'
          )
        }

        onWithdraw={() =>
          setPage(
            'withdraw'
          )
        }

        onProfileImageChange={
          handleProfileImageChange
        }
      />
    )
  }

  if (
    page === 'admin'
  ) {
    if (!isAdmin) {
      return (
        <MyPage
          nickname={
            currentNickname
          }

          username={
            currentUsername
          }

          onBack={() =>
            setPage(
              'postList'
            )
          }

          onMyPosts={() =>
            setPage(
              'myPosts'
            )
          }

          onSimilarFootprints={
            handleSimilarFootprintsOpen
          }

          hasNewSimilarFootprints={
            similarFootprintNewSummary
              .hasNew
          }

          similarFootprintNewCount={
            similarFootprintNewSummary
              .totalNewCount
          }

          onNotices={() =>
            setPage(
              'noticeList'
            )
          }

          onNotifications={
            handleNotificationsFromMyPage
          }

          hasUnreadNotification={
            hasUnreadNotification
          }

          onInquiry={() =>
            setPage(
              'inquiry'
            )
          }

          onLogout={
            handleLogout
          }

          isAdmin={
            false
          }

          onWithdraw={() =>
            setPage(
              'withdraw'
            )
          }

          onProfileImageChange={
            handleProfileImageChange
          }
        />
      )
    }

    return (
      <AdminPage
        onBack={() =>
          setPage(
            'myPage'
          )
        }

        onReports={() =>
          setPage(
            'adminReports'
          )
        }

        onInquiries={() => {
          setSelectedAdminInquiry(
            null
          )

          setPage(
            'adminInquiries'
          )
        }}

        onNotices={() => {
          setSelectedAdminNoticeId(
            null
          )

          setPage(
            'adminNotices'
          )
        }}
      />
    )
  }

  if (
    page === 'adminReports' &&
    isAdmin
  ) {
    return (
      <AdminReports
        onBack={() =>
          setPage(
            'admin'
          )
        }

        onReportSelect={(
          reportId
        ) => {
          setSelectedAdminReportId(
            reportId
          )

          setPage(
            'adminReportDetail'
          )
        }}
      />
    )
  }

  if (
    page === 'adminReportDetail' &&
    isAdmin &&
    selectedAdminReportId
  ) {
    return (
      <AdminReportDetail
        reportId={
          selectedAdminReportId
        }

        onBack={() =>
          setPage(
            'adminReports'
          )
        }

        onPostSelect={(
          communityPostId
        ) => {
          if (!communityPostId) {
            return
          }

          setSelectedCommunityPostId(
            communityPostId
          )

          setCommunityDetailBackPage(
            'adminReportDetail'
          )

          setPage(
            'communityDetail'
          )
        }}
      />
    )
  }

  if (
    page === 'adminInquiries' &&
    isAdmin
  ) {
    return (
      <AdminInquiries
        onBack={() =>
          setPage(
            'admin'
          )
        }

        onConversationSelect={(
          conversation
        ) => {
          setSelectedAdminInquiry(
            conversation
          )

          setPage(
            'adminInquiryDetail'
          )
        }}
      />
    )
  }

  if (
    page === 'adminInquiryDetail' &&
    isAdmin &&
    selectedAdminInquiry
  ) {
    return (
      <AdminInquiryDetail
        conversation={
          selectedAdminInquiry
        }

        onBack={() =>
          setPage(
            'adminInquiries'
          )
        }
      />
    )
  }

  if (
    page === 'adminNotices' &&
    isAdmin
  ) {
    return (
      <AdminNotices
        onBack={() =>
          setPage(
            'admin'
          )
        }

        onCreate={() => {
          setSelectedAdminNoticeId(
            null
          )

          setPage(
            'adminNoticeWrite'
          )
        }}

        onNoticeSelect={(
          noticeId
        ) => {
          setSelectedAdminNoticeId(
            noticeId
          )

          setPage(
            'adminNoticeDetail'
          )
        }}
      />
    )
  }

  if (
    page === 'adminNoticeDetail' &&
    isAdmin &&
    selectedAdminNoticeId
  ) {
    return (
      <AdminNoticeDetail
        noticeId={
          selectedAdminNoticeId
        }

        onBack={() =>
          setPage(
            'adminNotices'
          )
        }

        onEdit={(
          noticeId
        ) => {
          setSelectedAdminNoticeId(
            noticeId
          )

          setPage(
            'adminNoticeWrite'
          )
        }}

        onDeleted={() => {
          setSelectedAdminNoticeId(
            null
          )

          setPage(
            'adminNotices'
          )
        }}
      />
    )
  }

  if (
    page === 'adminNoticeWrite' &&
    isAdmin
  ) {
    return (
      <AdminNoticeWrite
        noticeId={
          selectedAdminNoticeId
        }

        onBack={() =>
          setPage(
            selectedAdminNoticeId
              ? 'adminNoticeDetail'
              : 'adminNotices'
          )
        }

        onComplete={(
          savedNotice
        ) => {
          if (
            savedNotice?.id
          ) {
            setSelectedAdminNoticeId(
              savedNotice.id
            )

            setPage(
              'adminNoticeDetail'
            )

            return
          }

          setSelectedAdminNoticeId(
            null
          )

          setPage(
            'adminNotices'
          )
        }}
      />
    )
  }

  if (
    page === 'inquiry'
  ) {
    return (
      <Inquiry
        username={
          currentUsername
        }

        onBack={() =>
          setPage(
            'myPage'
          )
        }
      />
    )
  }

  if (
    page === 'withdraw'
  ) {
    return (
      <Withdraw
        onBack={() =>
          setPage(
            'myPage'
          )
        }

        onWithdrawSuccess={
          handleWithdrawSuccess
        }
      />
    )
  }

  if (
    page === 'myPosts'
  ) {
    return (
      <MyPosts
        posts={
          myPosts
        }

        communityPosts={
          myCommunityPosts
        }

        currentUsername={
          currentUsername
        }

        onBack={() =>
          setPage(
            'myPage'
          )
        }

        onPostSelect={
          handlePostSelectFromMyPosts
        }

        onPostDelete={
          handlePostDelete
        }

        onPostEdit={
          handlePostEdit
        }

        onCommunityPostSelect={(
          communityPostId
        ) => {
          setSelectedCommunityPostId(
            communityPostId
          )

          setCommunityDetailBackPage(
            'myPosts'
          )

          setPage(
            'communityDetail'
          )
        }}
      />
    )
  }

  if (
    page ===
    'noticeList'
  ) {
    return (
      <NoticeList
        onBack={() =>
          setPage(
            noticeListBackPage
          )
        }

        onNoticeSelect={
          handleNoticeSelect
        }
      />
    )
  }

  if (
    page ===
      'noticeDetail' &&
    selectedNoticeId
  ) {
    return (
      <NoticeDetail
        noticeId={
          selectedNoticeId
        }

        onBack={() =>
          setPage(
            noticeDetailBackPage
          )
        }
      />
    )
  }

  if (
    page ===
    'notifications'
  ) {
    return (
      <Notifications
        notifications={
          currentUserNotifications
        }

        onBack={() =>
          setPage(
            notificationBackPage
          )
        }

        onPostSelect={
          handlePostSelectFromNotification
        }

        onCommunityPostSelect={
          handleCommunityPostSelectFromNotification
        }

        onNoticeSelect={
          handleNoticeSelectFromNotification
        }

        onInquirySelect={
          handleInquirySelectFromNotification
        }

        onNotificationRead={
          handleNotificationRead
        }

        onAllNotificationsRead={
          handleAllNotificationsRead
        }
      />
    )
  }

  return null
}

export default App