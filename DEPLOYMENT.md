# ATI2000 Redmine 대시보드 배포 가이드

## Vercel을 통한 배포

이 프로젝트는 Vercel을 통해 쉽게 배포할 수 있습니다.

### 1. Vercel 계정 생성 및 GitHub 연동

1. [Vercel](https://vercel.com)에 접속하여 계정을 생성합니다.
2. GitHub 계정과 연동합니다.
3. Vercel 대시보드에서 "New Project"를 클릭합니다.

### 2. 프로젝트 배포

1. GitHub 저장소를 선택합니다.
2. 프로젝트 이름을 `ati2000-redmine-dashboard`로 설정합니다.
3. Framework Preset은 "Other"를 선택합니다.
4. Root Directory는 기본값(./)을 유지합니다.
5. Build Command는 비워둡니다 (정적 사이트이므로).
6. Output Directory는 기본값(./)을 유지합니다.
7. "Deploy" 버튼을 클릭합니다.

### 3. 환경 변수 설정 (선택사항)

만약 환경 변수가 필요하다면:
1. Vercel 대시보드에서 프로젝트를 선택합니다.
2. Settings > Environment Variables로 이동합니다.
3. 필요한 환경 변수를 추가합니다.

### 4. 도메인 설정

배포가 완료되면:
1. Vercel에서 제공하는 기본 도메인을 사용하거나
2. 커스텀 도메인을 설정할 수 있습니다.

기본 도메인 형식: `https://ati2000-redmine-dashboard.vercel.app`

### 5. 자동 배포 설정

GitHub에 코드를 푸시할 때마다 자동으로 배포되도록 설정됩니다:
- `main` 브랜치에 푸시하면 프로덕션 배포
- 다른 브랜치에 푸시하면 프리뷰 배포

### 6. 로컬 개발 환경 설정

```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행
npm run dev

# 또는
npm start
```

### 7. 수동 배포 (CLI 사용)

```bash
# Vercel CLI 설치
npm install -g vercel

# 프로젝트 디렉토리에서 배포
vercel

# 프로덕션 배포
vercel --prod
```

## 배포 후 확인사항

1. **로그인 페이지**: `https://ati2000-redmine-dashboard.vercel.app/` 또는 `https://ati2000-redmine-dashboard.vercel.app/login`
2. **대시보드**: `https://ati2000-redmine-dashboard.vercel.app/dashboard`
3. **API 설정**: 대시보드에서 API 설정 버튼을 통해 Redmine 서버 정보 입력

## 문제 해결

### CORS 오류
- Redmine 서버에서 CORS 설정이 필요할 수 있습니다.
- API 요청 시 프록시 서버 사용을 고려해보세요.

### API 키 보안
- API 키는 클라이언트 사이드에 저장되므로 보안에 주의하세요.
- 가능하면 서버 사이드에서 API 호출을 처리하는 것을 권장합니다.

### 성능 최적화
- CDN을 통한 정적 파일 캐싱이 자동으로 적용됩니다.
- 이미지 최적화는 Vercel에서 자동으로 처리됩니다.

## 지원

문제가 발생하면:
1. Vercel 대시보드의 Functions 탭에서 로그를 확인하세요.
2. 브라우저 개발자 도구의 Network 탭에서 API 요청을 확인하세요.
3. GitHub Issues에 문제를 보고하세요.