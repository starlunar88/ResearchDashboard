# ATI2000 Redmine 대시보드

Redmine 프로젝트와 이슈를 한눈에 볼 수 있는 웹 대시보드입니다.

## 🚀 주요 기능

- **프로젝트 통계**: 전체 프로젝트 수, 진행 중인 이슈, 지연된 이슈, 완료된 이슈
- **프로젝트 목록**: 각 프로젝트의 진행률과 이슈 현황
- **최근 활동**: 최근 업데이트된 이슈 목록
- **이슈 상태 차트**: 이슈 상태별 분포를 시각화
- **실시간 데이터**: Redmine API를 통한 실시간 데이터 연동

## 🛠️ 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **UI Framework**: Bootstrap 5
- **Charts**: Chart.js
- **Icons**: Font Awesome
- **API**: Redmine REST API

## 📋 사용 방법

### 1. 로그인
1. 웹사이트 접속 시 로그인 페이지가 표시됩니다
2. Redmine 계정의 아이디와 비밀번호를 입력합니다
3. **로그인** 버튼을 클릭하여 대시보드에 접근합니다

### 2. 대시보드 사용
- 로그인 후 자동으로 데이터가 로드됩니다
- **새로고침** 버튼으로 수동 업데이트 가능
- **로그아웃** 버튼으로 안전하게 로그아웃 가능

### 3. API 설정 (선택사항)
- 대시보드에서 **API 설정** 버튼으로 추가 설정 가능
- 직접 API 키를 입력하여 사용할 수 있습니다

## 🌐 배포 방법

### GitHub Pages (추천)
```bash
# 저장소 클론
git clone https://github.com/[사용자명]/redmine-dashboard.git

# 파일 수정 후 커밋
git add .
git commit -m "Update dashboard"
git push origin main
```

자세한 배포 방법은 [DEPLOYMENT.md](./DEPLOYMENT.md)를 참고하세요.

## 🔧 로컬 개발

### 요구사항
- Node.js (선택사항 - 로컬 서버용)

### 실행 방법
```bash
# 의존성 설치
npm install

# 로컬 서버 실행
npm start
```

또는 간단히 `index.html` 파일을 브라우저에서 직접 열어도 됩니다.

## 📁 프로젝트 구조

```
redmine-dashboard/
├── index.html          # 메인 HTML 파일
├── script.js           # JavaScript 로직
├── styles.css          # CSS 스타일
├── package.json        # 프로젝트 설정
├── README.md           # 프로젝트 설명
├── DEPLOYMENT.md       # 배포 가이드
└── .gitignore          # Git 무시 파일
```

## 🔒 보안 고려사항

- API 키는 브라우저의 로컬 스토리지에 저장됩니다
- 각 사용자가 개별적으로 API 키를 입력해야 합니다
- HTTPS를 사용하여 API 키 전송을 보호하세요

## 🤝 기여하기

1. 이 저장소를 Fork합니다
2. 기능 브랜치를 생성합니다 (`git checkout -b feature/새기능`)
3. 변경사항을 커밋합니다 (`git commit -am '새 기능 추가'`)
4. 브랜치에 푸시합니다 (`git push origin feature/새기능`)
5. Pull Request를 생성합니다

## 📝 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🆘 문제 해결

### API 연결 오류
- Redmine 서버 URL이 올바른지 확인
- API 키가 유효한지 확인
- CORS 정책 확인 (필요시 Redmine 서버 설정)

### 데이터가 표시되지 않음
- 브라우저 개발자 도구에서 콘솔 오류 확인
- 네트워크 탭에서 API 요청 상태 확인
- API 키 권한 확인

## 📞 지원

문제가 발생하거나 기능 요청이 있으시면 GitHub Issues를 통해 문의해주세요.

---

**ATI2000 Team** - 프로젝트 관리 효율성을 위한 Redmine 대시보드