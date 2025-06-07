const pool = require('./database');

async function initDatabase() {
  let retries = 5;
  
  while (retries > 0) {
    try {
      console.log('데이터베이스 연결 시도 중...');
      
      // 테이블 생성
      await pool.query(`
        CREATE TABLE IF NOT EXISTS configs (
          id SERIAL PRIMARY KEY,
          key VARCHAR(255) UNIQUE NOT NULL,
          value TEXT NOT NULL,
          description TEXT,
          type VARCHAR(50) DEFAULT 'string',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // 샘플 데이터 추가
      const sampleConfigs = [
        { key: 'feature_login_enabled', value: 'true', description: '로그인 기능 활성화', type: 'boolean' },
        { key: 'max_upload_size', value: '10485760', description: '최대 업로드 크기 (bytes)', type: 'number' },
        { key: 'app_version', value: '1.0.0', description: '앱 버전', type: 'string' },
        { key: 'maintenance_mode', value: 'false', description: '유지보수 모드', type: 'boolean' },
        { key: 'api_timeout', value: '30000', description: 'API 타임아웃 (ms)', type: 'number' }
      ];

      for (const config of sampleConfigs) {
        await pool.query(
          'INSERT INTO configs (key, value, description, type) VALUES ($1, $2, $3, $4) ON CONFLICT (key) DO NOTHING',
          [config.key, config.value, config.description, config.type]
        );
      }

      console.log('데이터베이스 초기화 완료!');
      break;
    } catch (error) {
      console.error(`데이터베이스 초기화 중 오류 (${retries}번 남음):`, error.message);
      retries--;
      
      if (retries === 0) {
        console.error('데이터베이스 초기화 실패');
        process.exit(1);
      }
      
      // 5초 대기 후 재시도
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  
  pool.end();
}

// 즉시 실행하지 않고 모듈로 내보내기
if (require.main === module) {
  initDatabase();
}

module.exports = initDatabase; 