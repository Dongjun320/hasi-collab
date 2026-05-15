# 개발 REAMDE

- [개발 REAMDE](#개발-reamde)
  - [디렉터리 구조](#디렉터리-구조)
  - [백엔드 설정/Dependency 설명](#백엔드-설정dependency-설명)
  - [프로젝트 구조](#프로젝트-구조)

배포 전까지 가이드로 사용할 README입니다. 프로젝트 구조, 공유/공지사항, 기타 필요한 내용을 적어주시기 바랍니다. 배포 시 `README.ja.md`를 `README.md`로 변경 후 상단 다국어 부분 수정 바랍니다.

## 디렉터리 구조

[draw.io 구조도](https://app.diagrams.net/#G1COs3ki7hNw0kXD8R9KgHeJLCuKDZ_73y#%7B%22pageId%22%3A%226SzYYcsKjpKCU_VJULNv%22%7D)(구글 로그인하기)

Mono Repo에 /client, /service, /messenger로 나눴습니다.

`/client`: 프론트엔드. React 기반.

`/service`: 메인 백엔드. 유저 인증, JWT/Refresh Token 생성, 

`/messenger`: 메신저 서비스. STOMP를 받고 authorization 등 확인 후 통신 설정

PostgreSQL DB, Redis 등은 Docker 형태로 Railway에서 시작할 생각입니다. JPA 등을 이용해서 PostgreSQL 초기화 예정입니다.

## 백엔드 설정/Dependency 설명

[Spring Initializr](https://start.spring.io/)로 템플릿 생성했습니다. 프로젝트별 사용된 dependency는 `pom.xml`을 참고해주세요

백엔드 코드는 `<백엔드>/src/main/java/<group 이름>/<package 이름>`에 있습니다. 지저분하긴 하지만 Spring Boot 방식이고 IDE에서 자동으로 collapse 해 줍니다!

설정:

- Java 25(LTS): 가장 최신 버전의 Java LTS입니다.
- Maven: 프로젝트가 작으므로 Gradle을 쓸 필요 없이 간단하게
- Group명: com.hasi로 했습니다.
- Package명: 각각 service, messenger입니다.

공통 Dependencies:

- Spring Web: RESTful, Spring MVC 기반 웹앱 생성 
- Spring Security: Authentication & Authorization 관리. (비밀번호 Hashing/Salting 등 포함)
- OAuth2 Resource Server: JWT 확인/관리
- Spring Data Redis (Access+Driver): Redis 연결에 사용
- SpringDoc OpenAPI: API 문서화
- Lombok: 보일러플레이트 최소화(e.g, Getter, Setter 등 자동설정)
- Validation: Hibernate Validator.
- Spring Data JPA: Spring Data + Hibernate를 사용하여 SQL DB에 데이터 저장(JDBC-SQL 쿼리 직접 쓰기/JPA-Java Class를 @Entity해서 생성)
- PostgreSQL Driver: PostgreSQL 연결에 사용

`/messenger` Dependencies:

- WebSocket: SockJS와 STOMP 이용한 WebSocket 앱 만들기

기타:

- JUnit: Java의 테스팅 suite. 기본적으로 포함됨.

## 프로젝트 구조

## 초기 세팅 사항
hasi-collab 초기 세팅 안내
처음 시작하는 법
1. 저장소 클론

git clone [저장소 주소]
cd hasi-collab
2. Docker 실행 (PostgreSQL + Redis)

docker compose up -d
3. 프론트엔드 의존성 설치

cd client
npm install
개발 시작하는 법
프론트엔드만 작업할 때 (UI 작업)

cd client
npm run dev
→ Docker, Spring Boot 안 켜도 됩니다. 더미 데이터로 UI 개발 가능합니다.
→ 브라우저에서 http://localhost:5173 접속

백엔드 작업하거나 API 연동할 때

# 1. Docker 먼저 켜기
docker compose up -d

# 2. IntelliJ에서 ServiceApplication 또는 MessengerApplication 실행
개발 환경 포트 정리
서비스	포트
프론트엔드 (Vite)	5173
백엔드 (service)	8080
메신저 (messenger)	8081
PostgreSQL	5432
Redis	6379

