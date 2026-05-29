---
description: "Merge checklist + git workflow. Use when user says 提交/commit/push/PR/merge/发布/ship."
mode: "agent"
tools: [read, edit, search, execute]
---

执行 health-checkin 项目的完整合并前检查清单和 Git 工作流。

## 前置：判断变更类型

- **纯文档变更**（`docs/`、`.github/`）→ 分支前缀 `chore/`
- **代码变更**（`src/`）→ 分支前缀 `feat/` 或 `fix/`
- **文档与代码禁止混在同一个 PR**

## 步骤

### 1. 验证构建

```bash
npm run build
```

必须无 TypeScript 错误和构建错误。

### 2. 检查清单

- [ ] **关闭 GitHub Issue**：通过 PR body 写 `Closes #N`
- [ ] **`docs/roadmap.md`**：完成的任务状态改为 ✅
- [ ] **`docs/progress.md`**：更新可执行任务列表
- [ ] **`.github/copilot-instructions.md`**：如目录结构变了则更新

### 3. Git 工作流（禁止直接 push 到 main，必须走 PR）

```bash
git checkout -b feat/T0XXX-简要描述
git add -A
git commit -m "feat(T0XXX): 简要描述

- 改动要点 1
- 改动要点 2

Closes #Issue编号

Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

git push -u origin <分支名>
gh pr create --base main --head <分支名> --title "feat(T0XXX): 简要描述" --body "改动要点"
```

### 4. 合并

```bash
gh pr merge <编号> --squash --delete-branch
git checkout main && git pull
```
