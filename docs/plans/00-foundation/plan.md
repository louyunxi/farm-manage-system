---
title: 00 工程基座 · 技术方案
---

# Design: 工程基座（M0）

## Context

- **宪法**：模块化单体、前后端分离、`packages/shared` 只放类型与常量、外部依赖接口化。
- **ADR-001**：Vue3 + TS + Vite / Element Plus + Pinia + Vue Router / Spring Boot 3.x + JDK 21 / MySQL 8 / 独立 Node 渲染服务。
- **ADR-002**：Element Plus 选型已固化（本 change 仅引入 Element Plus；MyBatis-Plus/Sa-Token 属 01-tenant-auth 的实现选型，基座不引入）。
- **roadmap**：M0 基座，无业务域。

## Goals / Non-Goals

**Goals:**
- monorepo 可安装（pnpm install）、可启动（pnpm dev / mvn spring-boot:run）、可编排（docker compose）、CI 可验证。

**Non-Goals:**
- 不实现任何业务行为（注册/登录/农场/农事…）。
- 不接真实外部服务（短信/云存储）。
- 不做真实 HTML->图片渲染、不引入向量库（M2/M3）。
- 不引入 MyBatis-Plus/Sa-Token（由 01-tenant-auth 按需引入）。

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

### 2. 前端骨架：Vite 脚手架 + Element Plus/Pinia/Vue Router

两个 app 用同一套模板生成；Element Plus 按需引入（unplugin）控制体积；TS strict。

### 3. 后端骨架：Spring Boot 3.x 单 module 起步

只含 web + actuator + 根端点 hello world；按域拆 module 留到需要时。备选 Gradle--放弃，Maven 中文生态资料多。

### 4. 渲染服务骨架：Node + Playwright

对外契约 `POST /render`（入参 HTML/CSS + 纸张宽高 -> 输出图片）。M0 仅返回占位 PNG；真实渲染、批量、队列留 06 质量安全。

### 5. 本地编排：docker-compose（MySQL 8 + Redis + 渲染服务）

健康检查就绪后才标记 healthy；向量库不进 M0（M3 再加）。

### 6. CI：GitHub Actions

node job（pnpm lint + typecheck + build）+ maven job（mvn test）双流水线；Playwright 浏览器二进制走缓存。

## Risks / Trade-offs

- **Playwright 安装重** -> CI 缓存浏览器二进制；本地首次安装提示。
- **Windows 本地 Docker Desktop 依赖** -> compose 是可选本地编排，单元测试不依赖容器（mock/内存态）。
- **turbo 对 Maven 无感知** -> CI 拆两条 job 并行，不做跨构建系统编排。
