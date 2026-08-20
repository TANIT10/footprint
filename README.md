# 🐾 발자국 (Footprint)

실종된 반려동물과 목격된 동물의 정보를 공유하여 가족의 품으로 돌아갈 수 있도록 돕는 커뮤니티 서비스입니다.

사용자는 `찾아요`, `봤어요`, `귀가 완료` 게시글을 작성할 수 있으며, 댓글·알림·문의·공지사항 등의 기능을 이용할 수 있습니다.

## 주요 기능

### 회원

- 회원가입 및 로그인
- JWT 기반 사용자 인증
- 내 프로필 조회 및 수정
- 프로필 이미지 등록
- 다른 사용자의 공개 프로필 조회
- 회원 탈퇴

### 게시글

- `찾아요`, `봤어요`, `귀가 완료` 상태 구분
- 게시글 목록 및 상세 조회
- 게시글 작성·수정·삭제
- 게시글 사진 최대 5장 등록
- 대표 이미지 표시
- 내가 작성한 게시글 조회

### 댓글

- 게시글 댓글 조회
- 댓글 작성 및 삭제
- 댓글 작성자 닉네임과 프로필 이미지 표시
- 댓글 작성자를 통한 공개 프로필 이동
- 새 댓글 알림 생성

### 알림

- 알림 목록 조회
- 개별 알림 읽음 처리
- 전체 알림 읽음 처리
- 읽지 않은 알림 표시
- 댓글·문의·공지·신고 결과 알림
- 알림과 연결된 게시글 또는 공지사항으로 이동

### 공지사항

- 공지사항 목록 조회
- 공지사항 상세 조회
- 중요 공지 우선 표시
- 관리자 공지사항 등록·수정·삭제

### 문의

- 사용자와 관리자 사이의 채팅형 문의
- 문의 메시지 조회 및 전송
- 관리자 답변
- 문의 답변 알림
- 읽음 상태 처리

### 신고 및 관리자 기능

- 게시글·댓글·사용자 신고
- 중복 신고 방지
- 관리자 신고 목록 및 상세 조회
- 신고 승인·반려 처리
- 관리자 문의 대화 목록 조회
- 관리자 문의 답변
- 관리자 게시글 관리

### 사용자 경험

- 모바일 중심 반응형 화면
- 로그인 후 게시글 목록 로딩 화면
- 발자국이 1개부터 3개까지 순서대로 나타나는 애니메이션
- 사진 슬라이드
- 빈 목록 안내 화면
- 새로고침 후에도 백엔드 DB 데이터 유지

## 기술 스택

### Frontend

- React
- Vite
- JavaScript
- CSS
- Lucide React
- Fetch API

### Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- JWT
- Bean Validation
- Maven

### Database

- MySQL

## 프로젝트 구조

```text
my-app
├─ backend
│  ├─ src/main/java/com/footprint/backend
│  │  ├─ controller
│  │  ├─ dto
│  │  ├─ entity
│  │  ├─ exception
│  │  ├─ jwt
│  │  ├─ repository
│  │  └─ service
│  └─ src/main/resources
├─ public
├─ src
│  ├─ assets
│  ├─ data
│  ├─ pages
│  ├─ utils
│  └─ App.jsx
├─ package.json
└─ README.md
```

## 실행 방법

### 1. 프로젝트 내려받기

```bash
git clone <저장소 주소>
cd my-app
```

### 2. MySQL 준비

MySQL에서 발자국 프로젝트가 사용하는 데이터베이스를 준비합니다.

비밀번호와 JWT 비밀키 등의 민감한 값은 Git에 올리지 않고 환경변수로 관리합니다.

필요한 주요 환경변수는 다음과 같습니다.

```text
DB_PASSWORD
JWT_SECRET
```

### 3. 백엔드 실행

Windows PowerShell 기준:

```powershell
cd backend
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.profiles=local"
```

STS에서는 프로젝트에 등록한 `footprint-backend-local` 실행 설정을 사용할 수 있습니다.

정상적으로 실행되면 기본 주소는 다음과 같습니다.

```text
http://localhost:8080
```

### 4. 프론트엔드 설치

프로젝트 루트의 PowerShell에서 실행합니다.

```powershell
npm.cmd install
```

### 5. 프론트엔드 실행

```powershell
npm.cmd run dev
```

정상적으로 실행되면 다음 주소에서 확인할 수 있습니다.

```text
http://localhost:5174
```

5174 포트를 이미 사용 중이면 Vite가 다른 포트를 안내할 수 있습니다.

### 6. 프론트엔드 빌드

```powershell
npm.cmd run build
```

빌드가 성공하면 `dist` 폴더가 생성됩니다.

## 주요 API

### 회원

```text
POST   /api/users/signup
POST   /api/users/login
GET    /api/users/me
PUT    /api/users/me
DELETE /api/users/me
GET    /api/users/{username}
```

### 게시글

```text
GET    /api/posts
GET    /api/posts/me
GET    /api/posts/{postId}
POST   /api/posts
PUT    /api/posts/{postId}
DELETE /api/posts/{postId}
```

게시글 작성은 `multipart/form-data` 형식이며 다음 파트를 사용합니다.

```text
data
images
```

게시글 수정은 다음 파트를 사용합니다.

```text
data
newImages
```

### 댓글

```text
GET    /api/posts/{postId}/comments
POST   /api/posts/{postId}/comments
DELETE /api/comments/{commentId}
```

### 공지사항

```text
GET    /api/notices
GET    /api/notices/{noticeId}
```

### 문의

```text
GET    /api/inquiries/messages
POST   /api/inquiries/messages
```

### 알림

```text
GET    /api/notifications
PUT    /api/notifications/{notificationId}/read
PUT    /api/notifications/read-all
```

### 신고

```text
POST   /api/reports
```

관리자 API는 관리자 권한을 가진 계정만 사용할 수 있습니다.

## 인증 방식

로그인에 성공하면 서버에서 JWT를 반환합니다.

인증이 필요한 API 요청은 다음 헤더를 사용합니다.

```http
Authorization: Bearer <JWT>
```

프론트엔드는 로그인 토큰을 저장한 뒤 인증이 필요한 요청에 자동으로 포함합니다.

## 이미지 처리

- 게시글 사진은 최대 5장까지 등록할 수 있습니다.
- 지원 형식은 JPEG, PNG, WebP, GIF입니다.
- 사진 한 장의 최대 크기는 5MB입니다.
- 백엔드가 반환한 상대 이미지 경로는 프론트엔드에서 서버 주소와 결합하여 표시합니다.

## 테스트 참고사항

프론트엔드 빌드는 다음 명령으로 확인합니다.

```powershell
npm.cmd run build
```

백엔드 테스트를 PowerShell에서 직접 실행할 때는 MySQL 연결 정보와 `local` 프로필이 필요합니다.

해당 환경 설정 없이 `mvnw test`를 실행하면 Hibernate가 데이터베이스 정보를 찾지 못해 다음과 같은 오류가 발생할 수 있습니다.

```text
Unable to determine Dialect without JDBC metadata
```

이 오류는 애플리케이션 기능 코드가 아니라 테스트 실행 환경 설정과 관련된 오류입니다.

## 보안 주의사항

다음 정보는 Git 저장소에 올리지 않습니다.

- MySQL 비밀번호
- JWT 비밀키
- 실제 사용자 개인정보
- 운영 서버 인증정보
- 개인용 환경 설정 파일

운영 환경에서는 충분히 긴 JWT 비밀키를 사용하고 HTTPS를 적용해야 합니다.

## 현재 개발 상태

- 프론트엔드 핵심 화면 구현 완료
- 백엔드 핵심 API 구현 완료
- 게시글·댓글·공지·문의·알림 API 연동 완료
- 관리자 공지·문의·신고 처리 기능 구현 완료
- 모바일 중심 반응형 UI 구현 완료
- 운영 서버 배포 및 AI 기능 최종 연동 예정

## 향후 계획

- 전체 기능 통합 테스트 보완
- 테스트 전용 데이터베이스 환경 구성
- 운영 서버와 MySQL 배포
- AI 분석 기능 최종 연동
- 모바일 앱 패키징
- 앱 스토어 출시 준비

## 브랜치

현재 주요 개발 브랜치:

```text
backend
```

## 프로젝트 목표

사용자들의 작은 관심과 제보가 하나의 발자국이 되어 실종된 반려동물이 가족에게 돌아갈 가능성을 높이는 것을 목표로 합니다.

> 우리 함께 발자국을 이어가요. 🐾