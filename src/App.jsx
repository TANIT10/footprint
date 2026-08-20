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

const CURRENT_NICKNAME_KEY =
  'footprint-current-nickname'

const CURRENT_USERNAME_KEY =
  'footprint-current-username'

const PROFILE_IMAGES_KEY =
  'footprint-profile-images'

const API_BASE_URL =
  'http://localhost:8080'

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
      [JSON.stringify(requestData)],
      {
        type: 'application/json',
      }
    )
  )

  imageFiles.forEach((imageFile) => {
    multipartData.append(
      imagePartName,
      imageFile
    )
  })

  return multipartData
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
    detailBackPage,
    setDetailBackPage,
  ] = useState('postList')

  const [
    noticeDetailBackPage,
    setNoticeDetailBackPage,
  ] = useState('noticeList')

  const [
    notificationBackPage,
    setNotificationBackPage,
  ] = useState('postList')

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
  ] = useState('postDetail')

  const [posts, setPosts] =
    useState([])

  const [myPosts, setMyPosts] =
    useState([])

  const [
    notifications,
    setNotifications,
  ] = useState([])

  const loadPosts =
    useCallback(async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setPosts([])
        return
      }

      try {
        const response = await fetch(
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
          response.status === 401 ||
          response.status === 403
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

        setPosts(
          Array.isArray(postPage.posts)
            ? postPage.posts
            : []
        )
      } catch (error) {
        console.error(
          '게시글 목록 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '게시글 목록을 불러오지 못했어요.'
        )
      }
    }, [])

  const loadMyPosts =
    useCallback(async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setMyPosts([])
        return
      }

      try {
        const response = await fetch(
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
          response.status === 401 ||
          response.status === 403
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

        setMyPosts(
          Array.isArray(postPage.posts)
            ? postPage.posts
            : []
        )
      } catch (error) {
        console.error(
          '내 게시글 조회 실패:',
          error
        )

        window.alert(
          error.message ||
            '내 게시글을 불러오지 못했어요.'
        )
      }
    }, [])

  const loadPostDetail =
    useCallback(async (postId) => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )
        return null
      }

      try {
        const response = await fetch(
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
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (response.status === 404) {
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
          commentsResponse.status === 401 ||
          commentsResponse.status === 403
        ) {
          throw new Error(
            '로그인 시간이 만료됐습니다. 다시 로그인해 주세요.'
          )
        }

        if (!commentsResponse.ok) {
          throw new Error(
            await readErrorMessage(
              commentsResponse,
              '댓글을 불러오지 못했습니다.'
            )
          )
        }

        const commentResponses =
          await commentsResponse.json()

        const comments = Array.isArray(
          commentResponses
        )
          ? commentResponses.map(
              normalizeComment
            )
          : []

        setProfileImages(
          (previousProfileImages) => {
            const updatedProfileImages = {
              ...previousProfileImages,
            }

            comments.forEach(
              (savedComment) => {
                if (
                  savedComment.authorUsername &&
                  savedComment.authorProfileImageUrl
                ) {
                  updatedProfileImages[
                    savedComment.authorUsername
                  ] =
                    savedComment.authorProfileImageUrl
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
    }, [])

  useEffect(() => {
    if (
      page === 'postList' ||
      page === 'userProfile'
    ) {
      loadPosts()
    }
  }, [
    page,
    loadPosts,
  ])

  useEffect(() => {
    if (page === 'myPosts') {
      loadMyPosts()
    }
  }, [
    page,
    loadMyPosts,
  ])

  const loadNotifications =
    useCallback(async () => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        setNotifications([])
        return
      }

      try {
        const response = await fetch(
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
          response.status === 401 ||
          response.status === 403
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
            notificationPage.notifications
          )
            ? notificationPage.notifications
            : []
        )
      } catch (error) {
        console.error(
          '알림을 불러오지 못했습니다.',
          error
        )
      }
    }, [])

  useEffect(() => {
    if (!currentUsername) {
      setNotifications([])
      return
    }

    if (
      page === 'postList' ||
      page === 'myPage' ||
      page === 'notifications'
    ) {
      loadNotifications()
    }
  }, [
    currentUsername,
    page,
    loadNotifications,
  ])

  const currentUserNotifications = [
    ...notifications,
  ].sort(
    (
      firstNotification,
      secondNotification
    ) =>
      new Date(
        secondNotification.createdAt
      ).getTime() -
      new Date(
        firstNotification.createdAt
      ).getTime()
  )

  const hasUnreadNotification =
    currentUserNotifications.some(
      (notification) =>
        !notification.isRead
    )

  const handleProfileImageChange =
    useCallback(
      (username, profileImage) => {
        if (!username) {
          return
        }

        setProfileImages(
          (previousProfileImages) => {
            const updatedProfileImages = {
              ...previousProfileImages,
              [username]: profileImage,
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

  const handleLoginSuccess = ({
    nickname,
    username,
  }) => {
    setCurrentNickname(nickname)
    setCurrentUsername(username)

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

    setPage('postList')
  }

  const handlePostComplete =
    async ({
      data,
      newImages,
    }) => {
      const token =
        localStorage.getItem('token')

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

      const response = await fetch(
        `${API_BASE_URL}/api/posts`,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: multipartData,
        }
      )

      if (
        response.status === 401 ||
        response.status === 403
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

      setPage('postList')

      window.alert(
        '게시글이 등록됐어요.'
      )
    }

  const handleNoticeSelect = (
    noticeId
  ) => {
    if (!noticeId) {
      window.alert(
        '선택한 공지사항을 찾을 수 없어요.'
      )
      return
    }

    setSelectedNoticeId(noticeId)
    setNoticeDetailBackPage(
      'noticeList'
    )
    setPage('noticeDetail')
  }

  const openPostDetail =
    async (
      postId,
      backPage
    ) => {
      const loadedPost =
        await loadPostDetail(postId)

      if (!loadedPost) {
        return
      }

      setDetailBackPage(backPage)
      setPage('postDetail')
    }

  const handlePostSelectFromList = (
    postId
  ) => {
    openPostDetail(
      postId,
      'postList'
    )
  }

  const handlePostSelectFromMyPosts = (
    postId
  ) => {
    openPostDetail(
      postId,
      'myPosts'
    )
  }

  const handleUserProfileSelect = (
    username,
    nickname
  ) => {
    if (!username) {
      return
    }

    setSelectedProfile({
      username,
      nickname:
        nickname || '닉네임',
    })

    setProfileBackPage('postDetail')
    setPage('userProfile')
  }

  const handlePostSelectFromUserProfile = (
    postId
  ) => {
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

  const handleNoticeSelectFromNotification =
    (noticeId) => {
      if (!noticeId) {
        window.alert(
          '선택한 공지사항을 찾을 수 없어요.'
        )
        return
      }

      setSelectedNoticeId(noticeId)
      setNoticeDetailBackPage(
        'notifications'
      )
      setPage('noticeDetail')
    }

  const handleNotificationsFromPostList =
    () => {
      setNotificationBackPage(
        'postList'
      )
      setPage('notifications')
    }

  const handleNotificationsFromMyPage =
    () => {
      setNotificationBackPage(
        'myPage'
      )
      setPage('notifications')
    }

  const handlePostDelete =
    async (postId) => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        window.alert(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )
        return
      }

      try {
        const response = await fetch(
          `${API_BASE_URL}/api/posts/${postId}`,
          {
            method: 'DELETE',
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        )

        if (
          response.status === 401 ||
          response.status === 403
        ) {
          throw new Error(
            '본인이 작성한 게시글만 삭제할 수 있어요.'
          )
        }

        if (response.status === 404) {
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
          (previousPosts) =>
            previousPosts.filter(
              (post) =>
                post.id !== postId
            )
        )

        setMyPosts(
          (previousPosts) =>
            previousPosts.filter(
              (post) =>
                post.id !== postId
            )
        )

        setNotifications(
          (
            previousNotifications
          ) =>
            previousNotifications.filter(
              (notification) =>
                notification.postId !==
                postId
            )
        )

        if (
          selectedPostId === postId
        ) {
          setSelectedPostId(null)
          setSelectedPost(null)
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
        await loadPostDetail(postId)

      if (!postToEdit) {
        return
      }

      if (
        postToEdit.authorUsername !==
        currentUsername
      ) {
        window.alert(
          '본인이 작성한 게시글만 수정할 수 있어요.'
        )
        return
      }

      setPage('postEdit')
    }

  const handlePostUpdate =
    async ({
      data,
      newImages,
    }) => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        throw new Error(
          '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
        )
      }

      if (!selectedPostId) {
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

      const response = await fetch(
        `${API_BASE_URL}/api/posts/${selectedPostId}`,
        {
          method: 'PUT',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
          body: multipartData,
        }
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          '본인이 작성한 게시글만 수정할 수 있어요.'
        )
      }

      if (response.status === 404) {
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
          selectedPost?.comments ?? [],
      })

      setSelectedPostId(
        updatedPost.id
      )

      await Promise.all([
        loadPosts(),
        loadMyPosts(),
      ])

      setPage('myPosts')

      window.alert(
        '게시글이 수정됐어요.'
      )
    }

  const handleCommentAdd = async (
    postId,
    commentText
  ) => {
    const token =
      localStorage.getItem('token')

    if (!token) {
      window.alert(
        '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
      )
      return
    }

    if (
      !selectedPost ||
      selectedPost.id !== postId
    ) {
      window.alert(
        '댓글을 작성할 게시글을 찾을 수 없어요.'
      )
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/posts/${postId}/comments`,
        {
          method: 'POST',
          headers: {
            Authorization:
              `Bearer ${token}`,
            'Content-Type':
              'application/json',
          },
          body: JSON.stringify({
            content: commentText,
          }),
        }
      )

      if (
        response.status === 401 ||
        response.status === 403
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
        newComment.authorUsername &&
        newComment.authorProfileImageUrl
      ) {
        setProfileImages(
          (previousProfileImages) => ({
            ...previousProfileImages,
            [newComment.authorUsername]:
              newComment.authorProfileImageUrl,
          })
        )
      }

      setSelectedPost(
        (previousPost) => ({
          ...previousPost,
          comments: [
            ...(previousPost.comments ??
              []),
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

  const handleCommentDelete = async (
    postId,
    commentId
  ) => {
    if (
      !selectedPost ||
      selectedPost.id !== postId
    ) {
      window.alert(
        '게시글을 찾을 수 없어요.'
      )
      return
    }

    const targetComment = (
      selectedPost.comments ?? []
    ).find(
      (savedComment) =>
        savedComment.id ===
        commentId
    )

    if (!targetComment) {
      window.alert(
        '삭제할 댓글을 찾을 수 없어요.'
      )
      return
    }

    if (!targetComment.deletable) {
      window.alert(
        '본인이 작성한 댓글만 삭제할 수 있어요.'
      )
      return
    }

    const token =
      localStorage.getItem('token')

    if (!token) {
      window.alert(
        '로그인 정보를 찾을 수 없습니다. 다시 로그인해 주세요.'
      )
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/comments/${commentId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      )

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          '본인이 작성한 댓글만 삭제할 수 있어요.'
        )
      }

      if (response.status === 404) {
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
        (previousPost) => ({
          ...previousPost,
          comments: (
            previousPost.comments ?? []
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
    async (notificationId) => {
      const token =
        localStorage.getItem('token')

      if (!token) {
        return
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) =>
              notification.id ===
              notificationId
                ? {
                    ...notification,
                    isRead: true,
                  }
                : notification
          )
      )

      try {
        const response = await fetch(
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
          (previousNotifications) =>
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
        localStorage.getItem('token')

      if (!token) {
        return
      }

      setNotifications(
        (previousNotifications) =>
          previousNotifications.map(
            (notification) => ({
              ...notification,
              isRead: true,
            })
          )
      )

      try {
        const response = await fetch(
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

  const handleWithdrawSuccess = () => {
    const withdrawnUsername =
      currentUsername

    setPosts([])
    setMyPosts([])
    setSelectedPost(null)
    setNotifications([])

    localStorage.removeItem(
      `footprint-inquiries-${withdrawnUsername}`
    )

    setProfileImages(
      (
        previousProfileImages
      ) => {
        const updatedProfileImages = {
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

    localStorage.removeItem('token')

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

    setSelectedPostId(null)
    setSelectedNoticeId(null)
    setCurrentNickname('')
    setCurrentUsername('')
    setPage('login')

    window.alert(
      '회원 탈퇴가 완료되었습니다.'
    )
  }

  if (page === 'start') {
    return (
      <Start
        onFinish={() =>
          setPage('login')
        }
      />
    )
  }

  if (page === 'login') {
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

  if (page === 'signup') {
    return (
      <Signup
        onBack={() =>
          setPage('login')
        }
      />
    )
  }

  if (page === 'postList') {
    return (
      <PostList
        posts={posts}
        onWrite={() =>
          setPage('postWrite')
        }
        onPostSelect={
          handlePostSelectFromList
        }
        onMyPage={() =>
          setPage('myPage')
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

  if (page === 'postWrite') {
    return (
      <PostWrite
        onBack={() =>
          setPage('postList')
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
        key={selectedPost.id}
        editingPost={
          selectedPost
        }
        onBack={() =>
          setPage('myPosts')
        }
        onComplete={
          handlePostUpdate
        }
      />
    )
  }

  if (
    page === 'postDetail' &&
    selectedPost
  ) {
    return (
      <PostDetail
        post={selectedPost}
        currentUsername={
          currentUsername
        }
        profileImages={
          profileImages
        }
        onBack={() =>
          setPage(detailBackPage)
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
      />
    )
  }

  if (
    page === 'userProfile' &&
    selectedProfile
  ) {
    return (
      <UserProfile
        username={
          selectedProfile.username
        }
        nickname={
          selectedProfile.nickname
        }
        profileImage={
          profileImages[
            selectedProfile.username
          ] ?? ''
        }
        posts={posts}
        onBack={() =>
          setPage(profileBackPage)
        }
        onPostSelect={
          handlePostSelectFromUserProfile
        }
      />
    )
  }

  if (page === 'myPage') {
    return (
      <MyPage
        nickname={
          currentNickname
        }
        username={
          currentUsername
        }
        onBack={() =>
          setPage('postList')
        }
        onMyPosts={() =>
          setPage('myPosts')
        }
        onNotices={() =>
          setPage('noticeList')
        }
        onNotifications={
          handleNotificationsFromMyPage
        }
        hasUnreadNotification={
          hasUnreadNotification
        }
        onInquiry={() =>
          setPage('inquiry')
        }
        onWithdraw={() =>
          setPage('withdraw')
        }
        onProfileImageChange={
          handleProfileImageChange
        }
      />
    )
  }

  if (page === 'inquiry') {
    return (
      <Inquiry
        username={
          currentUsername
        }
        onBack={() =>
          setPage('myPage')
        }
      />
    )
  }

  if (page === 'withdraw') {
    return (
      <Withdraw
        onBack={() =>
          setPage('myPage')
        }
        onWithdrawSuccess={
          handleWithdrawSuccess
        }
      />
    )
  }

  if (page === 'myPosts') {
    return (
      <MyPosts
        posts={myPosts}
        currentUsername={
          currentUsername
        }
        onBack={() =>
          setPage('myPage')
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
      />
    )
  }

  if (page === 'noticeList') {
    return (
      <NoticeList
        onBack={() =>
          setPage('myPage')
        }
        onNoticeSelect={
          handleNoticeSelect
        }
      />
    )
  }

  if (
    page === 'noticeDetail' &&
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

  if (page === 'notifications') {
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
        onNoticeSelect={
          handleNoticeSelectFromNotification
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