# Tasks: 工程基座（M0）

> 任务编号 `T-<域编号>-<序号>`，全项目唯一，commit 引用此编号（AGENTS.md 第 5 节）。

## 1. Monorepo 与前端骨架

- [ ] T-00-001 初始化 pnpm monorepo：`pnpm-workspace.yaml`、根 `package.json`、`turbo.json`；验证 `pnpm install` 成功且 workspace 识别 apps/packages/services
- [ ] T-00-002 搭 `apps/web` 与 `apps/admin` 骨架（Vue3 + Vite + TS + Element Plus + Pinia + Vue Router）；验证 `pnpm dev` 两应用均可访问 hello world
- [ ] T-00-003 建 `packages/shared` 共享包（权限码、DTO 类型、错误码常量）；验证 apps 可 import 且 typecheck 通过

## 2. 后端与渲染服务骨架

- [ ] T-00-004 搭 `server/` 骨架（Spring Boot 3.x + JDK 21 + Maven）；验证 `mvn spring-boot:run` 返回 hello world
- [ ] T-00-005 搭 `services/render` 骨架（Node + Playwright）；验证 `POST /render` 返回占位图片且本地可起

## 3. 编排与 CI

- [ ] T-00-006 写 `deploy/docker-compose.yml`（MySQL 8 + Redis + 渲染服务）；验证 `docker compose up` 依赖容器健康
- [ ] T-00-007 写 `.github/workflows/ci.yml`（`pnpm lint` + `pnpm typecheck` + build + `mvn test`）；验证 CI 绿
