# Proposal: 技术基座 + 租户与身份

## Why

从零启动农场管理 SaaS，需先立起可运行的技术基座（前端/后端/渲染服务/CI），并打通第一个支撑域「租户与身份」——它是所有业务域（农场、地块、农事、合格证…）的依赖前提。没有它，后续任何域都无法在多租户隔离下落地。

## What Changes

- **技术基座（M0）**：pnpm monorepo；`apps/web` + `apps/admin` 骨架（Vue3 + Vite + TS）；`server/`（Spring Boot 3.x + JDK 21）；`services/render`（Node + Playwright，HTML/CSS → 图片）；`packages/shared`（仅类型/常量）；CI（lint + typecheck + build）；`deploy/docker-compose.yml`（MySQL + Redis + 向量库 + 渲染服务）。
- **域 01 租户与身份**：手机号验证码注册、验证码登录 + JWT、单库 `tenant_id` 多租户隔离、基础角色权限（管理员/技术员/操作员）。
- 技术栈按 `docs/architecture/ADR-001-技术栈选型.md` 落位。

## Capabilities

### New Capabilities

- `tenant-auth`: 租户与身份——注册、登录、JWT 会话、单库 `tenant_id` 隔离、角色权限。

### Modified Capabilities

（无）

## Impact

- **代码**：新建 monorepo 结构、`server/`、`apps/web`、`apps/admin`、`services/render`、`packages/shared`、`deploy/`、`.github/workflows/`。
- **依赖**：Spring Boot 3.x、Vue3 + Vite + Element Plus、Playwright、MySQL 8、Redis、Sa-Token（倾向，待 spec 确认）、MyBatis-Plus（倾向，待 spec 确认）。
- **规范**：与 `docs/roadmap.md` M0/M1(域01)、`docs/architecture/ADR-001` 对齐；宪法 3.2 `timestamptz` 与 MySQL 选型的张力，后续另行走 `docs/changes/` 提案修订，不纳入本 change。
