# docker 튜토리얼

- [docker 튜토리얼](#docker-튜토리얼)
  - [Docker란](#docker란)
  - [꼭 알아야 할 커맨드](#꼭-알아야-할-커맨드)
    - [Docker로 이미지 실행하기](#docker로-이미지-실행하기)
    - [Docker Volume에 대해서](#docker-volume에-대해서)
  - [Docker Compose 파일 작성하기](#docker-compose-파일-작성하기)
    - [Docker Compose 볼륨 관리](#docker-compose-볼륨-관리)

Docker에 대해 자세히 알고 싶다면 [Docker 공식 Docs](https://docs.docker.com/get-started/)를 참고 바랍니다.

## Docker란

Docker는 컨테이너라는 독립적인 환경에서 앱을 돌립니다. Dependency나 기타 개발환경을 같이 패키징 해 컨테이너를 공유하는 것으로 같은 환경에서 작업할 수 있게 해줍니다.

예를 들어, Linux에서는 되는데 맥이나 윈도우 에서는 안 돌아가거나, 서로 다른 Java, PostgreSQL, Python을 사용 중이라거나 하는걸 복잡한 세팅없이 컨테이너를 공유하는 것 만으로 해결 가능합니다.

Docker Engine은 커맨드 라인 툴, Docker Desktop은 많이 쓰이는 기능들을 쉽게 사용할 수 있게 해준 GUI입니다.

## 꼭 알아야 할 커맨드

- `docker ps`: 현재 돌아가는 docker 컨테이너 확인.
  - `-a`: 작동 안하고 stop 상태의 컨테이너도 표시
- `docker run <이미지-url>`: 이미지로부터 컨테이너 시작. `docker run`의 경우 플래그가 많아 [별도 정리](#docker로-이미지-실행하기).
- `docker stop <컨테이너 id | 이름>`: 해당 컨테이너 종료
- `docker kill <pid>`: 해당 컨테이너 강제정료
- `docker rm <컨테이너 id | 이름>`: 해당 컨테이너 삭제
  - `rm -f`: 작동중이어도 강제종류 후 삭제

Docker compose는 이러한 명령어들을 모아서 스크립트로 정리해 둔 것입니다.

- `docker compose up -d`: `docker-compose.yml`등이 커맨드를 돌리는 디렉터리에 정의 되어 있다면, 해당 스크립트를 실행. `-d` 플래그 없이 사용시, 터미널 종료 시 컨테이너도 종료됨.
- `docker compose down`: 위와 마친가지이지만 반대로 종료.
  - `-v`: 추가시, 생성된 named/anonymous volume도 제거. Bind volume(Docker가 관리 안하는 일반 디렉터리)의 경우 유지.

### Docker로 이미지 실행하기

Docker 사용시 컨테이너를 생성 및 공유하는데, 이를 Docker 이미지 파일이라 합니다. 

- `-d`: 벡그라운드 실행.
- `-p <host>:<container>`: 포트지정. 예를 들어, `p 8080:8081`하면, host에서 `8080` 포트로 접속해 container는 `8081`포트에서 listening함
- `-e`: 환경 변수 설정
- `--name <컨테이너 이름>`: 컨테이너 ID 대신 보기 쉬운 이름으로 관리 가능
- `-v <볼륨>`: 볼륨 생성. 자세한 내용은 [Docker Volume](#docker-volume에-대해서).

이를 하나의 명령어에서 한 번에 실행하곤 합니다(`\`의 경우 Bash에서 보기 편하도록 줄바꾸기 하는 것으로 의미 x):

```bash
docker run -d \
  --name hasi-postgres \
  -p 5432:5432 \
  -e POSTGRES_PASSWORD=secret \
  -v postgres-data:/var/lib/postgresql/data \
  postgres:15-alpine
```

### Docker Volume에 대해서

Docker에서 Volume이란 컨터이너의 output 등을 디스크에 저장하는 저장공간입니다.

3가지 종류로 나뉩니다.

1. Anonymous Volume: 랜덤ID로 생성, `down -v`로 삭제
  ```bash
  -v /var/lib/postgresql/data
  ```

1. Named Volume: Docker가 관리하는 volume. 리눅스의 경우 `/var/lib/docker/volumes/<host-이름>`에 저장. `down -v`로 삭제됨
  ```bash
  -v postgres-data:/var/lib/postgresql/data
  ```

  `:` 이전 부분은 docker가 관리할 이름, 이후는 컨테이너 경로(기본적으로 컨테이너는 리눅스며 리눅스식 경로 사용!)

3. Bind Mount:
  ```bash
  -v /home/kosmos/data:/var/lib/postgresql/data
  ```

  Named volume과 비슷하지만, 실제 host의 폴더를 지정함. Docker가 관리하는 것이 아닌 host의 디렉터리이므로 `down -v`로 삭제 안 됨.

## Docker Compose 파일 작성하기

`docker-compose.yml` 안에, 

TODO

### Docker Compose 볼륨 관리

Named Volume 생성

```yml
services:
  postgres:
    volumes:
      - postgres-data:/var/lib/postgresql/data

volumes:
  postgres-data:
```

Bind Mount 생성:

```yml
services:
  postgres:
    volumes:
      - ./data:/var/lib/postgresql/data
```