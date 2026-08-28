# farm-manage-system

农场管理 SaaS——多租户、云部署、前端优先。

采用 SDD（规范驱动开发）+ TDD + OpenSpec 三合一流程：**规范是唯一事实来源，代码是派生物**。

## 快速导航

- [AGENTS.md](AGENTS.md) —— AI 开发铁律（每次会话自动加载）
- [docs/constitution.md](docs/constitution.md) —— 项目宪法（最高约束）
- [docs/roadmap.md](docs/roadmap.md) —— 里程碑与十大功能域
- [openspec/](openspec/) —— 机器校验规范层（10 个域 change 已就位）
- [docs/](docs/) —— 文档中心（VitePress 站点）

## 文档中心

```bash
cd docs && pnpm install && pnpm dev   # 本地预览文档站
```

## 技术栈

Vue 3 + TypeScript + Vite · Element Plus · Java / Spring Boot 3.x（JDK 21）· MySQL 8 · pnpm monorepo

详细选型与取舍见 [docs/architecture/ADR-001-技术栈选型.md](docs/architecture/ADR-001-技术栈选型.md)。
