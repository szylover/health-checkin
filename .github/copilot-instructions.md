# Agent 工作流

本项目使用 3 个 Agent + 1 个 Data Agent + 2 个 Skill + 1 个 Prompt 协作：

| 角色 | 文件 | 职责 | 工具 |
|------|------|------|------|
| **@PM** | `.github/agents/pm.agent.md` | 需求分析、设计文档、任务管理、进度追踪 | read, edit, search |
| **@Dev** | `.github/agents/dev.agent.md` | 实现 `src/` 下的 React + TS 代码 | read, edit, search, execute |
| **@Designer** | `.github/agents/designer.agent.md` | UI/UX 设计、移动端 PWA 样式 | read, edit, search |
| **@DataAgent** | `.github/agents/data.agent.md` | 食物库/训练模板数值设计与维护 | read, edit, search |
| **/whats-next** | `.github/skills/whats-next/` | 综合 roadmap + GitHub Issues，推荐下一步任务 | — |
| **/daily-scrum** | `.github/skills/daily-scrum/` | 文档与 Issue 状态巡检同步 | — |
| **/ship** | `.github/prompts/ship.prompt.md` | 合并前检查清单 + Git 工作流 | — |

## 工作流程

```
用户需求 → @PM 产出 Design Spec → @Dev 实现 → @Designer 美化 → /ship 提交
```

- 每个功能开始前 **必须** 先有 Design Spec（`docs/specs/`）
- GitHub Issues 追踪所有任务，labels 对应功能模块
- `docs/roadmap.md` 维护总体进度，`docs/progress.md` 维护当前可执行任务

## 项目文件结构

```
health-checkin/
├── .github/
│   ├── agents/         # pm / dev / designer / data
│   ├── skills/         # whats-next / daily-scrum
│   ├── prompts/        # ship.prompt.md
│   └── copilot-instructions.md
├── docs/
│   ├── roadmap.md
│   ├── progress.md
│   └── specs/          # Design Spec per feature
├── public/
│   └── icons/          # PWA 图标 (192/512 PNG)
├── src/
│   ├── components/
│   │   ├── layout/     # AppLayout, BottomNav
│   │   ├── pages/      # HomePage, CheckinPage, CaloriesPage, PlanPage, ProgressPage
│   │   └── shared/     # PageHeader, etc.
│   ├── data/
│   │   ├── foods.ts    # 内置食物库 (~35种)
│   │   ├── workouts.ts # 训练模板 (3套)
│   │   └── texts/      # 所有中文文案常量
│   ├── store/          # Zustand stores (workout/checkin/meal)
│   ├── hooks/          # 自定义 React Hooks
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── staticwebapp.config.json
├── vite.config.ts
└── package.json
```

## 技术约束

- React 19 + TypeScript（严格模式）
- TailwindCSS v4（`@import "tailwindcss"`，无配置文件）
- Zustand + localStorage persist（零后端）
- vite-plugin-pwa（manifest + Service Worker）
- 构建产物到 `build/`（Azure Static Web Apps）
- 所有中文文案集中在 `src/data/texts/`，禁止硬编码
- 数据（食物/训练模板）集中在 `src/data/`
