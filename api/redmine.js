// Vercel API Route - Redmine 프록시 서버
export default async function handler(req, res) {
    // CORS 헤더 설정
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // OPTIONS 요청 처리 (preflight)
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // GET 요청만 허용
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        const { endpoint, ...queryParams } = req.query;
        
        // 필수 파라미터 검증
        if (!endpoint) {
            res.status(400).json({ error: 'Endpoint is required' });
            return;
        }

        // 인증 정보 추출
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Basic ')) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }

        // Redmine 서버 URL (환경변수 또는 기본값)
        const redmineUrl = process.env.REDMINE_URL || 'https://pms.ati2000.co.kr';
        
        // 쿼리 파라미터 구성
        const queryString = new URLSearchParams(queryParams).toString();
        const targetUrl = `${redmineUrl}${endpoint}.json?${queryString}`;

        console.log('Proxying request to:', targetUrl);

        // Redmine API로 프록시 요청
        const response = await fetch(targetUrl, {
            method: 'GET',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'User-Agent': 'ATI2000-Dashboard/1.0'
            },
            // 타임아웃 설정 (30초)
            signal: AbortSignal.timeout(30000)
        });

        // 응답 상태 확인
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Redmine API error:', response.status, errorText);
            
            if (response.status === 401) {
                res.status(401).json({ error: '인증 실패: 사용자명 또는 비밀번호가 올바르지 않습니다.' });
            } else if (response.status === 403) {
                res.status(403).json({ error: '접근 권한이 없습니다.' });
            } else if (response.status === 404) {
                res.status(404).json({ error: '요청한 리소스를 찾을 수 없습니다.' });
            } else {
                res.status(response.status).json({ 
                    error: `Redmine API 오류 (${response.status})`,
                    details: errorText
                });
            }
            return;
        }

        // JSON 응답 파싱 및 반환
        const data = await response.json();
        res.status(200).json(data);

    } catch (error) {
        console.error('Proxy error:', error);
        
        if (error.name === 'AbortError') {
            res.status(408).json({ error: '요청 시간이 초과되었습니다.' });
        } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
            res.status(503).json({ error: 'Redmine 서버에 연결할 수 없습니다.' });
        } else {
            res.status(500).json({ 
                error: '서버 내부 오류가 발생했습니다.',
                details: error.message
            });
        }
    }
}
