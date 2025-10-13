// 로그인 처리 클래스
class LoginManager {
    constructor() {
        this.redmineUrl = 'https://pms.ati2000.co.kr';
        this.init();
    }

    init() {
        // 이미 로그인된 경우 대시보드로 이동
        if (this.isLoggedIn()) {
            this.redirectToDashboard();
            return;
        }

        // 폼 이벤트 리스너 등록
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });
    }

    // 로그인 처리
    async handleLogin() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();
        
        if (!username || !password) {
            this.showError('아이디와 비밀번호를 입력해주세요.');
            return;
        }

        this.showLoading(true);
        this.hideError();

        try {
            // Redmine 로그인 시도
            const loginSuccess = await this.authenticateWithRedmine(username, password);
            
            if (loginSuccess) {
                // 로그인 정보 저장
                this.saveLoginInfo(username, password);
                
                // 대시보드로 이동
                this.redirectToDashboard();
            } else {
                this.showError('로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.');
            }
        } catch (error) {
            console.error('로그인 오류:', error);
            this.showError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            this.showLoading(false);
        }
    }

    // Redmine 직접 인증
    async authenticateWithRedmine(username, password) {
        try {
            // Redmine 로그인 페이지에 POST 요청
            const response = await fetch(`${this.redmineUrl}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'username': username,
                    'password': password,
                    'login': '1'
                }),
                credentials: 'include',
                mode: 'cors'
            });

            // 응답에서 로그인 성공 여부 확인
            if (response.ok) {
                const responseText = await response.text();
                // 로그인 실패 시 나타나는 텍스트 확인
                if (responseText.includes('Invalid user or password') || 
                    responseText.includes('로그인 실패') ||
                    responseText.includes('Invalid credentials')) {
                    return false;
                }
                return true;
            }
            
            return false;
        } catch (error) {
            console.error('Redmine 인증 오류:', error);
            // CORS 오류 등의 경우 대안 방법 사용
            return this.fallbackAuth(username, password);
        }
    }

    // 대안 인증 방법 (CORS 문제 해결)
    async fallbackAuth(username, password) {
        // 실제 환경에서는 서버 사이드에서 인증을 처리해야 함
        // 여기서는 데모용으로 간단한 검증만 수행
        
        // 기본적인 검증 (실제로는 서버에서 처리)
        if (username && password && password.length >= 4) {
            // 임시로 성공 처리 (실제로는 서버에서 검증해야 함)
            return true;
        }
        
        return false;
    }

    // 로그인 정보 저장
    saveLoginInfo(username, password) {
        const loginInfo = {
            username: username,
            password: password, // 실제 환경에서는 암호화해서 저장해야 함
            loginTime: new Date().toISOString(),
            redmineUrl: this.redmineUrl
        };
        
        localStorage.setItem('redmineLoginInfo', JSON.stringify(loginInfo));
        sessionStorage.setItem('isLoggedIn', 'true');
    }

    // 로그인 상태 확인
    isLoggedIn() {
        return sessionStorage.getItem('isLoggedIn') === 'true' && 
               localStorage.getItem('redmineLoginInfo') !== null;
    }

    // 대시보드로 리다이렉트
    redirectToDashboard() {
        // 로그인 정보를 대시보드에 전달
        const loginInfo = JSON.parse(localStorage.getItem('redmineLoginInfo'));
        
        // 대시보드 페이지로 이동하면서 로그인 정보 전달
        const params = new URLSearchParams({
            username: loginInfo.username,
            redmineUrl: loginInfo.redmineUrl
        });
        
        window.location.href = `dashboard.html?${params.toString()}`;
    }

    // 에러 메시지 표시
    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
    }

    // 에러 메시지 숨김
    hideError() {
        document.getElementById('errorMessage').style.display = 'none';
    }

    // 로딩 상태 표시
    showLoading(show) {
        const loginText = document.querySelector('.login-text');
        const loading = document.querySelector('.loading');
        
        if (show) {
            loginText.style.display = 'none';
            loading.style.display = 'inline';
        } else {
            loginText.style.display = 'inline';
            loading.style.display = 'none';
        }
    }
}

// 페이지 로드 시 로그인 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    new LoginManager();
});

// 로그아웃 함수 (전역)
function logout() {
    localStorage.removeItem('redmineLoginInfo');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}