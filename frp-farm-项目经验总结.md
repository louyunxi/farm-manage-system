# frp-farm 项目经验总结 —— AI 驱动前后端全栈开发的参考范式

> 参考项目：**神农口袋（SnKoudai）重构项目**，现位于 `E:\project-demo\frp-farm-master`
> 本文档定位：作为你后续用 AI 开发前后端项目的**流程与方法论参考**，重点总结 **AI 开发流程**。

---

## 0. 一句话总结

> 技术栈上是主流的 **pnpm monorepo + Go(Gin/GORM) + Vue3 全家桶 + VitePress 文档中心**，没有炫技；
> 真正的价值在方法论——用「**文档宪法层 + Spec 驱动开发 + 参考原系统 + AI skill 固化 + 强 git 纪律**」这套组合拳，
> 让 AI **稳定、可验收、无功能漂移** 地重写/开发一个大型业务系统。

---

## 1. 项目本质

这不是一个从零开发的绿地项目，而是一个 **老系统重构项目**：
把原来「25 个 Java 微服务 + 2 套老前端」的农业平台，用新技术栈**渐进式重写**（Strangler Pattern 绞杀者模式）。

因此整个工程的**组织方式和开发流程都围绕一个核心问题**：

> 如何用 AI 高效地、无功能漂移地重写一个大型业务系统？

这恰好是「用 AI 开发前后端项目」时最值得借鉴的地方。

### 1.1 参考项目目录结构（monorepo）

```
frp-farm-master/
├── backend/
│   └── server/              # Go 模块化单体（不属 pnpm 管理）
│       ├── cmd/server/      #   启动入口（-env=local|test|uat|prod）
│       ├── cmd/migrate/     #   迁移入口（go run ./cmd/migrate）
│       ├── config/          #   多环境配置 config.local.yaml
│       ├── internal/        #   业务模块（限界上下文）
│       │   ├── common/      #     通用：响应/错误码/分页/中间件
│       │   ├── auth/ rbac/ dict/ region/ file/ sms/
│       │   ├── company/ farm/ land/ batch/ adminbiz/ ...
│       ├── scripts/
│       │   ├── migrations/  #   golang-migrate：NNNN_xxx.up.sql + .down.sql（30+）
│       │   └── migrate-data/ #  老系统数据迁移脚本（JS）
├── frontend/                # pnpm workspace 三包
│   ├── admin/               #   管理后台（Vue3，vben 模式）
│   ├── web/                 #   Web 主端（Vue3）
│   └── shared/              #   共享包（request/useTable/useDict/类型）
├── docs/                    # 文档中心（VitePress + teek 主题 + mermaid）
│   ├── product/             #   需求基线（领域知识·宪法层）
│   ├── architecture/        #   架构设计 + ER 图 + db-schema
│   ├── specs/               #   SDD Spec 包（spec/plan/tasks 三件套）
│   ├── project/             #   协作规范/开发清单/进度
│   └── reference/           #   老系统接口 JSON + UAT 截图（权威参考源）
├── deploy/docker-compose.yml # MySQL8(3307) + Redis7 本地编排
├── .github/workflows/ci.yml  # Go build/test + 前端 pnpm build
├── .opencode/skills/         # AI 开发流程 skill（实现参考/SDD/ER图/git）
├── .qoder/skills/            # 同上（另一套 AI 工具的 skill）
├── pnpm-workspace.yaml       # docs/admin/web/shared 四包
└── Makefile                  # 常用命令收口
```

---

## 2. 技术栈全景

### 2.1 后端（Go，模块化单体）

| 类别 | 选型 | 说明 |
|------|------|------|
| 语言 | Go 1.25 | 摆脱 Java 体系，类型与部署轻量 |
| Web 框架 | **Gin** | 生态最全、中间件成熟 |
| ORM | **GORM** | MySQL8（prod）/ glebarez/sqlite（纯 Go 驱动，测试用） |
| 迁移 | **golang-migrate** | `scripts/migrations/NNNN_*.up.sql + .down.sql`，测试种子数据随迁移保留 |
| 认证 | golang-jwt/v5 | JWT，手机号验证码登录，access token |
| 缓存 | go-redis/v9 | 验证码/会话/热点缓存 |
| 配置 | spf13/viper | 多环境（local/test/uat/prod），环境变量覆盖 |
| 日志 | go.uber.org/zap | 结构化日志 |
| 校验 | go-playground/validator | Gin 内置集成 |
| 其他 | sonic（快速JSON）/ bcrypt / Robfig-cron（定时任务） | |

**后端分层模式**（每模块统一三段式）：
```
internal/<模块>/
├── model.go     # GORM 模型（含 TableName() 显式映射）
├── service.go   # 业务逻辑（直接持有 *gorm.DB，事务封装）
└── handler.go   # HTTP 层（参数校验 + 调用 service + 统一响应）
```

**统一约定**：
- 响应结构 `Response{code, message, data}`、分页 `PageData{list,total,page,pageSize}`
- 业务错误 `BizError{Code, Message}`，错误码常量集中在 `common/error.go`（0成功/40000参数/40100未登录/40300无权限/40400不存在/40900冲突/50000内部）
- 路由按模块注册到 `/api/v1/<模块>` 分组；需登录的路由套 `auth.AuthMiddleware()`
- **接口抽象 + 双实现 + 配置切换**：Storage（local/OSS）、SMS（local/阿里云），`STORAGE_DRIVER`/`SMS_DRIVER` 环境变量切换

### 2.2 前端（Vue3 全家桶，两工程共用一套栈 + 一个共享包）

| 类别 | 选型 |
|------|------|
| 框架 | **Vue 3.5 + TypeScript 5.7 + `<script setup>` 组合式 API** |
| 构建 | **Vite 6** + vue-tsc 类型检查构建（`vue-tsc -b && vite build`） |
| 状态 | **Pinia** |
| 路由 | **Vue Router 4**（静态路由 + 后端菜单树驱动，vben 模式） |
| UI | **Ant Design Vue 4** + @ant-design/icons-vue |
| 样式 | SCSS/Sass + **UnoCSS**（原子类）+ Iconify 图标 |
| 图表 | ECharts |
| 其他 | axios / dayjs |

**共享包 `frontend/shared`（精华）**：
```
shared/src/
├── utils/request.ts     # axios 封装：token注入 / 错误码→文案 / 统一弹窗 / 401跳登录
├── hooks/useTable.ts    # 列表页分页/筛选/加载逻辑（admin+web 共用）
├── hooks/useDict.ts     # 字典加载与缓存
├── types/api.ts         # ApiResponse / PageData / PageParams 类型
├── constants/errorCode.ts # 错误码文案映射（与后端 common/error.go 一一对应）
├── components/UploadFile.vue
└── index.ts             # 统一导出
```

**关键设计**：前端请求封装与后端错误码是**一套前后端共享的契约**——后端定义错误码，前端集中映射文案并统一弹窗，调用方无需自行提示。

### 2.3 文档与工程化

| 项 | 选型 |
|----|------|
| 文档中心 | VitePress + vitepress-theme-teek + mermaid（ER 图/架构图） |
| 本地编排 | docker-compose（MySQL8:3307 + Redis7） |
| CI | GitHub Actions（Go build/test + 两前端 pnpm build） |
| 包管理 | pnpm workspace + `packageManager: pnpm@10.18.3` |
| 命令收口 | Makefile（db-up/db-down/backend-run/build-all） |

---

## 3. 【重点】AI 开发流程（精细总结）

> 这是本项目最值得吸收的部分。核心是 4 大支柱 + 1 条主线闭环，全部**制度化为文档 + AI skill**。

### 3.0 总览：一条主线闭环

```
需求期          设计期          实现期            验收期           发版期
实测原系统 → 写 spec.md → 写 plan.md → 拆 tasks.md → 按 tasks 实现 → 勾 AC → 合入发版
(UAT+源码     含 AC 验收    接口契约        T 编号        commit 关联    后端测试    git flow
 +swagger)    标准         +ER+迁移SQL    可勾选          T 编号         +前端实测    +release tag
```

### 3.1 文档双层结构（宪法层 + 任务层）

> 原则：**稳定的领域知识长期沉淀，易变的任务细节随任务演进**。

| 层 | 内容 | 稳定性 | 作用 |
|----|------|--------|------|
| **第 1 层：领域知识库（宪法层）** | `docs/product/*` 需求基线、`interview.md` 访谈结论、`architecture/` ER 图 + db-schema | 稳定 | 是 AI 理解业务的唯一事实来源 |
| **第 2 层：模块级 Spec 包（任务层）** | `docs/specs/<ARC-xx-模块>/{spec.md, plan.md, tasks.md}` | 随任务演进 | 单个模块的完整闭环 |

### 3.2 Spec 包三件套（每个模块的标准产出物）

| 文件 | 内容 | 关键要点 |
|------|------|----------|
| **spec.md** | 业务规范 | 用户故事 + 原系统 UAT 实测记录（逐项，不遗漏）+ **AC 验收标准**（编号 `AC-模块-序号`）+ 差异说明 |
| **plan.md** | 技术方案 | 接口契约（新路由 ↔ 原接口映射表）+ **ER 变更**（mermaid erDiagram）+ 前端组件结构 + 迁移 SQL + 测试计划 |
| **tasks.md** | 任务分解 | `T-模块-序号` 可勾选 + 状态 + commit 短哈希关联 + 完成记录（版本号） |

**编号规则统一**：
- Spec 包目录：`<ARC-xx>-<模块名>`（沿用任务编号，如 `ARC-13-plant-plan`）
- 验收标准：`AC-<模块缩写>-<序号>`（如 `AC-LAND-01`）
- 任务条目：`T-<模块缩写>-<序号>`（如 `T-LAND-01`，完成后附 commit 短哈希）

**模板**：`docs/specs/_template/` 下有 spec/plan/tasks 三件套模板，新任务直接复制起步。

### 3.3 执行流程（严格顺序，6 步）

```
1. 实测原系统（UAT 页面 + 老系统源码 + swagger 接口文档）→ 写 spec.md（含 AC）
2. 设计技术方案 → 写 plan.md（接口契约 / ER 变更 / 组件结构 / 迁移 SQL）
3. 拆解任务 → 写 tasks.md（T 编号可勾选）
4. 按 tasks 实现（commit message 引用 T 编号）
5. 逐条勾 AC 验收（后端 Go 测试全绿 + 前端 vue-tsc 通过 + 浏览器实测逐条勾）
6. 合入发版（git flow + release tag）+ 更新 specs/index.md 索引表
```

### 3.4 支柱一：参考原系统优先（防功能漂移的铁律）

> 强制规则：**写任何接口/页面之前，必须先参考原系统的接口文档（swagger JSON）与原系统页面（UAT 实测）**，对齐后再写码。

**参考优先级**：`原接口/原页面 > 需求基线 > 访谈结论`，冲突时以原系统为准，差异需注明。

- 接口路径、参数名、枚举值、响应结构**沿用老系统**，不自行改名（如 `/co/farm/statisticsFarmCropPick`）
- 页面布局、字段、文案以 UAT 实测为准
- 每个任务完成前有**强制检查清单**（已查接口文档 / 已查需求基线 / 命名一致 / 布局一致 / 访谈结论已遵守）
- 例外处理：文档缺失的系统标注「待确认」；搁置项不实现保持占位

### 3.5 支柱二：ER 图先行（数据模型全程可见）

> 需求/接口/业务模块设计阶段**必须**配套 Mermaid `erDiagram`，随需求文档同步维护，写代码前以 ER 图为准对齐表结构。

- 实体命名与表名一致（snake_case），注释标注中文名
- 关系标注基数（`||` 一、`}o`/o{ 零或多），明确一对多/多对多，避免无基数弱关系
- 关键属性标注类型与 PK/FK
- 每新增/修改模块或接口：同步新增/更新对应 ER 图
- 避免「边写代码边定表结构」的随意性

### 3.6 支柱三：方法论固化为 AI skill（最有启发的一招）

> 把开发规范直接做成 **AI 每次开工前都会加载的 skill 文件**，而不是人脑里的口头约定。

项目里有 4 个 skill（`.opencode/skills/` 与 `.qoder/skills/` 双份）：

| skill | 作用 |
|-------|------|
| `frp-farm-implementation-reference` | 先实测原系统再写码（权威参考源表 + 强制检查清单） |
| `frp-farm-sdd-spec` | SDD Spec 包产出流程（三件套 + 6 步闭环 + 编号规则） |
| `frp-farm-er-diagram` | ER 图编写规范（语法/命名/基数/放置位置） |
| `frp-farm-git-convention` | git 分支/提交/合入/发版流程 |

**skill 的标准结构**（以 implementation-reference 为例）：
```
---
name: <skill名>
description: <何时触发/触发词>
---
# <标题>
## 权威参考源（实现前必查）
| 参考源 | 位置 | 用途 |
## 后端/前端实现流程（步骤化）
## 强制检查清单（每个任务完成前）
## 例外处理
```

> 要点：**description 里写明触发词**（"实现后端接口/前端页面/参考原接口"），AI 遇到对应任务自动加载；流程步骤化 + 检查清单可勾选。

### 3.7 支柱四：强 git 纪律 + 里程碑切割

**Git 纪律**：
- Git Flow 分支模型：`main(生产) / develop(集成) / feature/* / optimize/* / fix/* / release/* / hotfix/*`
- 铁律①：**禁止直接在 main/develop 上改代码/提交**（任何改动先切分支）
- 铁律②：**无论任务大小，完成后必须切 release 分支打 tag 发版**（feature→MINOR、fix/optimize→PATCH、破坏性→MAJOR）
- Conventional Commits：`<type>(<scope>): <subject>`，scope 按平台/业务模块（web/admin/docs/eng）
- 发布窗口周二/周四，周五不发布；数据库变更先兼容后清理（两阶段）

**里程碑切割（M0→M4，每阶段有明确验收）**：
| 里程碑 | 范围 | 验收 |
|--------|------|------|
| M0 基座 | 三端骨架 + CI | 三端可跑通 hello |
| M1 主线核心 | 认证/企业/农场/地块/批次/农事 + 字典 + 审核 | 主线最小闭环（建农场→地块→批次→农事） |
| M2 主线完整 | 采收/销售/农资/凭证/统计 | 产到销到溯源全链路 |
| M3 支撑能力 | IoT/公告/付费/权限三体系/双端同步 | 支撑能力齐备 |
| M4 迁移收口 | 老系统逐域对照下线/数据迁移/域名切换 | 老系统冻结，新系统接管 |

### 3.8 通用能力先行 + 渐进式替换

- **通用能力先行**：字典引擎 / 凭证引擎 / 权限框架 / 审核框架先做，业务域复用
- **绞杀者模式**：新老系统并行 → 同库共存（老库只读 + 新表）→ 分域迁移 → 双跑校验 → 逐域下线
- **模块化单体可拆**：限界上下文内聚，规模增长后再按域拆微服务
- 明确**搁置区**：地图/GIS、物联网外部平台、溯源 H5 后续设计

### 3.9 数据迁移规范（重构项目特有）

- 迁移的数据**必须落库**（写入数据库业务表），禁止只做静态 JSON 展示
- 迁移的功能**必须闭环**（操作须真实写库并参与业务流程）
- 关联完整性：同步迁移并校验外键（用户-企业、企业-农场、员工-农场）
- 端到端验证（迁移企业登录→建农场→选地块→建批次→记农事）
- 本地 JSON/脚本仅作中间产物（分批拉取、断点续传、幂等重跑、对照校验）

---

## 4. 可以直接采纳的经验清单（行动项）

> 面向「用 AI 从零开发一个前后端项目」的前端开发者，按落地优先级排序：

### 4.1 开工前必做（文档宪法层）
- [ ] 写一份 **领域模型文档**：核心实体 + 关系（用 Mermaid ER 图）+ 核心业务规则
- [ ] 写一份 **里程碑清单**：M0 基座 → M1 主线闭环 → M2 完整 → M3 支撑，每阶段带验收标准
- [ ] 写一份 **协作规范**：分支模型 + 提交规范 + 发版规则（铁律：禁止直改主分支）
- [ ] 定好 **前后端统一契约**：响应结构（code/message/data）+ 错误码表 + 分页结构

### 4.2 AI 开发流程（每个模块）
- [ ] **先写 spec 再写代码**：用户故事 + 验收标准（AC）+ 原系统/参考截图
- [ ] **设计先行**：接口契约表 + ER 图 + 迁移 SQL，写进 plan.md
- [ ] **任务拆解**：tasks.md 按 T 编号拆，commit 关联编号
- [ ] **验收闭环**：后端测试 + 前端类型检查 + 浏览器实测，逐条勾 AC

### 4.3 工程结构
- [ ] **共享包 + hooks 抽离**：axios 封装（token/错误码/401）、useTable、useDict 放 shared，双端复用
- [ ] **抽取标准**：同一形态出现在 ≥2 个页面即抽组件/hooks；页面私有逻辑留在页面目录
- [ ] **统一请求层**：错误码→文案集中映射、统一弹窗、401 自动跳登录
- [ ] **后端统一三段式**：model / service / handler，统一响应与错误码

### 4.4 方法论固化
- [ ] **写 AI skill**：把你的技术栈约定 + 开发流程 + 提交规范固化成 skill 文件（含触发词），让 AI 自动遵守
- [ ] **参考基准资产化**：接口文档（JSON/OpenAPI）+ UAT 截图归档进仓库，作为 AI 实现的权威参考源
- [ ] **外部依赖接口化**：存储/短信/支付等做成接口 + 本地 mock + 环境切换，本地开发零依赖

---

## 5. 关键文件索引（读这些文件 = 复现整套方法论）

| 目的 | 文件路径（E:\\project-demo\\frp-farm-master 下） |
|------|-------------------------------------------------|
| 架构总览 + ER 图全量 | `docs/architecture/index.md` |
| 数据库表字典 | `docs/architecture/db-schema.md` |
| AI 开发流程总览 | `docs/specs/README.md`（SDD 总览） |
| Spec 三件套模板 | `docs/specs/_template/`（spec/plan/tasks） |
| 完整 Spec 示例 | `docs/specs/ARC-13-plant-plan/`（含 plan 的接口契约+ER+测试计划） |
| 协作规范（git/发版） | `docs/project/conventions.md` |
| 开发清单（里程碑） | `docs/project/checklist.md` |
| 进度管理 | `docs/project/progress.md` |
| AI skill：实现参考 | `.opencode/skills/frp-farm-implementation-reference/SKILL.md` |
| AI skill：SDD 流程 | `.qoder/skills/frp-farm-sdd-spec/SKILL.md` |
| AI skill：ER 图 | `.opencode/skills/frp-farm-er-diagram/SKILL.md` |
| AI skill：git 纪律 | `.opencode/skills/frp-farm-git-convention/SKILL.md` |
| 后端统一响应/错误码 | `backend/server/internal/common/response.go` + `error.go` |
| 后端分层示例 | `backend/server/internal/land/`（model/service/handler） |
| 前端共享包 | `frontend/shared/src/`（request/useTable/useDict） |
| 前端权限 store | `frontend/admin/src/stores/user.ts`（vben 模式：动态菜单+按钮权限码） |
| 迁移脚本 | `backend/server/scripts/migrations/`（30+ 个 up/down 对） |
| 本地编排 | `deploy/docker-compose.yml` |
| CI | `.github/workflows/ci.yml` |

---

## 6. 结语：给 AI 开发者的三句话

1. **文档先于代码，Spec 先于实现**——让 AI 有「唯一事实来源」，而不是每次现场猜业务。
2. **把流程写成 AI 能加载的 skill**——规范不靠人脑记，靠 AI 开工时自动加载，产出才稳定。
3. **验收标准（AC）先行、逐条勾选**——AI 做完 ≠ 做对了，用可勾选的 AC + 测试闭环来锚定质量。
