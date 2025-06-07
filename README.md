# Remote Config Pattern

Node.js와 PostgreSQL을 사용한 간단한 Remote Config 패턴 구현입니다.

## 기능

- 설정 값의 동적 관리 (CRUD)
- 타입별 설정 값 지원 (string, number, boolean)
- 클라이언트 캐싱 기능
- RESTful API
- Docker 및 Docker Compose 지원

## 🚀 빠른 시작 (Docker 권장)

### Docker Compose 사용

```bash
# 리포지토리 클론
git clone https://github.com/wjb127/remote-config-node-app.git
cd remote-config-node-app

# Docker Compose로 실행
docker-compose up --build
```

이제 다음 URL에서 API에 접근할 수 있습니다:
- **API 베이스 URL**: http://localhost:3001
- **클라이언트 설정**: http://localhost:3001/api/client-config

### 로컬 개발 환경

1. 의존성 설치:
```bash
npm install
```

2. PostgreSQL 데이터베이스 생성:
```sql
CREATE DATABASE remote_config;
```

3. 환경변수 설정:
```bash
cp .env.example .env
# .env 파일을 수정하여 데이터베이스 연결 정보 입력
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

const configClient = new RemoteConfigClient('http://localhost:3001');

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

### API 테스트

```bash
# 모든 설정 조회
curl http://localhost:3001/api/configs

# 클라이언트용 설정 조회
curl http://localhost:3001/api/client-config

# 새 설정 생성
curl -X POST -H "Content-Type: application/json" \
  -d '{"key": "new_feature", "value": "true", "description": "새 기능", "type": "boolean"}' \
  http://localhost:3001/api/configs
```

### 클라이언트 예제 실행

```bash
node client-example.js
```

## Docker 명령어

```bash
# 백그라운드에서 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 컨테이너 중지
docker-compose down

# 볼륨과 함께 완전 정리
docker-compose down -v
```

## 환경변수

| 변수명 | 기본값 | 설명 |
|--------|--------|------|
| DB_HOST | localhost | 데이터베이스 호스트 |
| DB_PORT | 5432 | 데이터베이스 포트 |
| DB_NAME | remote_config | 데이터베이스 이름 |
| DB_USER | postgres | 데이터베이스 사용자 |
| DB_PASSWORD | password | 데이터베이스 비밀번호 |
| PORT | 3001 | 애플리케이션 포트 |

## 기술 스택

- **Backend**: Node.js + Express
- **Database**: PostgreSQL
- **Client**: Axios (HTTP 클라이언트)
- **Containerization**: Docker + Docker Compose

## 라이센스

MIT 