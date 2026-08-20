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

const STORAGE_KEY =
  'footprint-posts'

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

function App() {
  const [page, setPage] =
    useState('start')

  const [
    selectedPostId,
    setSelectedPostId,
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
    useState(() => {
      try {
        const savedPosts =
          localStorage.getItem(
            STORAGE_KEY
          )

        return savedPosts
          ? JSON.parse(savedPosts)
          : []
      } catch (error) {
        console.error(
          '저장된 게시글을 불러오지 못했습니다.',
          error
        )

        return []
      }
    })

  const [
    notifications,
    setNotifications,
  ] = useState([])

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(posts)
      )
    } catch (error) {
      console.error(
        '게시글 저장에 실패했습니다.',
        error
      )

      window.alert(
        '사진 용량이 너무 커서 게시글을 저장하지 못했어요.'
      )
    }
  }, [posts])

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

  const selectedPost = posts.find(
    (post) =>
      post.id === selectedPostId
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

  const handlePostComplete = (
    newPost
  ) => {
    setPosts((previousPosts) => [
      {
        ...newPost,
        author: currentUsername,
        authorNickname:
          currentNickname,
        comments:
          newPost.comments ?? [],
      },
      ...previousPosts,
    ])

    setPage('postList')
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

  const handlePostSelectFromList = (
    postId
  ) => {
    setSelectedPostId(postId)
    setDetailBackPage('postList')
    setPage('postDetail')
  }

  const handlePostSelectFromMyPosts = (
    postId
  ) => {
    setSelectedPostId(postId)
    setDetailBackPage('myPosts')
    setPage('postDetail')
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
      nickname: nickname || '닉네임',
    })

    setProfileBackPage('postDetail')
    setPage('userProfile')
  }

  const handlePostSelectFromUserProfile = (
    postId
  ) => {
    setSelectedPostId(postId)
    setDetailBackPage('userProfile')
    setPage('postDetail')
  }

  const handlePostSelectFromNotification =
    (postId) => {
      const selectedPostExists =
        posts.some(
          (post) =>
            post.id === postId
        )

      if (!selectedPostExists) {
        window.alert(
          '삭제되었거나 찾을 수 없는 게시글이에요.'
        )
        return
      }

      setSelectedPostId(postId)
      setDetailBackPage(
        'notifications'
      )
      setPage('postDetail')
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

  const handlePostDelete = (
    postId
  ) => {
    setPosts((previousPosts) =>
      previousPosts.filter(
        (post) =>
          post.id !== postId
      )
    )

    setNotifications(
      (previousNotifications) =>
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
    }
  }

  const handlePostEdit = (
    postId
  ) => {
    const postToEdit = posts.find(
      (post) =>
        post.id === postId
    )

    if (!postToEdit) {
      window.alert(
        '수정할 게시글을 찾을 수 없어요.'
      )
      return
    }

    if (
      postToEdit.author !==
      currentUsername
    ) {
      window.alert(
        '본인이 작성한 게시글만 수정할 수 있어요.'
      )
      return
    }

    setSelectedPostId(postId)
    setPage('postEdit')
  }

  const handlePostUpdate = (
    updatedPost
  ) => {
    if (
      updatedPost.author !==
      currentUsername
    ) {
      window.alert(
        '본인이 작성한 게시글만 수정할 수 있어요.'
      )
      return
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === updatedPost.id
          ? {
              ...post,
              ...updatedPost,
              id: post.id,
              author: post.author,
              authorNickname:
                post.authorNickname,
              comments:
                post.comments ?? [],
              createdAt:
                post.createdAt,
            }
          : post
      )
    )

    setSelectedPostId(
      updatedPost.id
    )

    setPage('myPosts')

    window.alert(
      '게시글이 수정됐어요.'
    )
  }

  const handleCommentAdd = (
    postId,
    commentText
  ) => {
    if (
      !currentNickname ||
      !currentUsername
    ) {
      window.alert(
        '로그인 정보를 찾을 수 없습니다. 다시 로그인해주세요.'
      )
      return
    }

    const targetPost = posts.find(
      (post) =>
        post.id === postId
    )

    if (!targetPost) {
      window.alert(
        '댓글을 작성할 게시글을 찾을 수 없어요.'
      )
      return
    }

    const newComment = {
      id: crypto.randomUUID(),
      author: currentNickname,
      authorUsername:
        currentUsername,
      content: commentText,
      createdAt:
        new Date().toISOString(),
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: [
                ...(post.comments ??
                  []),
                newComment,
              ],
            }
          : post
      )
    )
  }

  const handleCommentDelete = (
    postId,
    commentId
  ) => {
    const targetPost = posts.find(
      (post) =>
        post.id === postId
    )

    if (!targetPost) {
      window.alert(
        '게시글을 찾을 수 없어요.'
      )
      return
    }

    const targetComment = (
      targetPost.comments ?? []
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

    if (
      targetComment.authorUsername !==
      currentUsername
    ) {
      window.alert(
        '본인이 작성한 댓글만 삭제할 수 있어요.'
      )
      return
    }

    setPosts((previousPosts) =>
      previousPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              comments: (
                post.comments ?? []
              ).filter(
                (savedComment) =>
                  savedComment.id !==
                  commentId
              ),
            }
          : post
      )
    )
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

    setPosts((previousPosts) =>
      previousPosts
        .filter(
          (post) =>
            post.author !==
            withdrawnUsername
        )
        .map((post) => ({
          ...post,
          comments: (
            post.comments ?? []
          ).filter(
            (comment) =>
              comment.authorUsername !==
              withdrawnUsername
          ),
        }))
    )

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
        posts={posts}
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