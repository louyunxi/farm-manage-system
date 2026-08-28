# Proposal: 工程基座（M0）

## Why

项目从零新建，任何功能域（从 01 租户与身份起步）都无法在缺少可运行工程骨架的情况下落地。roadmap 将 M0 定义为独立里程碑（纯工程搭建、无业务域）；本 change 把 M0 从早期「技术基座 + 租户与身份」的合并提案中拆分出来，保持一个 change 只做一件事，并让 roadmap M0 与 openspec change 一一对应。

## What Changes

- pnpm monorepo 初始化：`pnpm-workspace.yaml`、根 `package.json`、`turbo.json`
- `apps/web` + `apps/admin` 骨架（Vue3 + Vite + TS + Element Plus + Pinia + Vue Router）
- `packages/shared` 共享包（仅类型/常量）
- `server/` 骨架（Spring Boot 3.x + JDK 21 + Maven）
- `services/render` 骨架（Node + Playwright，`POST /render` 占位实现）
- `deploy/docker-compose.yml`（MySQL 8 + Redis + 渲染服务）
- `.github/workflows/ci.yml`（lint + typecheck + build + mvn test）

不包含任何业务行为（注册/登录等属 01-tenant-auth）。

## Capabilities

### New Capabilities

- `foundation`: 工程基座--monorepo 结构、前后端与渲染服务骨架、本地依赖编排、CI 流水线。

### Modified Capabilities

（无）

## Impact

- **代码**：新建 monorepo 全部骨架目录（apps/、packages/、server/、services/、deploy/、.github/）。
- **依赖**：Vue3/Vite/Element Plus/Pinia、Spring Boot 3.x、Playwright、MySQL 8、Redis（选型依据 ADR-001、ADR-002）。
- **规范**：对齐 `docs/roadmap.md` M0；任务拆分自 01-tenant-auth 原 1.1~1.7（拆分记录见 `docs/changes/20260828-规范统一治理.md`）。
