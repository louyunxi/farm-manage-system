## Purpose

为全部功能域提供可运行、可验证的工程基座：monorepo 结构、前后端与渲染服务骨架、本地依赖编排与 CI 流水线。M0 不含任何业务行为。

## ADDED Requirements

### Requirement: Monorepo 工作区

仓库 SHALL 以 pnpm workspace 组织前端与 Node 服务，`packages/shared` 只含类型与常量。

#### Scenario: 安装与识别

- **WHEN** 在仓库根执行 `pnpm install`
- **THEN** 安装成功，workspace 正确识别 apps/packages/services 下全部包

### Requirement: 前端应用骨架

系统 SHALL 提供 `apps/web` 与 `apps/admin` 两个可本地启动的 Vue3 应用骨架。

#### Scenario: 启动 apps/web

- **WHEN** 执行 `pnpm dev` 并访问 apps/web 的开发地址
- **THEN** 页面返回 hello world，typecheck 通过

#### Scenario: 启动 apps/admin

- **WHEN** 执行 `pnpm dev` 并访问 apps/admin 的开发地址
- **THEN** 页面返回 hello world，typecheck 通过

### Requirement: 后端服务骨架

系统 SHALL 提供可独立启动的 Spring Boot 服务骨架。

#### Scenario: 后端 hello world

- **WHEN** 在 `server/` 执行 `mvn spring-boot:run` 并访问根端点
- **THEN** 服务返回 hello world 响应

### Requirement: 渲染服务骨架

系统 SHALL 提供独立 Node 渲染服务骨架，承接 HTML/CSS -> 图片的渲染契约。

#### Scenario: 渲染占位图

- **WHEN** 调用 `POST /render` 提交任意 HTML/CSS
- **THEN** 服务返回占位图片（真实渲染属 06 质量安全）

### Requirement: 本地依赖编排

仓库 SHALL 提供一键拉起本地依赖的 docker-compose 编排。

#### Scenario: 依赖容器健康

- **WHEN** 执行 `docker compose up -d`
- **THEN** MySQL 8 与 Redis 容器达到 healthy 状态

### Requirement: CI 流水线

仓库 SHALL 在每次推送时执行 lint、typecheck、build 与后端测试。

#### Scenario: CI 全绿

- **WHEN** 推送提交触发 GitHub Actions
- **THEN** lint + typecheck + build + mvn test 全部通过
