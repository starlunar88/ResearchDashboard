// Redmine API 클래스 (로그인 방식만 사용)
class RedmineAPI {
    constructor() {
        this.config = this.loadConfig();
    }

    // 로그인 정보에서 설정 로드
    loadConfig() {
        const loginInfo = localStorage.getItem('redmineLoginInfo');
        if (loginInfo) {
            const login = JSON.parse(loginInfo);
            return {
                url: login.redmineUrl,
                username: login.username,
                password: login.password
            };
        }
        return {
            url: 'https://pms.ati2000.co.kr',
            username: '',
            password: ''
        };
    }

    // API 요청 (프록시 서버 사용)
    async request(endpoint, params = {}) {
        console.log('=== API 요청 시작 ===');
        console.log('요청 정보:', { endpoint, params });
        
        if (!this.config.username || !this.config.password) {
            console.error('로그인 정보 누락');
            throw new Error('로그인 정보가 없습니다.');
        }

        // URL 검증
        if (!this.isValidUrl(this.config.url)) {
            console.error('잘못된 URL:', this.config.url);
            throw new Error('올바르지 않은 Redmine URL입니다.');
        }

        try {
            // 프록시 서버를 통한 API 요청
            const queryString = new URLSearchParams({
                endpoint: endpoint,
                ...params
            }).toString();
            
            const proxyUrl = `/api/redmine?${queryString}`;
            
            console.log('프록시 URL:', proxyUrl);
            console.log('요청 파라미터:', { endpoint, params });
            console.log('인증 정보:', {
                username: this.config.username,
                hasPassword: !!this.config.password,
                redmineUrl: this.config.url
            });

            const requestStartTime = Date.now();
            console.log('요청 시작 시간:', new Date().toISOString());

            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(this.config.username + ':' + this.config.password),
                    'Content-Type': 'application/json'
                }
            });

            const requestEndTime = Date.now();
            console.log('요청 완료 시간:', new Date().toISOString());
            console.log('요청 소요 시간:', requestEndTime - requestStartTime, 'ms');
            console.log('응답 상태:', response.status, response.statusText);
            console.log('응답 헤더:', Object.fromEntries(response.headers.entries()));

            if (!response.ok) {
                const errorText = await response.text();
                console.error('API 오류 응답 본문:', errorText);
                
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                    console.error('파싱된 오류 데이터:', errorData);
                } catch (e) {
                    console.error('JSON 파싱 실패:', e);
                    errorData = { error: errorText };
                }
                
                const errorMessage = errorData.error || `HTTP 오류 (${response.status})`;
                console.error('최종 오류 메시지:', errorMessage);
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('API 응답 성공 - 데이터 키:', Object.keys(data));
            console.log('API 응답 데이터 샘플:', data);
            console.log('=== API 요청 성공 ===');
            return data;

        } catch (error) {
            console.error('=== API 요청 실패 ===');
            console.error('오류 객체:', error);
            console.error('오류 타입:', error.name);
            console.error('오류 메시지:', error.message);
            console.error('오류 스택:', error.stack);
            
            // 네트워크 오류 상세 분석
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                console.error('네트워크 오류 분석:');
                console.error('- CORS 문제 가능성');
                console.error('- 네트워크 연결 문제');
                console.error('- 서버 응답 없음');
                console.error('- DNS 해결 실패');
            }
            
            // 모든 네트워크 오류나 서버 오류 시 데모 데이터 사용
            console.log('오류로 인해 데모 데이터를 사용합니다.');
            return this.getMockData(endpoint, params);
        }
    }

    // URL 유효성 검증
    isValidUrl(string) {
        try {
            const url = new URL(string);
            return url.protocol === 'http:' || url.protocol === 'https:';
        } catch (_) {
            return false;
        }
    }

    // 데모용 목 데이터
    getMockData(endpoint, params) {
        if (endpoint === '/projects') {
            return {
                projects: [
                    {
                        id: 1,
                        name: "Research Note 프로젝트",
                        identifier: "research_note",
                        description: "ATI2000 Research Note 프로젝트"
                    },
                    {
                        id: 2,
                        name: "ATI2000 메인 프로젝트",
                        identifier: "ati2000-main",
                        description: "ATI2000의 메인 개발 프로젝트"
                    },
                    {
                        id: 3,
                        name: "웹 대시보드",
                        identifier: "web-dashboard",
                        description: "Redmine 대시보드 웹 애플리케이션"
                    }
                ]
            };
        } else if (endpoint === '/issues') {
            return {
                issues: [
                    {
                        id: 1,
                        subject: "대시보드 개발",
                        project: { id: 1, name: "Research Note 프로젝트" },
                        status: { name: "진행중", is_closed: false },
                        updated_on: new Date().toISOString(),
                        due_date: null
                    },
                    {
                        id: 2,
                        subject: "API 연동 테스트",
                        project: { id: 2, name: "ATI2000 메인 프로젝트" },
                        status: { name: "완료", is_closed: true },
                        updated_on: new Date(Date.now() - 86400000).toISOString(),
                        due_date: null
                    },
                    {
                        id: 3,
                        subject: "UI 개선 작업",
                        project: { id: 3, name: "웹 대시보드" },
                        status: { name: "진행중", is_closed: false },
                        updated_on: new Date(Date.now() - 3600000).toISOString(),
                        due_date: new Date(Date.now() + 86400000).toISOString()
                    },
                    {
                        id: 4,
                        subject: "버그 수정",
                        project: { id: 1, name: "Research Note 프로젝트" },
                        status: { name: "지연", is_closed: false },
                        updated_on: new Date(Date.now() - 172800000).toISOString(),
                        due_date: new Date(Date.now() - 86400000).toISOString()
                    }
                ]
            };
        }
        return { projects: [], issues: [] };
    }

    // 프로젝트 목록 조회
    async getProjects() {
        return await this.request('/projects', { limit: 100 });
    }

    // 이슈 목록 조회
    async getIssues(projectId = null, params = {}) {
        const endpoint = projectId ? `/projects/${projectId}/issues` : '/issues';
        return await this.request(endpoint, { limit: 100, ...params });
    }
}

// 대시보드 클래스
class Dashboard {
    constructor() {
        this.api = new RedmineAPI();
        this.chart = null;
        this.projects = [];
        this.issues = [];
    }

    // 초기화
    async init() {
        console.log('=== 대시보드 초기화 시작 ===');
        
        // 로그인 상태 확인
        if (!this.checkAuth()) {
            console.log('인증 실패 - 로그인 페이지로 리다이렉트');
            return;
        }

        // 사용자 정보 표시
        this.displayUserInfo();

        // 로그인 정보가 있는지 확인
        if (!this.api.config.username || !this.api.config.password) {
            console.log('로그인 정보 누락:', {
                username: this.api.config.username ? '있음' : '없음',
                password: this.api.config.password ? '있음' : '없음'
            });
            alert('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
            window.location.href = 'login.html';
            return;
        }

        console.log('로그인 정보 확인 완료:', {
            username: this.api.config.username,
            redmineUrl: this.api.config.url
        });

        await this.loadData();
        this.renderDashboard();
        
        console.log('=== 대시보드 초기화 완료 ===');
    }

    // 인증 상태 확인
    checkAuth() {
        const loginInfo = localStorage.getItem('redmineLoginInfo');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        
        if (!loginInfo || !isLoggedIn) {
            window.location.href = 'login.html';
            return false;
        }
        
        return true;
    }

    // 사용자 정보 표시
    displayUserInfo() {
        const loginInfo = JSON.parse(localStorage.getItem('redmineLoginInfo'));
        if (loginInfo && loginInfo.username) {
            document.getElementById('currentUser').textContent = loginInfo.username;
        }
    }

    // 데이터 로드
    async loadData() {
        console.log('=== 데이터 로드 시작 ===');
        showLoading(true);
        
        try {
            // 먼저 API 서버 연결 테스트
            console.log('1단계: API 서버 연결 테스트');
            const apiServerWorking = await this.testApiConnection();
            console.log('API 서버 테스트 결과:', apiServerWorking);
            
            if (!apiServerWorking) {
                console.log('API 서버가 작동하지 않아 데모 데이터를 사용합니다.');
                this.loadDemoData();
                showLoading(false);
                this.renderDashboard();
                this.showApiServerNotice();
                return;
            }

            // Redmine 서버 연결 테스트
            console.log('2단계: Redmine 서버 연결 테스트');
            const redmineServerWorking = await this.testRedmineConnection();
            console.log('Redmine 서버 테스트 결과:', redmineServerWorking);
            
            if (!redmineServerWorking) {
                console.log('Redmine 서버 연결 실패로 데모 데이터를 사용합니다.');
                this.loadDemoData();
                showLoading(false);
                this.renderDashboard();
                return;
            }
            
            // 프로젝트 목록 조회
            console.log('3단계: 프로젝트 목록 조회');
            const projectsData = await this.api.getProjects();
            this.projects = projectsData.projects || [];
            console.log('프로젝트 데이터 로드 완료:', this.projects.length, '개');

            // 이슈 목록 조회
            console.log('4단계: 이슈 목록 조회');
            const issuesData = await this.api.getIssues(null, {
                status_id: '*'
            });
            this.issues = issuesData.issues || [];
            console.log('이슈 데이터 로드 완료:', this.issues.length, '개');

            showLoading(false);
            console.log('=== 데이터 로드 성공 ===');
            
            // 데모 데이터 사용 시 알림 표시
            if (this.projects.length > 0 && this.projects[0].name === "Research Note 프로젝트") {
                console.log('데모 데이터 사용 중');
                this.showDemoDataNotice();
            }
            
        } catch (error) {
            showLoading(false);
            console.error('=== 데이터 로드 실패 ===');
            console.error('오류 객체:', error);
            console.error('오류 타입:', error.name);
            console.error('오류 메시지:', error.message);
            console.error('오류 스택:', error.stack);
            
            console.log('오류로 인해 데모 데이터를 사용합니다.');
            this.loadDemoData();
            this.renderDashboard();
            this.showErrorNotification('API 연결 실패로 데모 데이터를 표시합니다: ' + error.message);
        }
    }

    // 데모 데이터 로드
    loadDemoData() {
        const projectsData = this.api.getMockData('/projects');
        this.projects = projectsData.projects || [];

        const issuesData = this.api.getMockData('/issues');
        this.issues = issuesData.issues || [];
    }

    // API 서버 상태 알림
    showApiServerNotice() {
        const notice = document.createElement('div');
        notice.className = 'alert alert-warning alert-dismissible fade show position-fixed';
        notice.style.cssText = 'top: 80px; right: 20px; z-index: 1050; max-width: 400px;';
        notice.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>API 서버 연결 실패</strong><br>
            <small>프록시 서버에 연결할 수 없어 데모 데이터를 표시합니다. 잠시 후 다시 시도해주세요.</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notice);
        
        // 10초 후 자동으로 사라짐
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
            }
        }, 10000);
    }

    // API 서버 연결 테스트
    async testApiConnection() {
        try {
            console.log('API 서버 연결 테스트 시작...');
            const response = await fetch('/api/test');
            
            if (response.ok) {
                const data = await response.json();
                console.log('API 서버 연결 성공:', data);
                return true;
            } else {
                console.error('API 서버 연결 실패:', response.status);
                return false;
            }
        } catch (error) {
            console.error('API 서버 테스트 실패:', error);
            return false;
        }
    }

    // Redmine 서버 연결 테스트
    async testRedmineConnection() {
        try {
            console.log('Redmine 서버 연결 테스트 시작...');
            const response = await fetch('/api/redmine-test');
            
            if (response.ok) {
                const data = await response.json();
                console.log('Redmine 서버 테스트 결과:', data);
                
                if (data.success) {
                    this.showSuccessNotification('Redmine 서버 연결 성공!');
                    return true;
                } else {
                    this.showErrorNotification(`Redmine 서버 연결 실패: ${data.message}`);
                    return false;
                }
            } else {
                console.error('Redmine 서버 테스트 실패:', response.status);
                this.showErrorNotification('Redmine 서버 테스트 요청 실패');
                return false;
            }
        } catch (error) {
            console.error('Redmine 서버 테스트 실패:', error);
            this.showErrorNotification('Redmine 서버 테스트 중 오류 발생: ' + error.message);
            return false;
        }
    }

    // 성공 알림 표시
    showSuccessNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 80px; right: 20px; z-index: 1050; max-width: 400px;';
        notification.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            <strong>성공</strong><br>
            <small>${message}</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        // 5초 후 자동으로 사라짐
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);
    }

    // 데모 데이터 사용 알림
    showDemoDataNotice() {
        const notice = document.createElement('div');
        notice.className = 'alert alert-info alert-dismissible fade show position-fixed';
        notice.style.cssText = 'top: 80px; right: 20px; z-index: 1050; max-width: 400px;';
        notice.innerHTML = `
            <i class="fas fa-info-circle me-2"></i>
            <strong>데모 데이터를 표시합니다.</strong><br>
            <small>실제 Redmine 데이터를 보려면 올바른 로그인 정보를 입력하세요.</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notice);
        
        // 8초 후 자동으로 사라짐
        setTimeout(() => {
            if (notice.parentNode) {
                notice.remove();
            }
        }, 8000);
    }

    // 에러 알림 표시
    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-danger alert-dismissible fade show position-fixed';
        notification.style.cssText = 'top: 80px; right: 20px; z-index: 1050; max-width: 400px;';
        notification.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>오류 발생</strong><br>
            <small>${message}</small>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(notification);
        
        // 10초 후 자동으로 사라짐
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 10000);
    }

    // 대시보드 렌더링
    renderDashboard() {
        this.renderStatistics();
        this.renderProjects();
        this.renderRecentActivities();
        this.renderChart();
    }

    // 통계 렌더링
    renderStatistics() {
        document.getElementById('totalProjects').textContent = this.projects.length;

        const activeIssues = this.issues.filter(issue => issue.status.is_closed === false);
        document.getElementById('activeIssues').textContent = activeIssues.length;

        const now = new Date();
        const overdueIssues = this.issues.filter(issue => {
            if (!issue.due_date || issue.status.is_closed) return false;
            return new Date(issue.due_date) < now;
        });
        document.getElementById('overdueIssues').textContent = overdueIssues.length;

        const completedIssues = this.issues.filter(issue => issue.status.is_closed === true);
        document.getElementById('completedIssues').textContent = completedIssues.length;
    }

    // 프로젝트 목록 렌더링
    renderProjects() {
        const projectsList = document.getElementById('projectsList');
        projectsList.innerHTML = '';

        this.projects.forEach(project => {
            const projectIssues = this.issues.filter(i => i.project.id === project.id);
            const completedCount = projectIssues.filter(i => i.status.is_closed).length;
            const totalCount = projectIssues.length;
            const progress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

            const projectCard = `
                <div class="col-md-6 mb-3">
                    <div class="card h-100">
                        <div class="card-body">
                            <h6 class="card-title">
                                <a href="${this.api.config.url}/projects/${project.identifier}" target="_blank">
                                    ${project.name}
                                </a>
                            </h6>
                            <p class="card-text text-muted small">${project.description || '설명 없음'}</p>
                            <div class="progress mb-2" style="height: 20px;">
                                <div class="progress-bar" role="progressbar" 
                                     style="width: ${progress}%" 
                                     aria-valuenow="${progress}" aria-valuemin="0" aria-valuemax="100">
                                    ${progress}%
                                </div>
                            </div>
                            <small class="text-muted">
                                완료: ${completedCount} / 전체: ${totalCount}
                            </small>
                        </div>
                    </div>
                </div>
            `;
            projectsList.innerHTML += projectCard;
        });
    }

    // 최근 활동 렌더링
    renderRecentActivities() {
        const recentActivities = document.getElementById('recentActivities');
        
        const sortedIssues = [...this.issues].sort((a, b) => 
            new Date(b.updated_on) - new Date(a.updated_on)
        ).slice(0, 10);

        if (sortedIssues.length === 0) {
            recentActivities.innerHTML = '<p class="text-muted">최근 활동이 없습니다.</p>';
            return;
        }

        let html = '<div class="list-group list-group-flush">';
        sortedIssues.forEach(issue => {
            const updatedDate = new Date(issue.updated_on);
            const timeAgo = this.getTimeAgo(updatedDate);
            
            html += `
                <div class="list-group-item px-0">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">
                            <a href="${this.api.config.url}/issues/${issue.id}" target="_blank">
                                #${issue.id} ${issue.subject}
                            </a>
                        </h6>
                        <small>${timeAgo}</small>
                    </div>
                    <small class="text-muted">${issue.project.name} - ${issue.status.name}</small>
                </div>
            `;
        });
        html += '</div>';
        recentActivities.innerHTML = html;
    }

    // 차트 렌더링
    renderChart() {
        const ctx = document.getElementById('issueStatusChart').getContext('2d');

        const statusMap = {};
        this.issues.forEach(issue => {
            const statusName = issue.status.name;
            statusMap[statusName] = (statusMap[statusName] || 0) + 1;
        });

        const labels = Object.keys(statusMap);
        const data = Object.values(statusMap);

        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        '#0d6efd', '#6610f2', '#6f42c1', '#d63384',
                        '#dc3545', '#fd7e14', '#ffc107', '#198754',
                        '#20c997', '#0dcaf0'
                    ]
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    // 시간 경과 표시
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        if (seconds < 60) return '방금 전';
        if (seconds < 3600) return Math.floor(seconds / 60) + '분 전';
        if (seconds < 86400) return Math.floor(seconds / 3600) + '시간 전';
        if (seconds < 604800) return Math.floor(seconds / 86400) + '일 전';
        return date.toLocaleDateString('ko-KR');
    }
}

// 전역 변수
let dashboard;

// 페이지 로드 시 실행
document.addEventListener('DOMContentLoaded', () => {
    dashboard = new Dashboard();
    dashboard.init();
});

// 로그인 정보 변경
function changeLoginInfo() {
    if (confirm('로그인 정보를 변경하시겠습니까?\n현재 로그인 정보가 삭제되고 로그인 페이지로 이동합니다.')) {
        localStorage.removeItem('redmineLoginInfo');
        localStorage.removeItem('redmineConfig');
        sessionStorage.removeItem('isLoggedIn');
        window.location.href = 'login.html';
    }
}

// 데이터 새로고침
async function refreshData() {
    await dashboard.loadData();
    dashboard.renderDashboard();
}

// 프로젝트 필터링
function filterProjects(filter) {
    console.log('Filter:', filter);
}

// 로딩 표시/숨김
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

// 연결 테스트 함수
async function testConnection() {
    if (!dashboard) {
        alert('대시보드가 초기화되지 않았습니다.');
        return;
    }

    try {
        // API 서버 테스트
        const apiTest = await dashboard.testApiConnection();
        console.log('API 서버 테스트 결과:', apiTest);
        
        // Redmine 서버 테스트
        const redmineTest = await dashboard.testRedmineConnection();
        console.log('Redmine 서버 테스트 결과:', redmineTest);
        
        // 결과 요약
        if (apiTest && redmineTest) {
            alert('모든 연결 테스트가 성공했습니다!');
        } else if (apiTest && !redmineTest) {
            alert('API 서버는 정상이지만 Redmine 서버 연결에 문제가 있습니다.');
        } else if (!apiTest && redmineTest) {
            alert('Redmine 서버는 정상이지만 API 서버 연결에 문제가 있습니다.');
        } else {
            alert('모든 연결 테스트가 실패했습니다. 데모 데이터를 사용합니다.');
        }
        
    } catch (error) {
        console.error('연결 테스트 중 오류:', error);
        alert('연결 테스트 중 오류가 발생했습니다: ' + error.message);
    }
}

// 로그 확인 함수
function showLogs() {
    const logInfo = {
        userAgent: navigator.userAgent,
        currentUrl: window.location.href,
        loginInfo: localStorage.getItem('redmineLoginInfo') ? '있음' : '없음',
        config: localStorage.getItem('redmineConfig') ? '있음' : '없음',
        isLoggedIn: sessionStorage.getItem('isLoggedIn'),
        timestamp: new Date().toISOString()
    };
    
    console.log('=== 현재 상태 정보 ===');
    console.log('로그 정보:', logInfo);
    
    // 로그 정보를 모달로 표시
    const modal = document.createElement('div');
    modal.className = 'modal fade show';
    modal.style.display = 'block';
    modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">로그 및 상태 정보</h5>
                    <button type="button" class="btn-close" onclick="this.closest('.modal').remove()"></button>
                </div>
                <div class="modal-body">
                    <h6>현재 상태:</h6>
                    <pre style="background: #f8f9fa; padding: 10px; border-radius: 5px; font-size: 12px;">${JSON.stringify(logInfo, null, 2)}</pre>
                    
                    <h6 class="mt-3">개발자 도구 확인 방법:</h6>
                    <ol>
                        <li>F12 키를 눌러 개발자 도구 열기</li>
                        <li>Console 탭 클릭</li>
                        <li>페이지 새로고침 후 로그 확인</li>
                        <li>Network 탭에서 API 요청 상태 확인</li>
                    </ol>
                    
                    <div class="alert alert-info mt-3">
                        <strong>중요:</strong> 상세한 로그는 브라우저 개발자 도구의 Console 탭에서 확인할 수 있습니다.
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">닫기</button>
                    <button type="button" class="btn btn-primary" onclick="openDevTools()">개발자 도구 열기</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

// 개발자 도구 열기 함수
function openDevTools() {
    alert('F12 키를 눌러 개발자 도구를 열고 Console 탭에서 상세한 로그를 확인하세요.');
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('redmineLoginInfo');
    localStorage.removeItem('redmineConfig');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}
