# Render 배포 가이드

이 문서는 Remote Config Pattern 애플리케이션을 Render에 배포하는 방법을 설명합니다.

## 🚀 Render 배포 단계별 가이드 (수동 배포 권장)

### 1. Render 계정 생성
- [Render.com](https://render.com)에서 무료 계정 생성
- GitHub 계정으로 연결하는 것을 권장

### 2. PostgreSQL 데이터베이스 생성 (먼저 생성!)
1. Render 대시보드에서 **"New +"** 버튼 클릭
2. **"PostgreSQL"** 선택
3. 다음 설정 입력:
   - **Name**: `remote-config-db`
   - **Database**: `remote_config` (자동 생성됨)
   - **User**: 자동 생성됨 (예: `remote_config_user`)
   - **Region**: 가장 가까운 지역 선택 (예: `Oregon (US West)`)
   - **PostgreSQL Version**: 기본값 사용
   - **Plan**: **Free** (무료) 선택
4. **"Create Database"** 클릭
5. 생성 완료까지 **2-3분 대기**
6. 생성 완료 후 **"Connect" 탭**에서 **External Database URL** 복사

**External Database URL 예시:**
```
postgres://remote_config_user:aBc123XyZ@dpg-abc123-a.oregon-postgres.render.com:5432/remote_config_abc
```

### 3. Web Service 생성
1. Render 대시보드에서 **"New +"** 버튼 클릭
2. **"Web Service"** 선택
3. **"Connect a repository"** 클릭
4. GitHub 리포지토리 선택:
   - Repository: `https://github.com/wjb127/remote-config-node-app.git`
5. 다음 설정 입력:
   - **Name**: `remote-config-api`
   - **Environment**: **Node**
   - **Region**: **데이터베이스와 같은 지역** (매우 중요!)
   - **Branch**: `master`
   - **Root Directory**: 비어두기 (기본값)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Plan**: **Free** (무료)

### 4. 환경변수 설정 (가장 중요!)
Web Service 설정 화면에서 **"Environment Variables"** 섹션에 다음 변수들 추가:

#### 4-1. External Database URL 파싱
PostgreSQL에서 복사한 URL을 분리:
```
postgres://username:password@hostname:port/database
```

#### 4-2. 환경변수 입력
| Key | Value | 예시 |
|-----|--------|------|
| `NODE_ENV` | `production` | production |
| `DB_HOST` | hostname 부분 | `dpg-abc123-a.oregon-postgres.render.com` |
| `DB_PORT` | `5432` | 5432 |
| `DB_NAME` | database 부분 | `remote_config_abc` |
| `DB_USER` | username 부분 | `remote_config_user` |
| `DB_PASSWORD` | password 부분 | `aBc123XyZ` |

### 5. 배포 실행
1. **"Create Web Service"** 클릭
2. 자동으로 빌드 및 배포 시작 (5-10분 소요)
3. **"Logs"** 탭에서 배포 진행상황 확인
4. 다음 로그가 나타나면 성공:
   ```
   데이터베이스 연결 시도 중...
   데이터베이스 초기화 완료!
   서버가 http://0.0.0.0:10000 에서 실행 중입니다.
   ```

## 📋 배포 후 테스트

배포가 완료되면 Render에서 제공하는 URL로 API 테스트:

```bash
# 배포된 URL 확인 (Render 대시보드에서)
# 예시: https://remote-config-api.onrender.com

# 클라이언트용 설정 조회 (추천)
curl https://your-app-name.onrender.com/api/client-config

# 모든 설정 조회
curl https://your-app-name.onrender.com/api/configs
```

**예상 응답:**
```json
{
  "feature_login_enabled": true,
  "max_upload_size": 10485760,
  "app_version": "1.0.0",
  "maintenance_mode": false,
  "api_timeout": 30000
}
```

## 🔧 환경변수 파싱 상세 가이드

### PostgreSQL Connection URL 예시
```
postgres://remote_config_user:p4ssW0rd123@dpg-xyz789-a.oregon-postgres.render.com:5432/remote_config_xyz
```

### 환경변수 분리
- **DB_HOST**: `dpg-xyz789-a.oregon-postgres.render.com`
- **DB_PORT**: `5432`
- **DB_NAME**: `remote_config_xyz`
- **DB_USER**: `remote_config_user`
- **DB_PASSWORD**: `p4ssW0rd123`

## ⚠️ 중요한 주의사항

### 1. **배포 순서**
1. ✅ PostgreSQL 데이터베이스 **먼저** 생성
2. ✅ 데이터베이스 생성 완료 확인 (Live 상태)
3. ✅ Connection Details 복사
4. ✅ **같은 Region**에 Web Service 생성
5. ✅ 환경변수 정확히 입력

### 2. **무료 플랜 제한사항**
- **Sleep 모드**: 15분간 비활성 시 서비스가 sleep 상태
- **Cold Start**: 첫 요청 시 30초 정도 응답 지연 가능
- **월 사용량**: 750시간 무료 (연속 운영 시 한계 있음)

### 3. **일반적인 오류 해결**

#### 연결 오류
```
Error: connect ECONNREFUSED
```
**해결방법**: 환경변수 재확인, 특히 DB_HOST와 DB_PASSWORD

#### 데이터베이스 권한 오류
```
Error: password authentication failed
```
**해결방법**: DB_USER와 DB_PASSWORD 정확한지 확인

#### 포트 오류
```
Error: listen EADDRINUSE
```
**해결방법**: 환경변수에서 PORT 설정 제거 (Render가 자동 할당)

### 4. **배포 성공 확인**
1. ✅ Web Service 상태: **"Live"** 표시
2. ✅ API 응답: 정상 JSON 데이터
3. ✅ 로그: "서버가 실행 중입니다" 메시지

## 🛠️ 트러블슈팅

### 배포 실패 시
1. **Logs 탭** 확인
2. **Environment Variables** 재확인
3. **Database 상태** 확인 (Live인지)
4. **Region** 일치 여부 확인

### render.yaml 파일 관련
- ❌ **render.yaml 사용하지 마세요** (설정 충돌 가능)
- ✅ **수동 설정**이 더 안전하고 확실합니다

이 가이드를 따르면 성공적으로 배포할 수 있습니다! 🎯 