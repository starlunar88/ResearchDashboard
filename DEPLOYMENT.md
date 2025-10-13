# Redmine 대시보드 배포 가이드

## 🚀 빠른 배포 (Vercel 추천)

### 1. Vercel 배포 (가장 간단)
1. [Vercel](https://vercel.com) 회원가입
2. **New Project** 클릭
3. GitHub 저장소 import
4. **Deploy** 클릭
5. 자동으로 `https://your-project.vercel.app` 도메인 생성

### 2. Netlify 배포
1. [Netlify](https://netlify.com) 회원가입
2. **New site from Git** 클릭
3. GitHub 저장소 연결
4. Build settings:
   - Build command: (비워둠)
   - Publish directory: `/` (또는 루트)
5. **Deploy site** 클릭

## GitHub Pages를 이용한 배포

### 1. GitHub 저장소 생성
1. GitHub에 로그인 후 새 저장소 생성
2. 저장소 이름: `redmine-dashboard` (또는 원하는 이름)
3. Public으로 설정 (GitHub Pages 무료 사용을 위해)
4. README.md 파일 생성 체크

### 2. 프로젝트 파일 업로드
```bash
# Git 초기화
git init

# 원격 저장소 추가
git remote add origin https://github.com/[사용자명]/redmine-dashboard.git

# 파일 추가
git add .

# 커밋
git commit -m "Initial commit: Redmine Dashboard"

# 푸시
git push -u origin main
```

### 3. GitHub Pages 활성화
1. GitHub 저장소 페이지에서 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. Source를 **Deploy from a branch** 선택
4. Branch를 **main** 선택
5. **Save** 클릭

### 4. 접속 확인
- 배포 완료 후 `https://[사용자명].github.io/redmine-dashboard` 접속
- 배포에는 보통 5-10분 소요

## 다른 호스팅 서비스

### Netlify 배포
1. [Netlify](https://netlify.com) 회원가입
2. **New site from Git** 클릭
3. GitHub 저장소 연결
4. Build settings:
   - Build command: (비워둠)
   - Publish directory: `/` (또는 루트)
5. **Deploy site** 클릭

### Vercel 배포
1. [Vercel](https://vercel.com) 회원가입
2. **New Project** 클릭
3. GitHub 저장소 import
4. **Deploy** 클릭

## 팀 협업 설정

### 1. 팀원 초대
```bash
# GitHub 저장소에서 Settings > Manage access > Invite a collaborator
```

### 2. 브랜치 전략
```bash
# 기능별 브랜치 생성
git checkout -b feature/new-feature

# 작업 후 푸시
git push origin feature/new-feature

# Pull Request 생성하여 코드 리뷰
```

### 3. 자동 배포 설정
- GitHub Actions를 사용하여 자동 배포 설정 가능
- 코드 변경 시 자동으로 사이트 업데이트

## 보안 고려사항

### 1. API 키 관리
- 현재 API 키가 로컬 스토리지에 저장됨
- 각 사용자가 개별적으로 API 키를 입력해야 함
- 서버 사이드에서 API 키를 관리하려면 백엔드 필요

### 2. CORS 정책
- Redmine 서버에서 CORS를 허용해야 함
- 필요시 프록시 서버 구축 고려

## 커스텀 도메인 설정

### 1. 도메인 구매
- 원하는 도메인 구매 (예: `redmine-dashboard.com`)

### 2. DNS 설정
```
Type: CNAME
Name: www
Value: [사용자명].github.io
```

### 3. GitHub Pages 설정
- Settings > Pages > Custom domain에 도메인 입력
- HTTPS 강제 사용 체크

## 모니터링 및 유지보수

### 1. 성능 모니터링
- Google Analytics 추가
- 페이지 로딩 속도 모니터링

### 2. 정기 업데이트
- Redmine API 변경사항 확인
- 보안 업데이트 적용
- 사용자 피드백 반영

## 문제 해결

### 1. 배포 실패
- GitHub Actions 로그 확인
- 파일 경로 및 권한 확인

### 2. API 연결 오류
- CORS 정책 확인
- Redmine 서버 상태 확인
- API 키 유효성 확인

### 3. 성능 이슈
- 이미지 최적화
- CSS/JS 압축
- CDN 사용 고려
