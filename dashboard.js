// Redmine API 설정 클래스
class RedmineAPI {
    constructor() {
        this.config = this.loadConfig();
    }

    // 로컬 스토리지에서 설정 로드
    loadConfig() {
        // 로그인 정보에서 설정 로드
        const loginInfo = localStorage.getItem('redmineLoginInfo');
        if (loginInfo) {
            const login = JSON.parse(loginInfo);
            const config = {
                url: login.redmineUrl,
                username: login.username,
                password: login.password,
                projectId: ''
            };
            localStorage.setItem('redmineConfig', JSON.stringify(config));
            return config;
        }

        // 기본 설정
        return {
            url: 'https://pms.ati2000.co.kr',
            username: '',
            password: '',
            projectId: ''
        };
    }

    // 설정 저장
    saveConfig(url, apiKey, projectId) {
        this.config = { 
            url, 
            apiKey, 
            projectId,
            username: this.config.username || ''
        };
        localStorage.setItem('redmineConfig', JSON.stringify(this.config));
    }

    // API 요청을 위한 헬퍼 함수
    async request(endpoint, params = {}) {
        if (!this.config.username || !this.config.password) {
            throw new Error('로그인 정보가 없습니다.');
        }

        // URL 검증
        if (!this.isValidUrl(this.config.url)) {
            throw new Error('올바르지 않은 Redmine URL입니다.');
        }

        const queryString = new URLSearchParams(params).toString();
        const url = `${this.config.url}${endpoint}.json?${queryString}`;

        try {
            // Basic Auth를 사용한 요청
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + btoa(this.config.username + ':' + this.config.password),
                    'Content-Type': 'application/json'
                },
                // CORS 및 보안 설정
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('로그인 정보가 유효하지 않습니다.');
                } else if (response.status === 403) {
                    throw new Error('접근 권한이 없습니다.');
                } else if (response.status === 404) {
                    throw new Error('요청한 리소스를 찾을 수 없습니다.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            
            // CORS 오류인 경우 대안 방법 시도
            if (error.message.includes('Failed to fetch') || error.message.includes('CORS')) {
                return this.fallbackRequest(endpoint, params);
            }
            
            throw error;
        }
    }

    // CORS 오류 시 대안 요청 방법
    async fallbackRequest(endpoint, params = {}) {
        console.log('CORS 오류로 인해 대안 방법을 사용합니다.');
        
        // 실제 환경에서는 프록시 서버를 사용해야 함
        // 여기서는 데모용 데이터를 반환
        return this.getMockData(endpoint, params);
    }

    // 데모용 목 데이터
    getMockData(endpoint, params) {
        if (endpoint === '/projects') {
            return {
                projects: [
                    {
                        id: 1,
                        name: "ATI2000 메인 프로젝트",
                        identifier: "ati2000-main",
                        description: "ATI2000의 메인 개발 프로젝트"
                    },
                    {
                        id: 2,
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
                        subject: "대시보드 UI 개선",
                        project: { id: 1, name: "ATI2000 메인 프로젝트" },
                        status: { name: "진행중", is_closed: false },
                        updated_on: new Date().toISOString(),
                        due_date: null
                    },
                    {
                        id: 2,
                        subject: "API 연동 테스트",
                        project: { id: 2, name: "웹 대시보드" },
                        status: { name: "완료", is_closed: true },
                        updated_on: new Date(Date.now() - 86400000).toISOString(),
                        due_date: null
                    }
                ]
            };
        }
        
        return { projects: [], issues: [] };
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

    // 프로젝트 목록 조회
    async getProjects() {
        return await this.request('/projects', { limit: 100 });
    }

    // 이슈 목록 조회
    async getIssues(projectId = null, params = {}) {
        const endpoint = projectId ? `/projects/${projectId}/issues` : '/issues';
        return await this.request(endpoint, { limit: 100, ...params });
    }

    // 특정 프로젝트 상세 조회
    async getProject(projectId) {
        return await this.request(`/projects/${projectId}`);
    }

    // 현재 사용자 상세 조회
    async getCurrentUser() {
        return await this.request('/users/current');
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
        // 로그인 상태 확인
        if (!this.checkAuth()) {
            return;
        }

        // 사용자 정보 표시
        this.displayUserInfo();

        // 로그인 정보가 있는지 확인
        if (!this.api.config.username || !this.api.config.password) {
            // 로그인 페이지로 리다이렉트
            window.location.href = 'login.html';
            return;
        }

        await this.loadData();
        this.renderDashboard();
    }

    // 인증 상태 확인
    checkAuth() {
        const loginInfo = localStorage.getItem('redmineLoginInfo');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
        
        if (!loginInfo || !isLoggedIn) {
            // 로그인되지 않은 경우 로그인 페이지로 리다이렉트
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
        showLoading(true);
        try {
            // 프로젝트 목록 조회
            const projectsData = await this.api.getProjects();
            this.projects = projectsData.projects || [];

            // 이슈 목록 조회
            const issuesData = await this.api.getIssues(null, {
                status_id: '*'
            });
            this.issues = issuesData.issues || [];

            showLoading(false);
            
            // CORS 문제로 인해 데모 데이터를 사용하는 경우 알림
            if (this.projects.length > 0 && this.projects[0].name === "ATI2000 메인 프로젝트") {
                this.showCorsNotice();
            }
        } catch (error) {
            showLoading(false);
            alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        }
    }

    // CORS 문제 안내 표시
    showCorsNotice() {
        const notice = document.createElement('div');
        notice.className = 'alert alert-warning alert-dismissible fade show position-fixed';
        notice.style.cssText = 'top: 80px; right: 20px; z-index: 1050; max-width: 400px;';
        notice.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>
            <strong>CORS 제한으로 인해 데모 데이터를 표시합니다.</strong><br>
            <small>실제 데이터를 보려면 Redmine 서버에서 CORS를 허용하거나 프록시 서버를 사용해야 합니다.</small>
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
        
        // 최근 업데이트된 이슈들을 시간순으로 정렬
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

        // 상태별 이슈 개수 집계
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
        // 현재 로그인 정보 삭제
        localStorage.removeItem('redmineLoginInfo');
        localStorage.removeItem('redmineConfig');
        sessionStorage.removeItem('isLoggedIn');
        
        // 로그인 페이지로 이동
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
    // 필터 구현 (추후 확장 가능)
    console.log('Filter:', filter);
}

// 로딩 표시/숨김
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

// 로그아웃 함수
function logout() {
    localStorage.removeItem('redmineLoginInfo');
    localStorage.removeItem('redmineConfig');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}
