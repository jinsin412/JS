# Pet Commerce Project

## Project Structure

```
- src/
  - components/
  - styles/
  - utils/
- public/
  - images/
- tests/
- package.json
- README.md
```

- **src/**: Contains the main application code
  - **components/**: React components used in the application.
  - **styles/**: CSS and style files.
  - **utils/**: Utility functions and helpers.

- **public/**: Static files served by the application.
  - **images/**: All image assets used in the app.

- **tests/**: Test cases for the application.

## Setup Instructions

To set up the Pet Commerce project locally, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/jinsin412/JS.git
   cd JS
   ```

2. Install the dependencies:
   ```bash
   npm install
   ```

3. Start the application:
   ```bash
   npm start
   ```

The application should now be running at `http://localhost:3000`. 

## API Endpoints

### Products
- **GET /api/products**: Retrieve a list of all products.
- **POST /api/products**: Create a new product.
- **GET /api/products/{id}**: Retrieve information about a specific product.
- **PUT /api/products/{id}**: Update a specific product.
- **DELETE /api/products/{id}**: Delete a specific product.

### Hospitals
- **GET /api/hospitals**: Retrieve a list of all hospitals.
- **POST /api/hospitals**: Create a new hospital.
- **GET /api/hospitals/{id}**: Retrieve information about a specific hospital.
- **PUT /api/hospitals/{id}**: Update a specific hospital.
- **DELETE /api/hospitals/{id}**: Delete a specific hospital.

### Funeral Services
- **GET /api/funeral-services**: Retrieve a list of all funeral services.
- **POST /api/funeral-services**: Create a new funeral service.
- **GET /api/funeral-services/{id}**: Retrieve information about a specific funeral service.
- **PUT /api/funeral-services/{id}**: Update a specific funeral service.
- **DELETE /api/funeral-services/{id}**: Delete a specific funeral service.

---

## Claude 사용량 대시보드

Claude API 사용량을 실시간으로 모니터링할 수 있는 대시보드입니다.

### 빠른 시작

```bash
# 1. 백엔드 디렉터리로 이동
cd backend

# 2. 환경 변수 설정
cp .env.example .env
# .env 파일을 열어 ANTHROPIC_API_KEY 값을 입력하세요

# 3. 의존성 설치 (최초 1회)
npm install

# 4. 서버 실행
npm start
# 또는 파일 변경 감지 모드
npm run dev
```

```bash
# 5. 브라우저에서 대시보드 열기
open frontend/dashboard.html
```

### 대시보드 기능

| 기능 | 설명 |
|------|------|
| 요약 카드 | 총 요청 수 · 입력 토큰 · 출력 토큰 · 예상 비용 |
| 토큰 차트 | 최근 20건의 입출력 토큰 막대 그래프 |
| 테스트 패널 | 모델 선택 후 Claude에 직접 메시지 전송 |
| 최근 호출 | 타임스탬프, 토큰 수, 비용, 응답 시간 목록 |
| 실시간 업데이트 | SSE(Server-Sent Events)로 새 요청 즉시 반영 |

### 대시보드 API

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/claude/chat` | Claude 호출 및 사용량 기록 |
| `GET`  | `/api/usage` | 누적 사용량 JSON |
| `GET`  | `/api/usage/events` | SSE 실시간 스트림 |
| `POST` | `/api/usage/reset` | 사용량 데이터 초기화 |

### 비용 계산 기준 (claude-opus-4-6)

- 입력 토큰: $5.00 / 1M
- 출력 토큰: $25.00 / 1M

---
