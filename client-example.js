// Remote Config 클라이언트 예제
const axios = require('axios');

class RemoteConfigClient {
  constructor(serverUrl = 'http://localhost:3001') {
    this.serverUrl = serverUrl;
    this.cache = {};
    this.cacheExpiry = 5 * 60 * 1000; // 5분
    this.lastFetch = 0;
  }

  // 모든 설정 가져오기
  async getConfigs(forceRefresh = false) {
    const now = Date.now();
    
    if (!forceRefresh && this.cache.configs && (now - this.lastFetch) < this.cacheExpiry) {
      console.log('캐시에서 설정 반환');
      return this.cache.configs;
    }

    try {
      const response = await axios.get(`${this.serverUrl}/api/client-config`);
      this.cache.configs = response.data;
      this.lastFetch = now;
      console.log('서버에서 설정 가져옴');
      return this.cache.configs;
    } catch (error) {
      console.error('설정 가져오기 오류:', error.message);
      // 캐시된 데이터가 있으면 반환
      if (this.cache.configs) {
        console.log('오류 발생, 캐시된 설정 반환');
        return this.cache.configs;
      }
      throw error;
    }
  }

  // 특정 설정 값 가져오기
  async getConfig(key, defaultValue = null) {
    try {
      const configs = await this.getConfigs();
      return configs[key] !== undefined ? configs[key] : defaultValue;
    } catch (error) {
      console.error(`설정 ${key} 가져오기 오류:`, error.message);
      return defaultValue;
    }
  }

  // 기능 플래그 확인
  async isFeatureEnabled(featureKey) {
    const enabled = await this.getConfig(featureKey, false);
    return Boolean(enabled);
  }
}

// 사용 예제
async function example() {
  const configClient = new RemoteConfigClient();

  try {
    // 모든 설정 가져오기
    const allConfigs = await configClient.getConfigs();
    console.log('모든 설정:', allConfigs);

    // 특정 설정 값 가져오기
    const maxUploadSize = await configClient.getConfig('max_upload_size', 1048576);
    console.log('최대 업로드 크기:', maxUploadSize);

    // 기능 플래그 확인
    const loginEnabled = await configClient.isFeatureEnabled('feature_login_enabled');
    console.log('로그인 기능 활성화:', loginEnabled);

    // 유지보수 모드 확인
    const maintenanceMode = await configClient.getConfig('maintenance_mode', false);
    if (maintenanceMode) {
      console.log('현재 유지보수 모드입니다.');
    } else {
      console.log('정상 운영 중입니다.');
    }

  } catch (error) {
    console.error('설정 사용 중 오류:', error.message);
  }
}

// 모듈 내보내기
module.exports = RemoteConfigClient;

// 직접 실행 시 예제 실행
if (require.main === module) {
  example();
} 