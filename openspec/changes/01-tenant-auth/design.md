# Design: 租户与身份

## Context

- **宪法**：API 优先（统一响应体 `{ code, message, data }`）、UUID 主键 `*_id`、UTC 存 `DATETIME`、软删除 `is_deleted`、枚举 `text`+CHECK、`decimal` 精度、外部依赖接口化。
- **ADR-001**：Java/Spring Boot 3.x + JDK 21、MySQL 8、单库 `tenant_id` 列隔离（框架级拦截）。
- **ADR-002**：持久层 MyBatis-Plus、鉴权 Sa-Token、UI 库 Element Plus（均已确认）。
- **roadmap**：M1 域 01。
- **前置**：00-foundation 已提供 monorepo、前后端骨架、docker-compose（MySQL/Redis）与 CI。

## Goals / Non-Goals

**Goals:**
- 打通租户与身份四件事：注册、登录、多租户隔离、基础角色权限。
- `apps/web` 可完成注册->登录->受保护访问的闭环。

**Non-Goals:**
- 不实现任何业务域（农场/地块/农事/合格证）。
- 不拆微服务（模块化单体）。
- 不接真实短信服务（mock 起步，宪法 2.4）。
- 不引入 AI Agent、向量库（M3 能力）。

## Decisions

### 1. 持久层：MyBatis-Plus + 多租户插件

用 `TenantLineHandler` 实现单库 `tenant_id` 自动注入，业务表查询/写入自动带租户条件；平台级表（字典等）通过表名白名单排除。本 change 同时负责引入 MyBatis-Plus 依赖（基座不含）。

**理由**：复杂报表/打印取数手写 SQL 友好，中文企业主流。备选 JPA--放弃，复杂查询与框架易打架（ADR-002）。

### 2. 鉴权：Sa-Token + JWT

登录签发 JWT（内含 `tenant_id`、`user_id`、角色），Sa-Token 做会话与注解式权限拦截（角色鉴权）。依赖 Redis 存会话（docker-compose 已含）。

**理由**：轻量、RBAC 开箱即用。备选 Spring Security--留待有合规审计需求再评估（ADR-002）。

### 3. API 约定

- 前缀 `/api/v1`，统一响应体 `{ code, message, data }`（宪法 2.3）。
- 租户上下文取自 JWT 的 `tenant_id` claim，**禁止**客户端显式传 tenant 字段（防越权）。

### 4. 数据模型约定

- 主键 UUID，列名 `*_id`（`tenant_id`、`user_id`）。
- 时间统一 UTC 存 `DATETIME`（宪法 3.2）。
- 核心档案表软删除 `is_deleted`；枚举 `text` + CHECK；金额/数量 `decimal(10,2)`。

### 5. 外部依赖接口化

短信验证码做成 `SmsSender` 接口 + `MockSmsSender`（本地）/云实现可平替，环境变量切换（宪法 2.4）。

## Risks / Trade-offs

- **多租户插件误伤平台表** -> 白名单机制 + 测试覆盖（字典/品种等平台表不注入 tenant_id）。
- **Sa-Token 依赖 Redis，本地起不来** -> docker-compose 提供 Redis；单测用内存态/embedded 降级。
- **验证码登录无真实短信** -> mock 起步，验收以 mock 为准，真实短信作为云实现后置。
