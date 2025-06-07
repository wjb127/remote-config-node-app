# Remote Config Pattern

Node.js와 PostgreSQL을 사용한 간단한 Remote Config 패턴 구현입니다.

## 기능

- 설정 값의 동적 관리 (CRUD)
- 타입별 설정 값 지원 (string, number, boolean)
- 클라이언트 캐싱 기능
- RESTful API

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. PostgreSQL 데이터베이스 생성:
```sql
CREATE DATABASE remote_config;
```

3. 환경변수 설정 (`.env` 파일 수정):
```
DB_HOST=localhost
DB_PORT=5432
DB_NAME=remote_config
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3000
```

4. 데이터베이스 초기화:
```bash
npm run init-db
```

5. 서버 실행:
```bash
npm start
# 또는 개발 모드
npm run dev
```

## API 엔드포인트

### 관리자용 API

- `GET /api/configs` - 모든 설정 조회
- `GET /api/configs/:key` - 특정 설정 조회
- `POST /api/configs` - 설정 생성
- `PUT /api/configs/:key` - 설정 수정
- `DELETE /api/configs/:key` - 설정 삭제

### 클라이언트용 API

- `GET /api/client-config` - 클라이언트용 설정 조회 (타입 변환 포함)

## 클라이언트 사용법

```javascript
const RemoteConfigClient = require('./client-example');

const configClient = new RemoteConfigClient('http://localhost:3000');

// 설정 값 가져오기
const maxSize = await configClient.getConfig('max_upload_size', 1048576);

// 기능 플래그 확인
const isEnabled = await configClient.isFeatureEnabled('feature_login_enabled');
```

## 예제 설정

초기 데이터베이스에는 다음과 같은 예제 설정이 포함됩니다:

- `feature_login_enabled`: 로그인 기능 활성화 (boolean)
- `max_upload_size`: 최대 업로드 크기 (number)
- `app_version`: 앱 버전 (string)
- `maintenance_mode`: 유지보수 모드 (boolean)
- `api_timeout`: API 타임아웃 (number)

## 테스트

클라이언트 예제 실행:
```bash
node client-example.js
``` 