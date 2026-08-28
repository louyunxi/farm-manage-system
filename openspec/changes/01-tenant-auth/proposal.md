# Proposal: 租户与身份

## Why

域 01 是所有业务域（农场、地块、农事、合格证……）的依赖前提：没有多租户隔离与登录态，任何业务数据都无法安全落地。工程基座已由 00-foundation 承载，本 change 只做租户与身份。

## What Changes

- 手机号验证码注册（注册成功自动创建租户与管理员账号）
- 验证码登录 + JWT 会话
- 单库 `tenant_id` 多租户隔离（MyBatis-Plus `TenantLineHandler` + 平台表白名单）
- 基础角色权限（管理员/技术员/操作员，Sa-Token 注解式鉴权）
- `apps/web` 登录/注册页与 Axios 请求层

## Capabilities

### New Capabilities

- `tenant-auth`: 租户与身份--注册、登录、JWT 会话、单库 `tenant_id` 隔离、角色权限。

### Modified Capabilities

（无）

## Impact

- **代码**：`server/`（tenant/user 表、注册登录接口、多租户插件、鉴权拦截）、`apps/web`（登录/注册页、请求层、按角色菜单）、`packages/shared`（权限码/DTO/错误码）。
- **依赖**：MyBatis-Plus、Sa-Token、Element Plus（均已定，见 ADR-002）；Spring Boot 3.x / MySQL 8（ADR-001）。
- **规范**：对齐 `docs/roadmap.md` M1（域 01）；M0 工程基座见 00-foundation（本 change 前置）。
