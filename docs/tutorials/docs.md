# 문서화 튜토리얼

- [문서화 튜토리얼](#문서화-튜토리얼)
  - [JavaDoc/TSDoc](#javadoctsdoc)
  - [문서 만들기](#문서-만들기)

## JavaDoc/TSDoc

JavaDoc와 TSDoc는 주석을 따라 자동으로 문서를 만들어 주는 라이브러리입니다.

`/**`로 시작해 `*/`로 끝납니다.

```java
```

## 문서 만들기

`./mvnw javadoc:javadoc`를 돌리면 `/target/reports/apidocs/`에 JavaDoc 웹 문서가 생성되며 `index.html`을 Live server 등으로 실행하시면 됩니다.

또한 IDE의 경우 호버링할 경우 마우스 옆에 JavaDoc 주석 내용이 뜹니다.

