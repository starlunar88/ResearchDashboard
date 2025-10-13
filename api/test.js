// 테스트용 API 엔드포인트
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
        res.status(200).json({
            message: 'API 서버가 정상적으로 작동합니다!',
            timestamp: new Date().toISOString(),
            method: req.method,
            query: req.query
        });
    } catch (error) {
        console.error('Test API error:', error);
        res.status(500).json({ 
            error: '서버 내부 오류가 발생했습니다.',
            details: error.message
        });
    }
}
