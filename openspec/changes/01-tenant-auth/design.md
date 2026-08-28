# Design: 技术基座 + 租户与身份

## Context

项目从零新建，无历史代码与数据。约束来自三处：
- **宪法**：模块化单体、前后端分离、API 优先（统一响应体 `{ code, message, data }`）、外部依赖接口化、UUID 主键 `*_id`、UTC 存储、软删除 `is_deleted`、枚举 `text`+CHECK、`decimal` 精度。
- **ADR-001**：Java/Spring Boot 3.x + JDK 21、MySQL 8、Node 渲染服务、Leaflet（业务域用）、AI Agent 走 Spring AI（M3）。
- **roadmap**：M0 基座 + M1 域 01 租户与身份。

## Goals / Non-Goals

**Goals:**
- 立起可运行的 monorepo：`apps/web`、`apps/admin`、`server/`、`services/render`、`packages/shared`、CI、docker-compose。
- 打通租户与身份四件事：注册、登录、多租户隔离、基础权限。

**Non-Goals:**
- 不实现任何业务域（农场/地块/农事/合格证）。
- 不拆微服务（模块化单体）。
- 不接真实短信服务（mock 起步，宪法 2.4）。
- 不引入 AI Agent、向量库（M3 能力）。

## Decisions

### 1. 仓库结构（polyglot monorepo）

```
farm-manage-system/
├── apps/web、apps/admin      # pnpm workspace 前端
├── packages/shared           # 仅类型/常量（权限码、DTO 类型、错误码）
├── server/                   # Java/Maven，独立于 pnpm workspace
├── services/render           # Node 渲染服务，纳入 pnpm workspace
├── deploy/docker-compose.yml
└── docs/、openspec/
```

**理由**：前端/渲染同为 Node，进 pnpm workspace；Java 后端用 Maven，放 `server/` 与 pnpm 解耦。

### 2. 后端：Spring Boot 3 + JDK 21 + Maven，单 module 起步

**理由**：Java 生态主流；单 module 起步、按域拆分留到需要时，避免过早多 module。备选 Gradle——放弃，Maven 中文生态资料多、团队默认。

### 3. 持久层：MyBatis-Plus + 多租户插件

用 `TenantLineHandler` 实现单库 `tenant_id` 自动注入，业务表查询/写入自动带租户条件；平台级表（字典等）通过表名白名单排除。

**理由**：复杂报表/打印取数手写 SQL 友好，中文企业主流。备选 JPA——放弃，复杂查询与框架易打架。

### 4. 鉴权：Sa-Token + JWT

登录签发 JWT（内含 `tenant_id`、`user_id`、角色），Sa-Token 做会话与注解式权限拦截（角色鉴权）。

**理由**：轻量、RBAC 开箱即用。备选 Spring Security——留待有合规审计需求再评估。依赖 Redis 存会话，docker-compose 含 Redis。

### 5. API 约定

- 前缀 `/api/v1`，统一响应体 `{ code, message, data }`（宪法 2.3）。
- 租户上下文取自 JWT 的 `tenant_id` claim，**禁止**客户端显式传 tenant 字段（防越权）。

### 6. 数据模型约定

- 主键 UUID，列名 `*_id`（`tenant_id`、`user_id`）。
- 时间统一 UTC 存 `DATETIME`（MySQL 等价实现，对应宪法 3.2 `timestamptz` 意图）。
- 核心档案表软删除 `is_deleted`；枚举 `text` + CHECK；金额/数量 `decimal(10,2)`。

### 7. 渲染服务：Node + Playwright（M0 仅骨架）

对外契约 `POST /render`（入参 HTML/CSS + 纸张宽高 → 输出图片）。M0 只搭骨架 + hello world，真实渲染、批量、队列留 M2（合格证）。

### 8. CI 与本地环境

- GitHub Actions：`pnpm lint` + `pnpm typecheck` + build；`server/` 跑 `mvn test`。
- docker-compose：MySQL 8、Redis、渲染服务；向量库留 M3 再进。

### 9. 外部依赖接口化

短信验证码做成 `SmsSender` 接口 + `MockSmsSender`（本地）/云实现可平替，环境变量切换。

## Risks / Trade-offs

- **宪法 `timestamptz` 与 MySQL 冲突** → 本设计用 `DATETIME` 存 UTC 等价实现；后续走 `docs/changes/` 提案修订宪法措辞。
- **多租户插件误伤平台表** → 白名单机制 + 测试覆盖（字典/品种等平台表不注入 tenant_id）。
- **Sa-Token 依赖 Redis，本地起不来** → docker-compose 提供 Redis；单测用内存态/embedded 降级。
- **Playwright 渲染重** → M0 仅骨架，批量渲染的并发/队列留 M2 合格证 spec 再设计。
- **验证码登录无真实短信** → mock 起步，验收以 mock 为准，真实短信作为云实现后置。
