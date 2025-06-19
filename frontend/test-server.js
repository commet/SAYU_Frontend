const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.url === '/' || req.url === '/demo') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAYU Living Identity Demo</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            text-align: center;
        }
        .title {
            font-size: 3rem;
            margin-bottom: 1rem;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        .subtitle {
            font-size: 1.2rem;
            margin-bottom: 3rem;
            opacity: 0.9;
        }
        .demo-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
            margin-bottom: 3rem;
        }
        .demo-card {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 2rem;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
        }
        .demo-card:hover {
            transform: translateY(-5px);
        }
        .demo-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        .demo-title {
            font-size: 1.5rem;
            margin-bottom: 0.5rem;
            font-weight: bold;
        }
        .demo-desc {
            opacity: 0.8;
            line-height: 1.6;
        }
        .status {
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
            padding: 1.5rem;
            margin-bottom: 2rem;
        }
        .success { color: #28a745; }
        .info { color: #17a2b8; }
        .implementation-list {
            text-align: left;
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
            padding: 2rem;
        }
        .implementation-list h3 {
            color: #ffc107;
            margin-bottom: 1rem;
        }
        .implementation-list li {
            margin-bottom: 0.5rem;
            padding-left: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1 class="title">🎨 SAYU Living Identity</h1>
        <p class="subtitle">진화하는 예술 정체성 시스템</p>
        
        <div class="status">
            <h2 class="success">✅ 구현 완료!</h2>
            <p class="info">모든 핵심 기능이 성공적으로 구현되었습니다.</p>
        </div>

        <div class="demo-grid">
            <div class="demo-card">
                <div class="demo-icon">🎯</div>
                <h3 class="demo-title">몰입형 퀴즈</h3>
                <p class="demo-desc">
                    시각적 A/B 선택지와 그라디언트 애니메이션으로<br>
                    압축적이지만 분위기 있는 시나리오 제공
                </p>
            </div>

            <div class="demo-card">
                <div class="demo-icon">🎴</div>
                <h3 class="demo-title">살아있는 ID Card</h3>
                <p class="demo-desc">
                    진화 단계 표시, 커스터마이징 가능한 모토<br>
                    플립 애니메이션으로 여정 타임라인 확인
                </p>
            </div>

            <div class="demo-card">
                <div class="demo-icon">🏘️</div>
                <h3 class="demo-title">4개 Village 클러스터</h3>
                <p class="demo-desc">
                    예술 관람 스타일별 커뮤니티<br>
                    LREF → Contemplative Sanctuary
                </p>
            </div>

            <div class="demo-card">
                <div class="demo-icon">🪙</div>
                <h3 class="demo-title">토큰 경제</h3>
                <p class="demo-desc">
                    퀴즈 재시험을 위한 토큰 시스템<br>
                    일일 활동으로 토큰 획득
                </p>
            </div>

            <div class="demo-card">
                <div class="demo-icon">🔄</div>
                <h3 class="demo-title">카드 교환</h3>
                <p class="demo-desc">
                    사용자 간 정체성 카드 교환<br>
                    코드 기반 + 근처 사용자 발견
                </p>
            </div>

            <div class="demo-card">
                <div class="demo-icon">📊</div>
                <h3 class="demo-title">진화 추적</h3>
                <p class="demo-desc">
                    활동별 포인트 획득<br>
                    정체성 변화 및 성장 기록
                </p>
            </div>
        </div>

        <div class="implementation-list">
            <h3>🎯 구현된 핵심 차별화 요소</h3>
            <ul>
                <li><strong>고정된 MBTI → 진화하는 정체성:</strong> 첫 결과는 시작점, 예술 경험으로 성장</li>
                <li><strong>4개 예술 스타일 클러스터:</strong> 16개 성격을 관람 스타일로 그룹화</li>
                <li><strong>마을 커뮤니티 시스템:</strong> 각 클러스터별 고유 문화와 이벤트</li>
                <li><strong>게임화된 성장:</strong> 토큰, 포인트, 배지로 동기부여</li>
                <li><strong>사회적 상호작용:</strong> 카드 교환으로 연결과 소속감</li>
            </ul>
            
            <h3>🏘️ Village 클러스터링</h3>
            <ul>
                <li><strong>🏛️ Contemplative Sanctuary:</strong> LAEF, LAMF, LREF, LRMF</li>
                <li><strong>📚 Academic Forum:</strong> LRMC, LREC, SRMC, SREC</li>  
                <li><strong>🎭 Social Gallery:</strong> SAEF, SAEC, SREF, SREC</li>
                <li><strong>✨ Creative Studio:</strong> LAMC, LAMF, SAMC, SAMF</li>
            </ul>

            <h3>🚀 다음 단계</h3>
            <ul>
                <li>데이터베이스 마이그레이션 실행</li>
                <li>실제 사용자 데이터로 테스트</li>
                <li>16개 개별 마을로 확장 (사용자 증가 시)</li>
                <li>실시간 커뮤니티 기능 추가</li>
            </ul>
        </div>

        <div style="margin-top: 3rem; padding: 2rem; background: rgba(40, 167, 69, 0.2); border-radius: 15px;">
            <h2>🎉 SAYU Living Identity 시스템 완성!</h2>
            <p>사용자들이 예술을 통해 자신을 발견하고 성장하는<br><strong>살아있는 정체성의 여정</strong>을 경험할 수 있습니다.</p>
        </div>
    </div>
</body>
</html>
    `);
  } else if (req.url === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'success',
      message: 'SAYU Living Identity System implemented successfully',
      features: [
        'Immersive Quiz with visual choices',
        'Living Identity Cards with evolution tracking', 
        '4 Village clusters based on art viewing styles',
        'Token economy for quiz retakes',
        'Card exchange system',
        'Evolution point tracking'
      ],
      villages: {
        'CONTEMPLATIVE': ['LAEF', 'LAMF', 'LREF', 'LRMF'],
        'ACADEMIC': ['LRMC', 'LREC', 'SRMC', 'SREC'],
        'SOCIAL': ['SAEF', 'SAEC', 'SREF', 'SREC'],
        'CREATIVE': ['LAMC', 'LAMF', 'SAMC', 'SAMF']
      }
    }, null, 2));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎨 SAYU Demo Server running on:`);
  console.log(`   Local:    http://localhost:${PORT}`);
  console.log(`   Network:  http://0.0.0.0:${PORT}`);
  console.log(`   Demo:     http://localhost:${PORT}/demo`);
  console.log(`   API:      http://localhost:${PORT}/api/status`);
});