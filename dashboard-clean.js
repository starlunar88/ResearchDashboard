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

    // API 요청
    async request(endpoint, params = {}) {
        if (!this.config.username || !this.config.password) {
            throw new Error('로그인 정보가 없습니다.');
        }

        // CORS 문제로 인해 일단 데모 데이터 사용
        console.log('CORS 제한으로 인해 데모 데이터를 사용합니다.');
        return this.getMockData(endpoint, params);

        // 실제 API 호출 (CORS 문제 해결 후 사용)
        /*
        const queryString = new URLSearchParams(params).toString();
        const url = `${this.config.url}${endpoint}.json?${queryString}`;

        try {
            const response = await fetch(url, {
                headers: {
                    'Authorization': 'Basic ' + btoa(this.config.username + ':' + this.config.password),
                    'Content-Type': 'application/json'
                },
                mode: 'cors',
                credentials: 'include'
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('로그인 정보가 유효하지 않습니다.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            return this.getMockData(endpoint, params);
        }
        */
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
        // 로그인 상태 확인
        if (!this.checkAuth()) {
            return;
        }

        // 사용자 정보 표시
        this.displayUserInfo();

        // 로그인 정보가 있는지 확인
        if (!this.api.config.username || !this.api.config.password) {
            alert('로그인 정보가 없습니다. 로그인 페이지로 이동합니다.');
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
            const projectsData = await this.api.getProjects();
            this.projects = projectsData.projects || [];

            const issuesData = await this.api.getIssues(null, {
                status_id: '*'
            });
            this.issues = issuesData.issues || [];

            showLoading(false);
        } catch (error) {
            showLoading(false);
            alert('데이터를 불러오는 중 오류가 발생했습니다: ' + error.message);
        }
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

// 로그아웃 함수
function logout() {
    localStorage.removeItem('redmineLoginInfo');
    localStorage.removeItem('redmineConfig');
    sessionStorage.removeItem('isLoggedIn');
    window.location.href = 'login.html';
}
