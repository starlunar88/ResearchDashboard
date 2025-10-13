// Redmine API 설정 클래스
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

    // 설정 저장 (로그인 방식만 사용)
    saveConfig(url, username, password, projectId = '') {
        this.config = { 
            url, 
            username, 
            password,
            projectId
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

        // 프록시 서버를 통한 API 요청
        const queryString = new URLSearchParams({
            endpoint: endpoint,
            ...params
        }).toString();
        
        const proxyUrl = `/api/redmine?${queryString}`;
        
        console.log('프록시 URL:', proxyUrl);
        console.log('요청 파라미터:', { endpoint, params });

        try {
            const response = await fetch(proxyUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa(this.config.username + ':' + this.config.password),
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('로그인 정보가 유효하지 않습니다.');
                } else if (response.status === 403) {
                    throw new Error('API 접근 권한이 없습니다.');
                } else if (response.status === 404) {
                    throw new Error('요청한 리소스를 찾을 수 없습니다.');
                }
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API 요청 실패:', error);
            throw error;
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
        // API 키가 설정되어 있는지 확인
        if (!this.api.config.apiKey) {
            showApiConfig();
            return;
        }

        await this.loadData();
        this.renderDashboard();
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

// API 설정 모달 표시
function showApiConfig() {
    const modal = new bootstrap.Modal(document.getElementById('apiConfigModal'));
    
    // 현재 설정 값 로드
    const config = dashboard.api.config;
    document.getElementById('redmineUrl').value = config.url;
    document.getElementById('apiKey').value = config.apiKey;
    
    modal.show();
}

// API 설정 저장
function saveApiConfig() {
    const url = document.getElementById('redmineUrl').value.trim();
    const apiKey = document.getElementById('apiKey').value.trim();
    const projectId = document.getElementById('projectId') ? document.getElementById('projectId').value.trim() : '';

    // 입력값 검증
    if (!url || !apiKey) {
        alert('Redmine URL과 API 키를 입력해주세요.');
        return;
    }

    // URL 형식 검증
    try {
        new URL(url);
    } catch (e) {
        alert('올바른 URL 형식을 입력해주세요. (예: https://pms.ati2000.co.kr)');
        return;
    }

    // API 키 형식 검증 (Redmine API 키는 보통 40자리 hex 문자열)
    if (apiKey.length < 20) {
        alert('API 키가 너무 짧습니다. 올바른 API 키를 입력해주세요.');
        return;
    }

    dashboard.api.saveConfig(url, apiKey, projectId);
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('apiConfigModal'));
    modal.hide();

    // 데이터 새로고침
    refreshData();
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