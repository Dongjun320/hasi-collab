# OpenAPI (Swagger) 가이드

- [OpenAPI (Swagger) 가이드](#openapi-swagger-가이드)
  - [구조](#구조)
    - [paths 서브디렉터리](#paths-서브디렉터리)
    - [components 서브디렉터리](#components-서브디렉터리)
    - [Bundling (파일 합치기)](#bundling-파일-합치기)
  - [OpenAPI 기초 문법](#openapi-기초-문법)
    - [`parameters` vs `requestBody`](#parameters-vs-requestbody)
    - [블록 재사용](#블록-재사용)
  - [코드 생성 및 사용](#코드-생성-및-사용)
    - [Spring 코드](#spring-코드)
    - [TypeScript 코드](#typescript-코드)


Design-First로 프로젝트 서비스(`/service`, `/messenger`)의 웹 API를 OpenAPI를 사용하여 설계 후 자동으로 
Spring Boot/TypeScript용 코드를 생성합니다. 

`/service`의 RESTful API의 경우 openapi 포맷, `/messenger`의 WebSocket/STOMP의 경우 asyncapi 형식을 사용합니다.

자세한 원문 내용 참고 원하시면:

- [How to split a large OpenAPI document into multiple files](https://blog.techdocs.studio/p/how-to-split-a-large-openapi-document)
- [OpenAPI Specification](https://swagger.io/specification/)

## 구조

`/docs/openapi/` 아래 OpenAPI 관련 파일들이 정리 될 예정입니다. 최상단의 `openapi.yaml` 파일을 여러 명이서 작업시 Git 작업 시 
merge conflict이 일어나므로 `paths/`와 `components/`에 원하는 파트 파일들을 만들어 작업할 수 있도록 했습니다. 

개별 파일 작업 후 `openapi.yaml`의 `paths`와 `component`에 추가해주세요.

### paths 서브디렉터리

HTTP API의 메서드에 관한 파일들을 저장(`GET`, `POST` 등).

### components 서브디렉터리

재사용 가능한 component들을 저장(Schema 등). HTTP Request/Response에 필요한 HTTP payload의 schema, 혹은 parameter를
저장하는데 사용하면 좋습니다.

### Bundling (파일 합치기)

연결된 OpenAPI 파일들을 하나의 publish할 파일로 합치는 것으로 [redocly](https://redocly.com/docs/cli/installation)를 사용합니다. 넣기는 했는데 저희는 안 쓸거 같습니다.

## OpenAPI 기초 문법

`paths`: API 메서드의 경로
  - `/{path-경로}`: `/api

Schema의 경우 해당 component가 어떤 변수 및 타입을 가지고 있는지를 결정하는 것이라 생각하면 됩니다.

### `parameters` vs `requestBody`

`parameters`의 경우 Request의 메타데이터나 outer shell 등에 붙는 데이터입니다. 
`in`에 따라 URL에 직접 붙을 수 있으며(`path`/`query`), HTTP 헤더(`header`), 또는 cookie jar(`cookie`)에 위치할 수 있습니다. 
모든 HTTP 메서드와 사용이 가능합니다.

```
parameters:
  - name: userId
    in: path
    required: true
    description: 유저 ID
    schema:
      type: string
```

`requestBody`의 경우 payload에 들어가는 내용으로 데이터를 생성/업데이트 하는 메서드에 사용됩니다. `POST`, `PUT`, `PATCH` 등에 사용되며
HTTP 스펙 상, `GET`은 Request Body를 포함하면 안 되며 방화벽에 막힐 가능성이 높습니다.

```
requestBody:
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              email:
                type: string
              password:
                type: string
```

### 블록 재사용

똑같은 내용을 여러 번 사용하여야 할 때 `$ref`를 사용 가능합니다.

예시:

```
responses:
  '200':
    description: 유효한 request에 대한 응답
    content:
      application/json:
        schema:
          $ref: "#/components/schemas/Message"
          
components:
  schemas:
    Message:
      type: object
      required:
        - id
        - type
      properties:
        id:
          type: integer
          format: int64
        tag:
          type: string
```

### 여러개의 path/component 있는 파일에서 하나 골라오기

한 파일에 여러 개의 HTTP 메서드, `content`(`requestBody`, `response` 아래) 사용할 payload의 schema
등을 설정할 수 있습니다. 그럴 경우, 하나의 엔드포인트 및 schema만을 선택하고 싶을시 파일명 뒤 `#`를 붙인 후 하위 태그를 `/`로 찾아가면 됩니다.

만약 엔드포인트를 지정할시, 파일 내 `/`가 디렉터리 경로를 표시하는 것과 겹치므로 `~1`로 바꿔주어야 합니다.

```yaml
# 상위 폴더의 components/AuthResponseBodies.yaml에서 components/schemas아래 있는 LogInResponse 블록을 가져옴
$ref: "../components/AuthResponseBodies.yaml#/components/schemas/LogInResponse"

# 현 폴더의 /paths/authEndpoints.yaml 에서 paths 태그 아래 있는 /api/auth/login 내용을 가져옴
$ref: "./paths/authEndpoints.yaml#/paths/~1api~1auth~1login"
```

컴파일 시 에러 날 경우 높은 확률로 OpenAPI에 구현 안 된 내용을 `$ref`로 불러 오려고 하는것 일테니 주석처리 혹은 구현 후 다시 컴파일 해보세요 

## 코드 생성 및 사용

OpenAPI 파일의 내용　수정 후 Java, TypeScript 코드를 생성 가능합니다.

Design-First 방식으로 API를 먼저 작성하여도, 백엔드 서비스별 구현이 다르면 Open API(Swagger)문서는 거짓말이 되고 클라이언트가 사용하기 힘드므로
DTO와 컨트롤러 인터페이스의 경우 자동생성된 코드를 사용하는 것이 Best Practice입니다(라고 들었어요).

참고하면 좋은 자료:

- Spring/Java 코드: [openapi-generator](https://openapi-generator.tech/docs/plugins)
- TS 코드: [openapi-typescript](https://openapi-ts.dev/introduction)

### Spring 코드

Spring의 경우 모듈별 pom.xml에 코드 생성 및 `src`에서의 인식을 위한 설정이 추가 되었습니다.

`/target`의 경우 `.gitignore`에 자동 추가 되어 Git에 push 되지 않습니다. Maven으로 빌드를 하셔야 됩니다.

`/service` 혹은 `/messenger` 위치에서 `./mvnw clean compile`을 실행하시면:

- `/service`: `/docs/openapi/openapi.yaml` 기반으로, `/service/target/generated-sources/openapi/src/`에 생성함. 해당 디렉터리 내:
  - `main/java/com.hasi.collab/api/`: 자동 생성된 Spring Controller 인터페이스 저장(Routing 레이어)
  - `main/java/com.hasi.collab/model/`: 자동 생성된 Data Transfer Objects(DTO) 저장(HTTP Request/Response 페이로드)
- `/messenger`: `/docs/openapi/serverAPIs/serviceToMessenger/openapi.yaml`(Service → Messenger 서버 간 REST) 기반으로,
  `/messenger/target/generated-sources/openapi/src/`에 생성함. 해당 디렉터리 내:
  - `main/java/com.hasi.messenger/api/`: 태그별 Controller 인터페이스 (`InternalMessageApi` 등)
  - `main/java/com.hasi.messenger/model/`: 자동 생성된 DTO
  - WebSocket/STOMP 쪽 asyncapi 생성(`/messenger/target/generated-sources/asyncapi/src`)은 아직 예정입니다.

자동생성된 코드는 `/src`에서 인식 되도록 했습니다. 사용하실 때는 사용할 Java 파일에서 `import` 하시면 됩니다.

```java
import com.hasi.collab.api.ApiApi; //  api/에 저장된 ApiApi Controller 사용
import com.hasi.collab.model.LogInRequest; // model에 저장된 LogInRequest DTO 사용
```

`/target`에 코드를 생성하고 이를 프로젝트에서 인식하게 한 방법의 경우 모듈별 pom.xml의 `execution`/`plugin`쪽 주석을 참고하시고
변경 필요하시면 해당 파일 구조 수정하시면 됩니다!

### TypeScript 코드

`openapi-typescript` + `openapi-fetch` 두 패키지를 함께 사용합니다.

| 패키지 | 역할 |
|---|---|
| `openapi-typescript` | `openapi.yaml` → `src/types/openapi.ts` 타입 자동 생성 |
| `openapi-fetch` | 생성된 타입 기반으로 API 호출 (타입 자동 적용) |

#### 설치

`/client` 위치에서 한 번만 실행하면 됩니다.

```bash
npm install
```

#### 타입 자동 생성

`npm run dev` 또는 `npm run build` 실행 시 타입 생성이 자동으로 먼저 실행됩니다.

수동으로 생성만 하고 싶을 때:

```bash
npm run generate:api
```

생성 위치: `client/src/types/openapi.ts` (자동 생성 파일 — 직접 수정 금지, `.gitignore` 처리됨)

#### API 호출 방법

`src/api/client.ts`에 `openapi-fetch` 인스턴스가 세팅되어 있습니다. JWT 토큰 자동 첨부, 401 자동 처리가 포함되어 있습니다.

**별도의 api 파일을 만들 필요 없이** store나 컴포넌트에서 바로 import해서 사용합니다.

```ts
import { api } from '../api/client'

// POST 요청
const { data, error } = await api.POST('/api/auth/login', {
  body: { id: 'user@example.com', password: '1234' }
})

// GET 요청
const { data, error } = await api.GET('/api/workspaces', {})

// GET 요청 — path parameter 있을 때
const { data, error } = await api.GET('/api/workspaces/{id}', {
  params: { path: { id: 1 } }
})
```

`body`, `params` 모두 `openapi.yaml`에 정의된 타입으로 자동 체크됩니다. 잘못된 필드를 넣으면 에디터에서 빨간 줄로 즉시 표시됩니다.

#### 새 API 추가 시 워크플로우

```
1. openapi.yaml에 새 엔드포인트 추가
        ↓
2. npm run dev 실행 (타입 자동 갱신)
        ↓
3. store 또는 컴포넌트에서 api.GET / api.POST 등으로 바로 호출
```

`openapi.yaml`이 수정될 때마다 `npm run dev`를 재실행하면 타입이 자동으로 갱신됩니다.