# farm-manage-system

农场管理 SaaS——多租户、云部署、前端优先。

采用 SDD（规范驱动开发）+ TDD + OpenSpec 三合一流程：**规范是唯一事实来源，代码是派生物**。

## 快速导航

- [AGENTS.md](AGENTS.md) —— AI 开发铁律（每次会话自动加载）
- [docs/constitution.md](docs/constitution.md) —— 项目宪法（最高约束）
- [docs/roadmap.md](docs/roadmap.md) —— 里程碑与功能域总览（slug 表）
- [openspec/](openspec/) —— 机器校验规范层（活跃 change：00-foundation、01-tenant-auth）
- [docs/](docs/) —— 文档中心（VitePress 站点）

## 文档中心

```bash
cd docs && pnpm install && pnpm dev   # 本地预览文档站
```

## 技术栈

Vue 3 + TypeScript + Vite · Element Plus · Java / Spring Boot 3.x（JDK 21）· MyBatis-Plus · Sa-Token · MySQL 8 · pnpm monorepo

详细选型与取舍见 [ADR-001 技术栈选型](docs/architecture/ADR-001-技术栈选型.md) 与 [ADR-002 核心选型固化](docs/architecture/ADR-002-核心选型固化.md)。
