// Redmine 서버 연결 테스트 API
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
        const redmineUrl = process.env.REDMINE_URL || 'https://pms.ati2000.co.kr';
        
        console.log('Redmine 서버 연결 테스트 시작...');
        console.log('테스트 URL:', `${redmineUrl}/projects.json`);
        
        // Redmine 서버에 간단한 요청 테스트 (인증 없이)
        const response = await fetch(`${redmineUrl}/projects.json`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'ATI2000-Dashboard-Test/1.0'
            },
            // 타임아웃 설정 (10초)
            signal: AbortSignal.timeout(10000)
        });

        console.log('Redmine 서버 응답 상태:', response.status);
        console.log('Redmine 서버 응답 헤더:', Object.fromEntries(response.headers.entries()));

        if (response.ok) {
            const data = await response.json();
            res.status(200).json({
                success: true,
                message: 'Redmine 서버에 성공적으로 연결되었습니다.',
                redmineUrl: redmineUrl,
                responseStatus: response.status,
                dataKeys: Object.keys(data),
                sampleData: data.projects ? data.projects.slice(0, 2) : null
            });
        } else {
            const errorText = await response.text();
            res.status(200).json({
                success: false,
                message: `Redmine 서버 응답 오류 (${response.status})`,
                redmineUrl: redmineUrl,
                responseStatus: response.status,
                error: errorText.substring(0, 500) // 처음 500자만
            });
        }

    } catch (error) {
        console.error('Redmine 서버 테스트 실패:', error);
        
        res.status(200).json({
            success: false,
            message: 'Redmine 서버 연결 실패',
            redmineUrl: process.env.REDMINE_URL || 'https://pms.ati2000.co.kr',
            error: error.message,
            errorType: error.name,
            errorCode: error.code
        });
    }
}
