# 桃子种植企业管理系统（taoziguanli）项目经验总结
# —— AI 驱动开发 + 技术架构 + 设计体系的完整参考范式

> 参考项目：**桃子种植企业管理系统**，位于 `E:\AI\taoziguanliruanjianaibiancheng`
> 项目一句话：桃子品类**单品**系统 —— SaaS 多租户，服务桃子种植企业，**数据管理精确到每一棵桃树**。
> 两端结构：平台管理后台（PC Web）+ 企业端（移动 H5，微信优先）+ 公开溯源 H5（匿名只读）。
> 本文档定位：作为你后续用 AI 开发前后端项目的**流程与方法论参考**，重点提炼 **AI 开发流程 / 技术架构 / 设计体系** 三层。

---

## 0. 一句话总结

> 技术选型上是**当代主流全栈**（NestJS + Prisma + PostgreSQL 16/PostGIS + Vue3 + pnpm monorepo）；
> 但这个项目真正的价值在于把 **SDD（Spec-Driven Development 规范驱动开发）** 执行到了"学院派"级别——
> **规范是唯一事实来源，代码是派生物**，并用「宪法 + 双层文档 + 变更提案 + AI 指令层」把需求漂移、术语混乱、AI 不守规矩这三个问题系统性消灭。

---

## 1. 项目本质与定位

### 1.1 一句话定位
桃子品类**单品**系统，不是通用农场管理软件。SaaS 多租户，一套系统服务多家桃子种植企业，数据**精确到每一棵桃树**（单株级是第一公民）。

### 1.2 产品形态（三端）
| 端 | 形态 | 使用者 | 核心职责 |
|---|---|---|---|
| 平台管理后台 admin-web | PC Web | 平台运营方 | 基础数据维护、租户入驻、全局监控（01/08 域） |
| 企业端 tenant-h5 | 移动 H5（微信优先） | 租户企业人员 | 种植管理、单株管理、库存、溯源合格证（02~06 域） |
| 公开溯源 H5 trace-h5 | 匿名只读 | 消费者/认养人/采购商 | 对外溯源展示（07 域） |

### 1.3 首期标杆客户驱动设计
首期客户**哈马匠果园**（上海青浦，国家级生态农场）——70+ 品种、稀植株距、每树控果 500 只、一颗 88 元、**每棵树配传感器 + 专属成长档案**。这决定了系统必须深度支撑「每棵树建档、逐株农事、单株分析」，是"单株第一公民"原则的直接来源。

### 1.4 八个功能域（按 DDD 业务能力划分，非用户口头描述）
| # | 功能域 | 聚合根 | 主要用户 | 所属端 |
|---|---|---|---|---|
| 01 | 租户与身份域 | 租户、用户 | 平台运营+企业全员 | 两端 |
| 02 | 桃园资源域 | 地块、桃树 | 技术员 | 企业端 |
| 03 | 种植生产域 | 农事记录 | 技术员/操作员 | 企业端 |
| 04 | 采收与产后域 | 采摘批次 | 操作员 | 企业端 |
| 05 | 投入品库存域 | 农资档案、库存流水 | 操作员 | 企业端 |
| 06 | 质量安全与合规域 | 检测记录、合格证 | 企业管理员 | 企业端 |
| 07 | 溯源展示域 | 溯源码 | 公众 | 公开H5 |
| 08 | 平台主数据与运营域 | 字典项、政策版本 | 平台运营 | 平台后台 |

### 1.5 明确"不做"清单（边界意识，极其重要）
> 不做通用作物管理、不做财务/ERP/人事、不做电商交易、不做 IoT 硬件直连、不做省级/国家级追溯平台对接、不做任何离线功能、不做冷库/保鲜/贮藏。后续迭代（需走变更提案）：成本核算、气象预警、病虫害 AI 识别、派工、农文旅/认养等。

---

## 2. AI 开发流程（核心 · 精细总结）

> 这是本项目最值得吸收的部分。SDD 不是"先写文档再写代码"这么简单，而是一整套**防需求漂移、防术语混乱、防 AI 越权**的机制。

### 2.0 总览：四阶段工作流

```
阶段一 Specify（写规范） → 阶段二 Plan（技术规划） → 阶段三 Task（任务分解） → 阶段四 Implement（实现）
    docs/specs/             docs/plans/            docs/tasks/             server+apps/
    定义"做什么"             定义"怎么做"            可验证执行单元          代码
    （用户故事/数据/         （选型/表结构/           （T{域号}-{序号}         按任务实现，
      流程/AC/待确认）         API/顺序）              任务卡）                评审
```

**核心铁律**：
1. **规范优先**：任何功能开发必须先有 spec，再写代码；代码与规范不一致时以规范为准。
2. **优先级链路**：`constitution.md 宪法 > specs > plans > changes（临时）> 代码`，冲突时高层胜出。
3. **变更走提案**：需求变化先写 `changes/` 提案，人工评审通过合并 spec 后才动代码。**禁止先改代码后补文档**。
4. **外科手术式修改**：只改任务要求的范围，不做推测性开发、不顺手重构；不确定先提问。
5. **实现中发现 spec 有误**：暂停实现，先走提案改规范，再继续。

### 2.1 文档五层体系（最值得抄的结构）

| 层 | 目录 | 回答什么问题 | 稳定性 | 更新方式 |
|---|---|---|---|---|
| **宪法** | `docs/constitution.md` | 不可变的项目原则（定位/架构/边界/术语/SDD约束） | 最高，不可变 | 只能走提案 |
| **规范（事实来源）** | `docs/specs/01~08` | 做什么（用户故事/数据模型/流程/AC/待确认） | 定稿后冻结 | 走提案 |
| **规划（决策层）** | `docs/plans/` | 怎么做（选型/表结构/API/顺序） | 评审后冻结 | 走提案（结构性） |
| **变更提案（临时）** | `docs/changes/` | 为什么改、改什么、影响什么 | 临时 | 评审后合并，保留历史 |
| **代码** | server + apps + packages | 实现 | 随时变 | 实现 |

**两个旁路层**：
- `docs/standards/`：**工程规范事实来源**（面向人、完整版、参考阿里黄山版适配，11 文件）
- `docs/tasks/`：**执行层任务清单**（面向 AI/人、高频更新、随手勾选不走提案）
- `docs/outputs/`：汇报输出层（团队/公司汇报等**派生物**，不属于规范链路）

### 2.2 变更提案机制（解决"理解不一致"的核心）

这是 SDD 防需求漂移的**关键机制**：

```
发现需求要变 → 创建 changes/ 提案 → 人工评审 → 合并到 spec → 调整 plan → 调整代码
```

**提案模板**（`YYYYMMDD-简述.md`）：
```markdown
# 变更提案：<简述>
## 变更类型        # 新增功能 / 修改现有功能 / 删除功能 / 修改宪法
## 变更原因        # 为什么需要这次变更
## 变更内容        # 具体改什么，影响哪些 spec 章节
## 影响范围        # 受影响 spec / plan / 代码；是否影响宪法
## 评审结论        # 通过/不通过 + 评审人 + 日期 + 备注
```

**防理解不一致的三检查点**（每次开发前）：
1. **宪法一致性**：本次要做的事是否符合 constitution.md？
2. **spec 最新性**：我读到的 spec 是否最新合并后的版本？有无未处理提案？
3. **术语一致性**：用词是否与宪法第四章术语表一致？

### 2.3 术语治理（AI 时代特别重要）

> 项目建立了**五组 37 条标准术语表**，每条都带"禁用别名"。这在 AI 协作中价值巨大——AI 最容易犯的就是术语漂移。

**用法总则**（2026-08-19 术语治理确立）：
- 实体语境用"**桃树**"（表名/档案/编码，英文 `tree`）；粒度语境用"**单株**"（单株级/单株录入）；计量语境用"树/棵/株"。
- 农资/投入品双轨；溯源/追溯区分；英文实体名铁律（`Tree`、`farm_log`，禁 `SingleTree`/`FarmingRecord`）。

**术语表示例**：
| 标准术语 | 英文 | 禁用别名 |
|---|---|---|
| 桃树 | tree | 单树、植株、树体 |
| 单株 | single_tree（录入模式） | 棵、株（笼统时） |
| 租户/企业 | tenant | 商户、店铺、农场 |
| 物候期（9 阶段） | phenology | 生长期、阶段 |
| 农事（6 大类） | farm_log | 农活、作业 |
| 合格证（承诺达标） | compliance_certificate | 检测报告、证书 |
| 安全间隔期 | safety_interval | 停药期、安全期 |

### 2.4 AI 指令层：AGENTS.md + .trae/rules（最有启发的一招）

> 项目把工程规范**提炼成两层投喂给 AI**：跨工具入口 + 工具专属规则。这是"让 AI 自动守规矩"的完整方案。

**第一层：根目录 `AGENTS.md`（跨工具通用入口）**
- 约束：**≤150 行**精简铁律速览；Trae 中可"导入为项目规则"自动生效
- 内容：项目一句话 + 开发铁律（规范优先/优先级链路/变更走提案/外科手术式修改/单株第一公民）+ 关键约束速记 + 目录地图 + 八域 + SDD 四阶段 + 协作方式

**第二层：`.trae/rules/`（工具专属，从 standards 提炼，带生效方式）**
| 文件 | 触发方式 | 作用 |
|---|---|---|
| `00-sdd-workflow.md` | `alwaysApply: true`（始终生效） | SDD 核心铁律 |
| `01-domain-terms.md` | 触发词（领域/术语/数据模型） | 术语红线 |
| `02-frontend.md` | `globs: apps/tenant-h5/**, apps/trace-h5/**` | 企业端/溯源 H5 约束 |
| `03-admin-web.md` | `globs: apps/admin-web/**` | 平台后台约束 |
| `04-sql.md` | `globs: **/*.sql, **/migrations/**, **/schema.prisma` | 数据库/SQL 铁律 |
| `05-release.md` | 手动触发 `#05-release` | 发布前检查清单 |
| `06-backend.md` | `globs: server/**` | 服务端规范 |

**关键机制**：
- `alwaysApply`：始终注入；`globs`：按文件路径自动注入；`description` 触发词：按语义自动注入；手动触发：高风险操作显式确认。
- **三层投喂链路**：`docs/standards/（完整版，人读）→ .trae/rules/（精简版，AI 自动注入）→ AGENTS.md（铁律速览，跨工具）`。
- 修改顺序铁律：**先改 standards（事实来源）→ 再同步提炼版到 .trae/rules/**，二者冲突以 standards 为准。

### 2.5 SDD 写作规范（spec/plan 怎么写）

- 每个 spec 结构：**概述 → 用户故事 → 数据模型 → 流程 → 规则 → 验收 → 待确认**。
- **调研事实优先于用户口头表述**：用户描述把握方向，专业结构由领域分析决定（用户说的"耕种管收"被专业 6 大类农事取代）。
- 每份 spec 头部带**宪法依据**（引用 constitution.md 具体章节）+ **调研依据** + **变更历史**。
- 验收标准（AC）逐条可勾选，驱动实现闭环。
- 待确认问题（Q 编号）登记在 spec 内，评审后确认合并。

### 2.6 任务执行层（docs/tasks/）

- 任务卡编号 `T{域号}-{序号}`，如 `T05-03`。
- 任务卡必含：任务名（动宾短语）+ 对应 spec 章节 + 验收标准 + 状态 + 完成日期。
- **状态五态**：`[ ]` 未开始 / `[~]` 进行中 / `[x]` 已完成 / `[!]` 被阻塞 / `[-]` 已取消。
- **任务粒度**：0.5~2 天可完成的最小可验证单元（建表+CRUD、单个接口、单个页面）。
- 一任务一交付；**日常勾选推进不走提案，结构性变更走提案**。
- 开发顺序：01 租户身份 → 02 桃园资源 → 03 种植生产 → 05 库存 → 04 采收 → 06 质量合规 → 08 平台主数据（08 支撑件穿插先行）。

### 2.7 接续开发约定（对抗 AI 上下文丢失）

> 由于 AI 对话有上下文限制，项目固化了接续开发仪式：

```
每次新对话开始实现前，先读：
1. docs/constitution.md（宪法）
2. 相关域 spec（docs/specs/0X-*.md）
3. docs/tasks/ 对应域清单（确认进度）
然后才动手。每完成一个任务，输出对照 spec 验收标准的自查结果。
```

### 2.8 版本纪律

- spec 文件头部带**版本号 + 最后更新日期 + 变更历史**（v1 → v2 → v5.5）。
- 变更历史记录每次合并的提案编号与内容摘要；SDD-WORKFLOW.md 第六章维护"当前规范状态总览"表（每文件版本/状态/待确认数）。
- Git 提交采用 Conventional Commits，**scope 用功能域编号**（`feat(05): 库存批次 FEFO 原子扣减`），涉及提案的提交引用提案文件。
- 分支模型：main + feature/XX域-功能 + change/YYYYMMDD-简述 + fix/hotfix。

---

## 3. 技术架构（用到的技术栈）

### 3.1 总体架构决策

- **模块化单体（Modular Monolith）**：单仓单部署，内部按八域拆模块边界，跨模块通过 service 层接口调用（禁跨模块直接查表），预留按域拆微服务路径。理由：团队 1-3 人，微服务运维成本超收益；SaaS 多租户增长慢，单体可支撑数百租户。
- **不引入 BFF**：三端 API 面基本不重叠，各端直连统一 API 服务。
- **无 Redis/MQ**：首期无高并发异步场景，通知同步落库、定时任务用 @Cron、公开页本期不缓存。

### 3.2 技术栈选型总表（每项都带对比与落选理由）

| 层 | 选型 | 落选原因（节选） |
|---|---|---|
| 后端框架 | **NestJS (TypeScript)** | Spring Boot：JVM 重、双语言；Go：装饰器权限生态弱 |
| 企业端 H5 | **Vue 3 + Vant 4 + Vite** | uni-app：多端输出是负债；微信 WebView 兼容最优 |
| 平台后台 | **Vue 3 + Element Plus** | Ant Design Vue：生态不及 |
| 公开溯源 H5 | **Vue 3 + Vite**（独立工程） | 同栈复用，无争议 |
| 数据库 | **PostgreSQL 16 + PostGIS** | MySQL：空间能力远不及、JSON 弱于 JSONB |
| ORM | **Prisma** | TypeORM 维护成本高；Drizzle 成熟度不足 |
| 文件存储 | 本地磁盘 + **StorageAdapter 适配层** | 首期直接上 OSS 不必要；预留替换路径 |
| 运行时 | Node.js 22 LTS | |
| 包管理 | **pnpm monorepo** | npm/yarn：依赖提升劣势 |
| 部署 | Docker Compose + Nginx | K8s：单机过重 |
| CI/CD | GitHub Actions | |
| 可观测 | pino 日志 + Sentry | |
| 认证 | JWT（access 2h + refresh 7d） | |

**选型硬约束来源**（关键方法论）：技术栈不是空白里挑的，被三样东西框死——**宪法的技术原则 + 八域 spec 的功能需求 + 首期客户哈马匠的真实使用环境**（低端安卓机、弱网、微信内置浏览器）。

### 3.3 后端架构（NestJS 模块化单体）

```
server/src/modules/
├── identity/       # 01 租户与身份
├── orchard/        # 02 桃园资源
├── production/     # 03 种植生产
├── harvest/        # 04 采收与产后
├── inventory/      # 05 投入品库存
├── quality/        # 06 质量安全与合规
├── trace/          # 07 溯源展示
├── masterdata/     # 08 平台主数据与运营
└── common/         # 通用（唯一允许被各模块依赖）
```

**分层**：controller 薄（路由+权限装饰器）→ service 厚（业务+事务边界）→ prisma；repo 可选。**跨模块依赖只允许 `* -> common`，禁止业务模块横向互引**（用 eslint-plugin-boundaries 强制）。

### 3.4 横切关注点

| 关注点 | 方案 |
|---|---|
| 认证 | JWT access + refresh；登录后选租户写会话 |
| **多租户隔离** | 请求级 TenantContext（AsyncLocalStorage），repository 层强制注入 tenant_id 过滤；Prisma 中间件统一注入；dev 缺租户过滤报警抛错 |
| 权限 | `@RequirePermission('plot:create')` 装饰器 + Guard；**BUTTON 与 API 同码**；后端 Guard 是唯一权限边界（前端隐藏不算） |
| 编号服务 | 08 域 CodeRule 表 + SELECT FOR UPDATE 行锁原子分配；编码内嵌租户段，全局唯一 |
| 时间存储 | timestamptz（UTC 存储），应用层 Asia/Shanghai 展示，全项目一致 |
| 空间数据 | geography(POLYGON/POINT, 4326) + GiST 索引（PostGIS） |
| 幂等 | 写接口带 client request id + DB 唯一约束兜底 |
| 审计 | 审计日志表 + NestJS 拦截器自动记录 |
| 事务边界 | Service 层 @Transactional 收敛（如 05 库存四方同事务） |
| 错误处理 | 全局 ExceptionFilter；未映射异常统一 B0001"系统繁忙"；traceId 贯穿响应与日志 |

### 3.5 前端架构

- **三个独立应用**（admin-web / tenant-h5 / trace-h5），共享 **packages/shared**（不共享组件代码，共享 tsconfig/ESLint/工具链）。
- **packages/shared 只放类型与常量，不放业务逻辑**：权限码常量（26 菜单+83 按钮，BUTTON/API 同码）、DTO 类型、术语字典 TS 类型、通用校验（编码格式/手机号）。三端与 server 共用同一份定义，**防止两端权限码漂移**。
- 枚举治理：**展示型进字典（DB），控制型留代码（shared 常量）**。
- 前端工程：Vue3 + `<script setup lang="ts">`、defineProps/defineEmits 类型声明、禁 any/!/@ts-ignore、ref 泛型明确、统一拦截器（响应体解包、401 静默刷新、错误 toast 直显服务端 message）、v-for 必带业务键、lint 门禁 eslint-config-alloy + Prettier（`pnpm lint && pnpm typecheck` 双绿才提交）。

---

## 4. 设计体系（数据模型/规范/工程规范的制度设计）

### 4.1 数据库十条铁律（G1-G10，全库 79 张表遵守）

| # | 原则 | 物理化决策 |
|---|---|---|
| G1 | 主键统一 | 所有表主键 `*_id`（禁裸 id），类型 uuid 存 **UUIDv7**（RFC 9562，应用层生成），主键名与跨表引用列名一致；禁 bigint 自增（防枚举） |
| G2 | 多租户隔离 | 所有业务表带 `tenant_id` 并建索引；平台表（字典/政策/模板）不带 |
| G3 | 人员字段 | 一律 `*_user_id` 引用 user，**禁止存姓名字符串**，展示 join nickname |
| G4 | 业务编码全局唯一 | plot_code/tree_code/trace_code/cert_no/batch_no 经 CodeRule 原子分配，UNIQUE 约束 |
| G5 | 时间存储 | 一律 `timestamptz` UTC 存储，date 语义用 date，展示 Asia/Shanghai |
| G6 | 软删标记 | 核心档案表 `is_deleted`；业务流水表只增不改不删 |
| G7 | 枚举收敛 | 枚举值落 `text` + CHECK（或 Prisma enum），值集与 spec 一致；禁 int 编码枚举 |
| G8 | 精度 | 数量 decimal(10,2)；MRL/农资浓度 decimal(10,4)；比率 decimal(5,2)；**禁 float 存钱与检测值** |
| G9 | 空间数据 | geography + GiST 索引 |
| G10 | 图片引用 | 一律 `*_file_ids json`（FileStorage.file_id），禁存 URL 字符串 |

**表命名**：实体英文 snake_case **单数**（`plot_group`）；字典表前缀 `dict_`；平台表前缀 `sys_`/`platform_`。
**索引命名**：唯一 `uk_{表}_{列}`、普通 `idx_{表}_{列}`；组合索引列序 = 等值前置 + 区分度，tenant_id 打头。
**SQL 红线**：禁 SELECT *（Prisma select 明确列集）；in ≤1000；join ≤5 表；pageSize ≤100；`$queryRaw` 必须参数化模板；**物理外键保留但禁级联删除（onDelete: Restrict）**。

### 4.2 错误码体系（单文案模式，定案 2026-08-20）

- 统一响应体 `{ code, message, data, traceId }`；`00000` 成功。
- 错误码 = 1 位来源（A 用户 / B 系统 / C 第三方）+ 4 位数字；**一码一语**常量表落 `packages/shared/src/errors/`。
- **message 即客户端提示语**：可内插本租户业务值（单号/数量），**禁内插技术值**（表名/SQL/第三方报错）。
- 所有异常被全局 ExceptionFilter 捕获；堆栈只进日志不进响应。
- 业务错误一律 `throw new BizException(ErrorCode.XXX)`，禁返回 null 表示失败、禁空 catch、禁 try-catch 做流程控制。

### 4.3 权限模型（26 菜单 + 83 按钮）

- 三表动态角色：Role / Resource / RoleResource（不硬编码）。
- 权限编码规范：`{业务对象}:{动作}` 全小写；16 个 perm 动词闭环（view/create/edit/delete/import/export/audit/manage/issue/void/lock/unlock/submit/revoke/handle/scan）。
- **BUTTON 与 API 同码同义**；applicable_scope 02-06 域为 TENANT。
- 角色双轨：平台内置角色（租户只读不可改删）+ 租户自定义角色（自建自删改）。

### 4.4 多租户隔离（安全红线）

- 所有查询必带 tenant_id：Prisma 中间件统一注入（JWT 解析）；raw SQL 人工注入并 review 盯防。
- 跨租户访问 403 + warn 日志；dev 模式缺租户过滤报警抛错。
- 密码 bcrypt（cost ≥10）；登录失败 5 次锁 15 分钟；验证码 6 位 5 分钟有效。
- 敏感字段（手机号/密码/token）禁入日志；生产密钥走环境变量；容器非 root；业务库账号无 DDL 权限。
- **公开溯源页隐私红线**：只展示 nickname、GPS 村级模糊、ip_region 省级、未达标证书中性表述。

### 4.5 工程规范（docs/standards/，11 文件）

| 文件 | 内容 |
|---|---|
| coding-standards.md | 术语命名、多租户数据、业务红线 |
| typescript-standards.md | strict/any 禁令、async 铁律、Vue3 专项 |
| api-standards.md | RESTful、响应体、鉴权、幂等并发 |
| database-standards.md | 建表规约、索引、Prisma 映射 |
| error-and-logging-standards.md | 错误码、单文案、pino 日志 |
| security-standards.md | 权限、隔离红线、注入防护 |
| testing-standards.md | 测试金字塔、70% 覆盖门禁、E2E |
| project-structure-standards.md | monorepo、模块分层 |
| git-conventions.md | 分支、提交、提案联动 |
| sdd-writing-standards.md | spec/plan/提案写作规范 |

> 参考基准：《阿里巴巴 Java 开发手册》黄山版按本项目技术栈适配，**13 项冲突显式裁决**记录在各文件末章。这是"引用权威规范但显式记录偏离"的好范例。

### 4.6 单株第一公民（领域建模精髓）

- 核心对象层级：`租户 > 地块分组 > 地块 > 桃树 > 农事/事件`。
- 农事记录**强制落到单株级别**（v5 重构消灭"地块级存储断点"）：三表模型 `farm_log 主记录 + farm_log_batch 批量摘要 + farm_log_target 单株关联`。
- 三种录入模式（单株扫码 / 均匀批量 / 差异批量），最终都可定位到每一株。
- 物候期按桃子 9 阶段、农事按专业 6 大类、套袋/疏果按树量化、流胶病/天牛逐株追踪、一树一码溯源。

---

## 5. 两个项目的对比（taoziguanli vs frp-farm）

> 两个项目都验证了 SDD 的价值，taoziguanli 是 frp-farm 方法的"升级版/学院派"。

| 维度 | frp-farm（神农口袋重构） | taoziguanli（桃子管理系统） |
|---|---|---|
| 项目性质 | 老系统渐进式重构（绞杀者） | 从零新建（规范先行，编码未开始） |
| 后端 | Go（Gin/GORM/MySQL） | NestJS（Prisma/PostgreSQL+PostGIS） |
| 前端 | Vue3 + Ant Design Vue（admin+web） | Vue3 + Vant4（H5）+ Element Plus（后台） |
| 数据库 | MySQL 8 | PostgreSQL 16 + PostGIS |
| 规范驱动 | spec/plan/tasks 三件套（Spec 包） | 宪法 + specs/plans/changes/standards/tasks 五层 |
| 变更加密 | 变更走提案 | 变更走提案（模板化、评审留痕） |
| AI 指令层 | .opencode/skills + .qoder/skills | AGENTS.md + .trae/rules（带 alwaysApply/globs/触发词） |
| 术语治理 | 有术语表 | **五组 37 条 + 用法总则 + 禁用别名**（更严） |
| 技术栈选型 | 选型文档 + 对比表 | 选型文档 + 对比表 + 硬约束来源 + 风险回退 |
| 工程规范 | 项目内约定 | **standards/ 11 文件，参考阿里黄山版 + 13 项偏离裁决** |

---

## 6. 可直接采纳的经验清单（行动项）

### 6.1 项目立项期
- [ ] 写一份**宪法（constitution.md）**：项目定位（做什么/不做什么）+ 架构约束 + 数据原则 + 术语表 + SDD 约束，作为最高约束。
- [ ] **明确"不做"清单**：划清边界，比写功能清单更重要（防 AI 越权扩散）。
- [ ] 定**术语表 + 禁用别名**（尤其用 AI 开发，术语漂移是高频问题）。
- [ ] 建立**优先级链路**：宪法 > specs > plans > changes > 代码，冲突时高层胜出。

### 6.2 AI 开发流程（每个模块）
- [ ] 先 spec（用户故事/数据模型/流程/AC/待确认）→ 再 plan（选型/表结构/API/顺序）→ 再 tasks（T 编号任务卡）→ 才实现。
- [ ] 需求变更**必须走提案**：changes/ 提案 → 评审 → 合并 spec → 调代码。**禁止先改代码后补文档**。
- [ ] 每份 spec 带宪法依据引用 + 变更历史 + 版本号。
- [ ] 任务卡 0.5~2 天粒度、五态状态、一任务一交付、完成登记日期 + spec 自查。

### 6.3 AI 指令层（让 AI 自动守规矩）
- [ ] 根目录 **AGENTS.md**（≤150 行铁律速览，跨工具入口）。
- [ ] 工具规则层（.trae/rules/ 或 .opencode/skills/）：带触发方式——`alwaysApply` 始终生效 / `globs` 按路径 / `description` 触发词 / 手动触发高风险操作。
- [ ] **三层投喂链路**：完整版 standards（人读）→ 精简版 rules（AI 自动注入）→ AGENTS.md（跨工具）。改规范先改 standards 再同步 rules。
- [ ] 接续开发仪式：新对话先读宪法 + 相关 spec + 任务清单确认进度，再动手。

### 6.4 技术设计
- [ ] 数据库立**十条铁律**（G1-G10）：主键 UUIDv7、tenant_id、user_id 化、编码唯一、时间 UTC、软删、枚举、精度、空间、file_id。
- [ ] 错误码**单文案模式**：`{code,message,data,traceId}`，一码一语，message 即客户端提示语（禁技术值）。
- [ ] 权限**BUTTON 与 API 同码**，后端 Guard 是唯一边界。
- [ ] **packages/shared 只放类型与常量**（权限码/DTO/术语枚举），三端+后端共用防漂移。
- [ ] 外部依赖**接口化 + 适配层**（StorageAdapter），本地实现起步，云实现可平替。
- [ ] 技术选型文档带**硬约束来源 + 对比表 + 落选理由 + 风险回退**。

### 6.5 领域建模
- [ ] 按 **DDD 业务能力**划功能域（非用户口头描述），每域定义聚合根。
- [ ] 核心业务对象定**数据粒度第一公民**（本项目是"单株"，你的项目可能是"订单行/批次/设备实例"），强制落到该粒度。
- [ ] **调研事实优先于用户口头表述**：用户把握方向，专业结构由领域分析决定。

---

## 7. 关键文件索引（读这些文件 = 复现整套方法论）

| 目的 | 文件路径（E:\AI\taoziguanliruanjianaibiancheng 下） |
|---|---|
| 宪法（最高约束） | `docs/constitution.md` |
| SDD 工作流操作指南 | `docs/SDD-WORKFLOW.md` |
| 跨工具 AI 入口 | `AGENTS.md` |
| 技术栈选型（对比表+硬约束） | `docs/plans/2026-08-19-技术栈选型.md` |
| 数据库表结构（79 表 + G1-G10） | `docs/plans/2026-08-20-数据库表结构.md` |
| 八域功能规范 | `docs/specs/01~08-*.md` |
| 变更提案历史 | `docs/changes/`（20+ 个提案） |
| 工程规范（11 文件） | `docs/standards/` |
| 任务清单（执行层） | `docs/tasks/` |
| AI 指令层（7 文件） | `.trae/rules/` |
| 共享包设计 | `packages/shared/README.md` |
| 后端骨架 | `server/README.md` |
| 部署 | `deploy/README.md` |

---

## 8. 结语：给 AI 开发者的四句话

1. **先立宪法，再谈开发**——项目定位、边界、术语、数据原则定死，AI 才有"唯一事实来源"。
2. **规范 > 规划 > 任务 > 代码**，变更走提案、评审留痕，从机制上消灭需求漂移。
3. **把规范提炼成 AI 指令层**（AGENTS.md + 带触发方式的 rules），让 AI 每次开工自动守规矩，不靠人脑记。
4. **设计体系制度化**——数据库铁律、错误码单文案、权限同码、shared 只放类型，这些"规范"比单个技术选型更能决定项目长期质量。
