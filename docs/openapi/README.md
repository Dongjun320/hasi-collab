# OpenAPI (Swagger) 가이드

- [OpenAPI (Swagger) 가이드](#openapi-swagger-가이드)
  - [구조](#구조)
    - [paths 서브디렉터리](#paths-서브디렉터리)
    - [components 서브디렉터리](#components-서브디렉터리)
    - [Bundling (파일 합치기)](#bundling-파일-합치기)
  - [OpenAPI 기초 문법](#openapi-기초-문법)
    - [블록 재사용](#블록-재사용)
  - [코드 생성](#코드-생성)


웹 API를 OpenAPI를 사용하여 설계 후 

자세한 원문 내용 참고 원하시면:

- [How to split a large OpenAPI document into multiple files](https://blog.techdocs.studio/p/how-to-split-a-large-openapi-document)
- [OpenAPI Specification](https://swagger.io/specification/)

## 구조

`/docs/openapi/` 아래 OpenAPI 관련 파일들이 정리 될 예정입니다. 최상단의 `openapi.yaml` 파일을 여러 명이서 작업시 Git 작업 시 
merge conflict이 일어나므로 `paths/`와 `components/`에 원하는 파트 파일들을 만들어 작업할 수 있도록 했습니다. 

개별 파일 작업 후 `openapi.yaml`의 `paths`와 `component`에 추가해주세요.

### paths 서브디렉터리

HTTP API의 메서드에 관한 파일들을 저장(`GET`, `POST` 등)

### components 서브디렉터리

재사용 가능한 component들을 저장(Schema 등).

### Bundling (파일 합치기)

연결된 OpenAPI 파일들을 하나의 publish할 파일로 합치는 것으로 [redocly](https://redocly.com/docs/cli/installation)를 사용합니다.

## OpenAPI 기초 문법

`paths`: API 메서드의 경로
  - `/{path-경로}`: `/api

Schema의 경우 해당 component가 어떤 변수 및 타입을 가지고 있는지를 결정하는 것이라 생각하면 됩니다.

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

## 코드 생성

OpenAPI 파일의 내용이 수정 될 때마다 Java, TypeScript 코드를 생성 가능합니다.

TS의 경우(npm 설치 필요):

```bash
npx openapi-typescript ./path/to/my/schema.yaml -o ./path/to/my/schema.d.ts
```

앞이 schema, `-o` 뒤가 아웃풋 파일

참고자료:

- Spring/Java 코드: [https://openapi-generator.tech/docs/plugins/](https://openapi-generator.tech/docs/plugins/)
- TS 코드: [openapi-typescript](https://openapi-ts.dev/introduction)
