# Tasks: 技术基座 + 租户与身份

## 1. 工程基座（M0）

- [ ] 1.1 初始化 pnpm monorepo：`pnpm-workspace.yaml`、根 `package.json`、`turbo.json`；验证 `pnpm install` 成功且 workspace 识别 apps/packages/services
- [ ] 1.2 搭 `apps/web` 与 `apps/admin` 骨架（Vue3 + Vite + TS + Element Plus + Pinia + Vue Router）；验证 `pnpm dev` 两应用均可访问 hello world
- [ ] 1.3 建 `packages/shared` 共享包（权限码、DTO 类型、错误码常量）；验证 apps 可 import 且 typecheck 通过
- [ ] 1.4 搭 `server/` 骨架（Spring Boot 3.x + JDK 21 + Maven + MyBatis-Plus + Sa-Token 依赖）；验证 `mvn spring-boot:run` 返回 hello world
- [ ] 1.5 搭 `services/render` 骨架（Node + Playwright）；验证 `POST /render` 返回占位图片且本地可起
- [ ] 1.6 写 `deploy/docker-compose.yml`（MySQL 8 + Redis + 渲染服务）；验证 `docker compose up` 依赖容器健康
- [ ] 1.7 写 `.github/workflows/ci.yml`（`pnpm lint` + `pnpm typecheck` + build + `mvn test`）；验证 CI 绿

## 2. 数据模型与租户基座

- [ ] 2.1 建表 `tenant`、`user`（UUID 主键 `*_id`、`tenant_id`、`is_deleted` 软删除、枚举 `text`+CHECK、`decimal` 精度）；验证 DDL 可执行、迁移脚本存在
- [ ] 2.2 实现 MyBatis-Plus 多租户插件 `TenantLineHandler` + 平台表白名单；验证业务表查询自动带 `tenant_id`、白名单表不带
- [ ] 2.3 实现统一响应体 `{ code, message, data }` 与全局异常处理器；验证非法参数返回结构化错误而非堆栈

## 3. 租户与身份 API

- [ ] 3.1 定义 `SmsSender` 接口 + `MockSmsSender`（环境变量切换）；验证 mock 发送可观测（日志/内存）
- [ ] 3.2 实现注册接口：校验验证码→建租户+管理员→返回 JWT；验证注册单测红→绿通过（对应 spec 注册三场景）
- [ ] 3.3 实现登录接口：校验验证码→签发 JWT（含 `tenant_id`/`user_id`/角色 claim）；验证登录单测通过（对应 spec 登录场景）
- [ ] 3.4 接入 Sa-Token + JWT 会话与注解式角色鉴权拦截；验证无效/过期 token 返 401、越权返 403（对应 spec 权限场景）

## 4. 前端接入

- [ ] 4.1 实现登录/注册页（`apps/web`）；验证可完成注册→登录闭环且 token 落库
- [ ] 4.2 封装 Axios 请求层（token 注入 + 401/403 统一处理）；验证受保护请求自动携带 token
- [ ] 4.3 实现按角色的路由/菜单显隐；验证操作员看不到管理员入口

## 5. 测试与验收

- [ ] 5.1 后端 TDD 全绿：注册/登录/多租户隔离/角色权限四组测试；验证 `mvn test` 通过
- [ ] 5.2 前端 Vitest 关键单测（登录表单校验、请求拦截器）；验证 `pnpm test` 通过
- [ ] 5.3 端到端验收：注册→登录→建数据→跨租户不可见→越权 403；验证与 spec 全部 AC 场景一致
