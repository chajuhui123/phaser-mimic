# PR 생성 Command

현재 작업 브랜치의 변경 사항을 정리하여 PR을 생성하는 커맨드입니다.

## 실행 순서

### Step 1: 브랜치 상태 확인

- `git rev-parse --abbrev-ref HEAD`로 현재 브랜치를 확인한다. `main`이면 작업을 중단하고 사용자에게 알린다.
- 현재 브랜치가 `main`을 기준으로 분기된 브랜치인지 확인한다.
  ```
  git fetch origin main
  git merge-base origin/main HEAD
  ```
- 공통 조상을 찾을 수 없거나, `main`과 관련 없는 히스토리로 보이면 작업을 중단하고 사용자에게 알린다.

### Step 2: 커밋되지 않은 변경 사항 처리

- `git status`로 staged / unstaged / untracked 변경 사항을 확인한다.
- 변경 사항이 있다면:
  1. `git diff`와 `git diff --staged`로 실제 변경 내용을 파악한다.
  2. `git log --oneline -10`으로 이 저장소의 커밋 메시지 스타일(`prefix: 요약`, 예: `chore: ...`)을 확인한다.
  3. 변경 내용에 맞는 prefix(`feat`, `fix`, `chore`, `refactor` 등)를 판단한다.
  4. `.env` 등 민감한 파일이 포함되지 않았는지 확인하고, 관련 파일만 골라 스테이징한 뒤 `prefix: 요약` 형식으로 커밋한다.
- 변경 사항이 없다면 이 단계는 건너뛴다.

### Step 3: PR 생성 가능 여부 확인

- `git log origin/main..HEAD`로 `main` 대비 커밋이 하나도 없다면 PR을 만들지 않고 사용자에게 알린다.
- `gh pr list --head <현재 브랜치>`로 이미 열려 있는 PR이 있는지 확인한다. 있다면 새로 만들지 않고 기존 PR을 안내한다.
- 원격에 브랜치가 없거나 로컬보다 뒤처져 있다면 push한다 (신규 브랜치는 `git push -u origin <브랜치명>`).

### Step 4: PR 생성

`.github/PULL_REQUEST_TEMPLATE.md` 형식을 그대로 따라 PR 본문을 작성한다.

```
## 변경 사항

## 관련 이슈
Closes #

## 변경 유형
- [ ] 버그 수정
- [ ] 신규 기능
- [ ] 리팩토링
- [ ] 기타

## 체크리스트
- [ ] 로컬 빌드 및 동작 확인
- [ ] TypeScript 오류 없음
```

- **변경 사항**: `main`과의 diff 및 커밋 로그를 근거로 작성한다.
- **관련 이슈**: 알 수 없으면 `Closes #` 그대로 비워 둔다.
- **변경 유형**: 실제 변경 성격에 맞는 항목만 `[x]`로 체크한다.
- **체크리스트**: 직접 확인한 항목만 체크한다. 로컬 빌드/타입 체크를 실행하지 않았다면 체크하지 않는다.

PR 제목은 항상 아래 형식을 따른다.

```
[작업프리픽스] 작업내용 요약
```

- 작업프리픽스는 Step 2에서 사용한 커밋 prefix와 동일한 규칙(`feat`, `fix`, `chore`, `refactor` 등)을 따른다.
- 요약은 간결한 한 줄로 작성한다.

`gh pr create --title "[prefix] 요약" --body "..." --base main`으로 PR을 생성한다.

### Step 5: 결과 보고

생성된 PR URL을 사용자에게 전달한다.

## 주의사항

- push와 PR 생성은 되돌리기 어려운 작업이므로, 이 커맨드가 실행된 경우에 한해 진행한다.
- force push, `git reset --hard` 등 파괴적인 명령은 사용하지 않는다.
- 커밋할 필요가 없는 파일(빌드 산출물, `.env` 등)을 실수로 포함하지 않았는지 커밋 전에 반드시 확인한다.
