# Render 배포 가이드

이 문서는 Remote Config Pattern 애플리케이션을 Render에 배포하는 방법을 설명합니다.

## 🚀 Render 배포 단계별 가이드

### 1. Render 계정 생성
- [Render.com](https://render.com)에서 무료 계정 생성
- GitHub 계정으로 연결하는 것을 권장

### 2. PostgreSQL 데이터베이스 생성
1. Render 대시보드에서 "New +" 버튼 클릭
2. "PostgreSQL" 선택
3. 다음 설정 입력:
   - **Name**: `remote-config-db`
   - **Database**: `remote_config`
   - **User**: `postgres` (기본값)
   - **Region**: 가장 가까운 지역 선택
   - **Plan**: Free (무료)
4. "Create Database" 클릭
5. 생성 완료 후 **Connection Details** 정복사해두기

### 3. Web Service 생성
1. Render 대시보드에서 "New +" 버튼 클릭
2. "Web Service" 선택
3. GitHub 리포지토리 연결:
   - Repository: `https://github.com/wjb127/remote-config-node-app.git`
4. 다음 설정 입력:
   - **Name**: `remote-config-api`
   - **Environment**: `Node`
   - **Region**: 데이터베이스와 같은 지역
   - **Branch**: `master`
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`

### 4. 환경변수 설정
Web Service 설정에서 Environment Variables에 다음 값들 추가:

```bash
NODE_ENV=production
DB_HOST=[PostgreSQL의 External Database URL에서 호스트 부분]
DB_PORT=[PostgreSQL의 포트, 보통 5432]
DB_NAME=remote_config
DB_USER=[PostgreSQL의 Username]
DB_PASSWORD=[PostgreSQL의 Password]
```

**PostgreSQL Connection Details에서 복사할 정보:**
- **External Database URL**: `postgres://username:password@hostname:port/database`
- 이 URL을 파싱하여 각 환경변수에 입력

### 5. 배포 실행
1. "Create Web Service" 클릭
2. 자동으로 빌드 및 배포 시작
3. 배포 로그에서 데이터베이스 초기화 완료 확인

## 📋 배포 후 테스트

배포가 완료되면 Render에서 제공하는 URL을 통해 API 테스트:

```bash
# 배포된 URL 예시: https://remote-config-api.onrender.com

# 모든 설정 조회
curl https://remote-config-api.onrender.com/api/configs

# 클라이언트용 설정 조회
curl https://remote-config-api.onrender.com/api/client-config
```

## 🔧 환경변수 상세 설정

PostgreSQL Connection Details에서 다음과 같은 형태의 URL을 받게 됩니다:
```
postgres://username:password@hostname:port/database
```

이를 각 환경변수로 분리:
- **DB_HOST**: `hostname` 부분
- **DB_PORT**: `port` 부분 (보통 5432)
- **DB_NAME**: `database` 부분
- **DB_USER**: `username` 부분
- **DB_PASSWORD**: `password` 부분

## ⚠️ 주의사항

1. **무료 플랜 제한사항**:
   - 무료 플랜에서는 15분간 비활성 시 서비스가 sleep 상태가 됨
   - 첫 요청 시 cold start로 인해 응답이 느릴 수 있음

2. **데이터베이스 연결**:
   - PostgreSQL 데이터베이스가 완전히 생성된 후 Web Service 배포
   - 환경변수가 올바르게 설정되었는지 확인

3. **로그 확인**:
   - 배포 실패 시 Render 대시보드의 Logs 탭에서 오류 확인
   - 데이터베이스 초기화 로그 확인

## 🎯 성공 확인

배포가 성공하면:
1. Web Service 상태가 "Live" 표시
2. 제공된 URL에서 API 정상 응답
3. 데이터베이스에 샘플 데이터 자동 생성 완료 