# git 튜토리얼

- [git 튜토리얼](#git-튜토리얼)
  - [git이란](#git이란)
  - [필수 커맨드](#필수-커맨드)
  - [꼭 알아야 할 내용](#꼭-알아야-할-내용)
  - [알면 좋은 내용](#알면-좋은-내용)
    - [Merge Conflict 해결하기](#merge-conflict-해결하기)
    - [remote 레포에 대해](#remote-레포에-대해)
  - [알면 좋은 커맨드](#알면-좋은-커맨드)

## git이란

## 필수 커맨드

- `git clone <git remote 레포 주소>`: 해당 URL에서 clone 진행
- `git branch`: 현재 Git 프로젝트의 브랜치 확인
- `git checkout <브랜치-이름>`: 해당 브랜치로 이동
  - `git checkout -b <브랜치-이름>`:-b 플래그의 경우 새 브랜치 생성
- `git pull`: Git `fetch`와 `merge` 동시 진행. 브랜치별로 pull함
- `git add .`: 변경된 내용을 전부 Staging에 추가.
- `git commit -m "메시지"`: 메시지와 함께 Tracking 되는 파일을 로컬 git에 commit함.
- `git push origin <브랜치>`: GitHub 서버(혹은 기타 origin의 URL)로 push함.

## 꼭 알아야 할 내용

- `.env` 등의 민감한 정보는 항상 `.gitignore`에 추가.
- 자동 생성되는 파일들은 일반적으로 Git에 올리지 않음. IDE나 `npm init`등으로 초기화시  `.gitignore`에 포함시킴.

## 알면 좋은 내용

### Merge Conflict 해결하기

같은 파일을 작업하면 pull할 시 merge conflict이 생깁니다. 이런 경우 해당 파일에서 직접 resolve 해주고 올리면 됩니다. `git add .`와 `git commit` 다시 해 주세요.

하지만 제일 좋은 방법은 작업하는 파일이 겹치지 않게 하는 것입니다. 그리고 **혼자 쓰는 브랜치 아니면 rebase하지 마세요!!!**

### remote 레포에 대해

Git에서 Local Repository는 현재 컴퓨터에 있는 Git 입니다. `.git/`에 정의 되어 있습니다. `git commit`까지는 여기에 작업하는 것입니다. 

Remote Repository는 GitHub에 있는 레포와 같이 다른 컴퓨터에 있는 것입니다. 일반적으로 `clone`한 remote repo는 `origin`, 클론 했을 시 그 상위의 repo는 `upstream`으로 이름을 붙이곤 합니다(GitHub의 경우 자동).

```bash
git remote -v # remote 레포 목록 확인
git remote add <원하는 이름> <레포 url> # 원하는 이름의 remote 레포 지정 
```

예를 들어, 클론(GitHub 사용 가정)을 했을 시, `git pull upstream dev`을 할 시 clone을 한 repo의 dev 브랜치를 pull해 옵니다(자동 merge하고 싶지 않을 시, `fetch`, `merge` 별도로 돌리기).

```bash
git fetch upstream
git merge upstream/dev
```

위의 경우 pull은 `upstream dev`인데 merge는 `upstream/dev`인 이유는, 

- `pull`은 remote repo인 `upstream`의 `dev` 브랜치를 가져오는 것이고
- `merge`는 이미 `fetch`한 `upstream`(로컬에 있음)에서 `upstream/dev`(`/`로 연결되므로 로컬)을 merge하는 것이기 때문입니다.

## 알면 좋은 커맨드

- `git config -l`: 글로벌 git 설정 내용
  - `git config --global user.name <이름>`: global git 이름 설정
  - `git config --global user.email <email>`: global git 이메일 설정
- `git revert HEAD`: 가장 최근 커밋 내용을 되돌림. 어지간하면 안 쓸 수 있도록 하기
  - `HEAD~1` 처럼 HEAD를 기반으로 몇 번째 인덱스의 커밋을 revert 할 지 정할 수 있음.
