# 🐾 발자국 (Footprint)

실종된 반려동물과 목격된 동물의 정보를 공유하고, 이미지 유사도 분석과 커뮤니티 기능을 통해 관련 제보를 더 빠르게 연결할 수 있도록 만든 서비스입니다.

사용자는 `찾아요`, `봤어요`, `귀가 완료` 게시글을 작성하고 사진·댓글·알림·문의·공지사항·커뮤니티 기능을 이용할 수 있습니다. 실종 게시글과 목격 게시글의 이미지는 별도 AI 매칭 서버와 연동되어 닮은 후보를 확인할 수 있습니다.

## 주요 기능

### 회원

- 회원가입 및 로그인
- JWT 기반 사용자 인증
- 내 프로필 조회 및 수정
- 프로필 이미지 등록 및 변경
- 다른 사용자의 공개 프로필 조회
- 닉네임 변경 및 변경 주기 제한
- 차단 사용자 목록 조회 및 차단 해제
- 회원 탈퇴

### 실종·목격 게시글

- `찾아요`, `봤어요`, `귀가 완료` 상태 구분
- 게시글 목록 및 상세 조회
- 게시글 작성·수정·삭제
- 게시글 사진 최대 5장 등록
- 대표 이미지 표시
- 모바일 사진 스와이프 및 확대 보기
- 내가 작성한 게시글 조회

### 닮은 발자국 AI 매칭

- 실종 게시글과 목격 게시글 이미지 비교
- DINOv2 특징 벡터 기반 이미지 유사도 분석
- 여러 장의 사진을 조합한 게시글 단위 후보 점수 계산
- 유사 후보 목록 및 상태 관리
- 새 후보가 생긴 게시글에 `NEW` 표시
- 후보 확인 상태와 알림 흐름 연동

> AI 이미지 매칭 기능의 상세 구현은 별도 저장소에서 관리합니다.
> [footprint-match-ai](https://github.com/TANIT10/footprint-match-ai)

### 커뮤니티

- 커뮤니티 게시글 목록·상세 조회
- 게시글 작성·수정·삭제
- 이미지 첨부
- 게시글 검색
- 좋아요
- 댓글 작성 및 삭제
- 무한 스크롤 기반 목록 로딩
- 사용자 신고 및 차단
- 차단 사용자 관리

### 댓글

- 실종·목격 게시글 댓글 조회
- 댓글 작성 및 삭제
- 댓글 작성자 닉네임과 프로필 이미지 표시
- 댓글 작성자를 통한 공개 프로필 이동
- 새 댓글 알림 생성

### 알림

- 알림 목록 조회
- 개별 알림 읽음 처리
- 전체 알림 읽음 처리
- 읽지 않은 알림 표시
- 댓글·문의·공지·신고 결과·AI 후보 관련 알림
- 여러 댓글 알림 묶음 표시
- 알림과 연결된 게시글 또는 공지사항으로 이동

### 공지사항

- 공지사항 목록 및 상세 조회
- 중요 공지 우선 표시
- 대표 공지 선택 및 커뮤니티 메인 연동
- 공지 이미지 첨부
- 관리자 공지사항 등록·수정·삭제

### 문의

- 사용자와 관리자 사이의 채팅형 문의
- 문의 메시지 조회 및 전송
- 관리자 답변
- 문의 답변 알림
- 읽음 상태 처리

### 신고·차단·관리자 기능

- 게시글·댓글·사용자 신고
- 중복 신고 방지
- 사용자 차단 및 차단 해제
- 관리자 신고 목록 및 상세 조회
- 신고 승인·반려 처리
- 관리자 커뮤니티 게시글 관리
- 관리자 사용자 관리
- 관리자 문의 대화 목록 조회 및 답변
- 관리자 공지사항 관리

### 사용자 경험

- 모바일 중심 반응형 화면
- 로그인 후 게시글 목록 로딩 화면
- 발자국이 1개부터 3개까지 순서대로 나타나는 로딩 애니메이션
- 사진 슬라이드·스와이프·확대 보기
- 빈 목록 안내 화면
- 모바일 날짜 입력 UI 및 사용자 입력 화면 개선
- 새로고침 후에도 백엔드 DB 데이터 유지

## 기술 스택

### Frontend

- React 19
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

### AI Service

- Python
- FastAPI
- DINOv2 ViT-S/14
- PyTorch / Torchvision
- NumPy
- Pillow
- Cosine Similarity

### Deployment

- AWS 기반 운영 서버 배포
- 프론트엔드·백엔드·DB·AI 서비스 연동

## 서비스 흐름

```text
사용자
  ↓
React Frontend
  ↓ REST API
Spring Boot Backend
  ├─ MySQL
  └─ AI Match Request
       ↓
FastAPI + DINOv2
       ↓
유사 후보 결과
       ↓
알림 / 닮은 발자국 화면
```

## 프로젝트 구조

```text
footprint
├─ backend
│  ├─ src/main/java/com/footprint/backend
│  │  ├─ config
│  │  ├─ controller
│  │  ├─ dto
│  │  ├─ entity
│  │  ├─ exception
│  │  ├─ jwt
│  │  ├─ repository
│  │  ├─ security
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

AI 매칭 서버는 별도 저장소로 분리되어 있습니다.

```text
footprint-match-ai
├─ main.py
├─ dinov2_matcher.py
├─ post_matcher.py
├─ candidate_searcher.py
└─ requirements.txt
```

## 실행 방법

### 1. 프로젝트 내려받기

```bash
git clone <저장소 주소>
cd footprint
```

### 2. MySQL 준비

MySQL에서 발자국 프로젝트가 사용하는 데이터베이스를 준비합니다.

비밀번호와 JWT 비밀키 등의 민감한 값은 Git에 올리지 않고 환경변수로 관리합니다.

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

정상적으로 실행되면 기본 주소는 다음과 같습니다.

```text
http://localhost:8080
```

### 4. 프론트엔드 설치 및 실행

프로젝트 루트에서 실행합니다.

```powershell
npm.cmd install
npm.cmd run dev
```

Vite가 안내하는 로컬 주소에서 확인할 수 있습니다.

### 5. 프론트엔드 빌드

```powershell
npm.cmd run build
```

빌드가 성공하면 `dist` 폴더가 생성됩니다.

### 6. AI 매칭 서버 실행

별도 `footprint-match-ai` 저장소에서 실행합니다.

```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

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

### 실종·목격 게시글

```text
GET    /api/posts
GET    /api/posts/me
GET    /api/posts/{postId}
POST   /api/posts
PUT    /api/posts/{postId}
DELETE /api/posts/{postId}
```

게시글 작성은 `multipart/form-data` 형식이며 `data`, `images` 파트를 사용합니다.

게시글 수정은 `data`, `newImages` 파트를 사용합니다.

### 댓글

```text
GET    /api/posts/{postId}/comments
POST   /api/posts/{postId}/comments
DELETE /api/comments/{commentId}
```

### 알림

```text
GET    /api/notifications
PUT    /api/notifications/{notificationId}/read
PUT    /api/notifications/read-all
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

### 신고

```text
POST   /api/reports
```

커뮤니티·AI 매칭·차단·관리자 관련 API도 별도 컨트롤러로 구성되어 있으며, 관리자 API는 관리자 권한이 있는 계정만 사용할 수 있습니다.

## 인증 방식

로그인 성공 시 서버에서 JWT를 반환합니다.

인증이 필요한 API 요청에는 다음 헤더를 사용합니다.

```http
Authorization: Bearer <JWT>
```

프론트엔드는 로그인 토큰을 저장한 뒤 인증이 필요한 요청에 포함합니다.

## 이미지 처리

- 실종·목격 게시글 사진은 최대 5장까지 등록할 수 있습니다.
- JPEG, PNG, WebP, GIF 형식을 지원합니다.
- 사진 한 장의 최대 크기는 5MB입니다.
- 백엔드가 반환한 상대 이미지 경로를 프론트엔드에서 서버 주소와 결합해 표시합니다.
- 공지사항과 커뮤니티 게시글도 이미지 첨부 흐름을 지원합니다.

## 개인 담당 범위

### AI Matching Backend

- DINOv2 기반 이미지 특징 추출과 코사인 유사도 비교 구현
- 여러 장의 실종·목격 사진을 조합한 게시글 단위 점수 설계
- 유사 후보 검색·정렬 흐름과 FastAPI 업로드 API 구현
- 모델 비교 및 점수 검증용 실험 스크립트 작성

### 서비스 기능 확장 및 운영 반영

- 커뮤니티 게시글·댓글·검색·좋아요 흐름 확장
- 커뮤니티 신고 및 사용자 차단·차단 관리 기능 추가
- 닉네임 변경 및 변경 주기 제한 기능 추가
- 공지 이미지 첨부와 대표 공지 노출 기능 추가
- 모바일 게시글 사진 스와이프·확대 및 입력 UI 개선
- 알림·관리자 기능 등 기존 서비스 기능 보완
- 최신 기능을 운영 서버에 반영하고 실제 서비스 흐름 검증

> 이 저장소는 팀 프로젝트 전체 코드를 포함합니다. 위 `개인 담당 범위`는 개인이 직접 구현하거나 확장한 작업을 별도로 구분한 것이며, README의 나머지 기능 설명은 프로젝트 전체 범위를 나타냅니다.

## 테스트 참고사항

프론트엔드 빌드는 다음 명령으로 확인합니다.

```powershell
npm.cmd run build
```

백엔드 테스트를 직접 실행할 때는 MySQL 연결 정보와 `local` 프로필이 필요합니다.

해당 환경 설정 없이 `mvnw test`를 실행하면 Hibernate가 데이터베이스 정보를 찾지 못해 다음과 같은 오류가 발생할 수 있습니다.

```text
Unable to determine Dialect without JDBC metadata
```

이 오류는 애플리케이션 기능 코드가 아니라 테스트 실행 환경 설정과 관련될 수 있습니다.

## 보안 주의사항

다음 정보는 Git 저장소에 올리지 않습니다.

- MySQL 비밀번호
- JWT 비밀키
- 실제 사용자 개인정보
- 운영 서버 인증정보
- API Key 및 외부 서비스 비밀값
- 개인용 환경 설정 파일

운영 환경에서는 충분히 긴 JWT 비밀키와 HTTPS 사용을 권장합니다.

## 현재 개발 상태

- 프론트엔드 핵심 화면 구현 완료
- Spring Boot 백엔드 핵심 API 구현 완료
- MySQL 기반 실제 데이터 저장 연동 완료
- 실종·목격 게시글·댓글·공지·문의·알림 기능 연동 완료
- 커뮤니티 게시글·댓글·검색·좋아요 기능 구현 완료
- 신고·차단 및 관리자 관리 기능 구현 완료
- 닮은 발자국 AI 이미지 매칭 연동 완료
- 모바일 중심 반응형 UI 구현 완료
- AWS 운영 환경 배포 및 기능 반영 완료
- Capacitor 기반 Android 앱 전환 작업 진행 중

## 향후 계획

- 전체 기능 회귀 테스트 및 예외 상황 검증 보완
- Android 실제 기기 기능 검증 및 앱 패키징 마무리
- 배포 환경 HTTPS 및 운영 보안 설정 보완
- AI 매칭 임계값 검증과 후보 정확도 개선
- 특징 벡터 캐시 등 AI 추론 최적화

## 브랜치

현재 최신 기능 개발이 반영된 주요 브랜치:

```text
backend
```

기본 브랜치 `main`과 최신 개발 브랜치의 통합은 기능 검증 후 진행합니다.

## 프로젝트 목표

사용자들의 작은 관심과 제보가 하나의 발자국이 되어 실종된 반려동물이 가족에게 돌아갈 가능성을 높이는 것을 목표로 합니다.

> 우리 함께 발자국을 이어가요. 🐾
