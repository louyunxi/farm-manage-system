# farm-manage-system — AI 开发铁律

> 本项目采用 **SDD（规范驱动开发）+ TDD（测试驱动开发）+ OpenSpec** 三合一流程。
> 本文档是 AI 每次会话的自动加载入口，约束所有开发行为。

---

## 0. 项目定位

农场管理系统 SaaS。从零新建，前端优先。多租户，服务农场/农业企业的日常经营管理。

**明确不做**：通用 ERP、财务系统、电商交易、IoT 硬件直连、社交/社区功能。

---

## 1. 文档层级体系（⚠️ AI 必读：不是"一个需求文档"）

本项目有 **四级文档结构**，需求按功能域分目录组织，**不是把所有需求堆在一个 spec.md 里**。

```
里程碑(Milestone)  →  功能域(Domain)    →  功能(Feature)  →  任务(Task)
docs/roadmap.md       docs/specs/          spec 内章节       docs/tasks/
                      01-xxx/spec.md                        01-xxx/tasks.md
```

| 层级 | 文档位置 | 数量 | 示例 |
|------|----------|------|------|
| L1 里程碑 | `docs/roadmap.md` | 1 个 | M0 基座 → M1 主线核心 → M2 主线完整 |
| L2 功能域 | `docs/specs/<编号>-<域名>/spec.md` | N 个（一个域一个） | `01-租户身份/spec.md`、`02-农场资源/spec.md` |
| L3 功能 | spec.md 内的章节 | 每个域 3~8 个 | 「登录」「注册」「权限管理」 |
| L4 任务 | `docs/tasks/<编号>-<域名>/tasks.md` | 每个域 5~20 个 | `T-01-001` 建表、`T-01-002` 接口 |

**AI 行为约束**：
- 当用户说"写需求文档"时，**必须先确认是哪个层级**（roadmap？某个域的 spec？还是子功能？）
- **禁止**把所有需求堆在一个扁平 spec.md 里
- 每个功能域独立一个 spec 文件，按 `docs/specs/<编号>-<域名>/` 目录组织
- 跨域的需求变更走 `docs/changes/` 提案，不直接改 spec
- 需求头脑风暴时，先确认属于哪个功能域，再在对应域下展开

**推进顺序**：先定功能域划分（roadmap）→ 再逐域深入（spec → plan → tasks → 实现）。
支撑件先行（认证/字典），核心实体次之（农场/地块），业务操作最后（农事/采收）。

**OpenSpec 双轨（docs ↔ openspec）**：
- `docs/` = 人类导航/详述层；`openspec/` = 机器校验权威层（详见 constitution 5.5）。
- 域内功能开发 MUST 走 `openspec change`（proposal → specs → design → tasks → apply → archive）。
- 宪法/roadmap/跨域变更 MUST 走 `docs/changes/` 提案。
- `docs/specs/` 的 AC 与 `openspec/specs/` 的 Scenario 一一对应，任一变更需同步两处。

---

## 2. 开发铁律（不可违反）

### 2.1 优先级链路
```
宪法(constitution.md) > Roadmap(roadmap.md) > Spec(specs/) > Plan(plans/) > Task(tasks/) > 代码
```
冲突时高层胜出。**代码与规范不一致 = 代码错了。**

### 2.2 规范优先
**任何功能开发必须先有 Spec，再写代码。** 禁止边写代码边定需求。

### 2.3 变更走提案
需求变化 → 创建 `docs/changes/` 提案 → 评审通过 → 合并到 spec → 调整 plan → 改代码。
**禁止先改代码后补文档。**

### 2.4 TDD 铁律
**每个 Task 必须走 TDD 循环：**
```
红（写失败测试）→ 绿（最小实现）→ 重构（清理代码，不改行为）
```
没有测试的代码不得提交。**测试先于实现。**

### 2.5 外科手术式修改
只改 Task 要求的范围，不做推测性开发，不顺手重构，不确定先提问。

### 2.6 实现中发现 spec 有误
**暂停实现 → 先走提案改规范 → 再继续。** 禁止绕过规范直接改代码。

---

## 3. 开发流程（按功能域推进，每个域走一遍四阶段）

**不是全项目只走一次流程**，而是 **每个功能域走一遍完整四阶段**：

```
功能域 01-租户身份:
  OpenSpec explore → OpenSpec propose → 生成 spec/plan/tasks → TDD 实现

功能域 02-农场资源:
  OpenSpec explore → OpenSpec propose → 生成 spec/plan/tasks → TDD 实现
  ...
```

**推进顺序**：支撑件先行（01 认证/字典）→ 核心实体（02 农场/地块）→ 业务操作（03 农事/采收）。

> **OpenSpec 产物 ↔ docs 映射**：proposal.md（变更提案）、specs/（spec）、design.md（plan）、tasks.md（task）。
> 域内功能用 `openspec propose` 生成四产物并校验，再同步到 `docs/specs`、`docs/plans`、`docs/tasks` 供人类浏览。

### 3.1 Specify（写规范 — 定义"做什么"）
- 输出：`docs/specs/<编号>-<域名>/spec.md`
- 内容：用户故事 + 验收标准(AC) + 数据模型 + 业务流程 + 待确认
- 工具：`openspec-explore` → `openspec-propose`

### 3.2 Plan（技术规划 — 定义"怎么做"）
- 输出：`docs/plans/<编号>-<域名>/plan.md`
- 内容：接口契约 + 表结构变更 + 组件结构 + 测试计划 + 实现顺序
- 工具：`openspec-propose`

### 3.3 Task（任务分解 — 可执行单元）
- 输出：`docs/tasks/<编号>-<域名>/tasks.md`
- 编号：`T-<域编号>-<序号>`（如 `T-01-001`）
- 粒度：**0.5~2 天**可完成的最小可验证单元
- 状态标记：`[ ]`未开始 / `[~]`进行中 / `[x]`已完成 / `[!]`阻塞 / `[-]`取消
- 每个 Task 关联 1~3 条 AC

### 3.4 Implement（TDD 实现 — 每个 Task 的循环）
```
1. 读 spec 对应 AC
2. 写失败测试（红 🔴）
3. 运行测试，确认失败
4. 最小实现通过测试（绿 🟢）
5. 运行测试，确认通过
6. 重构（清理代码，不改行为）
7. 运行全量测试，确认无回归
8. 对照 AC 逐条自查
9. commit: feat(<域编号>): <描述> (T-XX-YYY)
```

---

## 4. 验收标准（AC）规范

- 编号：`AC-<域编号>-<序号>`（如 `AC-01-001`）
- 格式：**Given**（前置）/ **When**（动作）/ **Then**（预期）
- Task 完成 = 关联 AC 全部勾选 ✅ + 测试全部通过

---

## 5. Git 纪律

- 分支：`main` / `feature/<域编号>-<功能>` / `fix/<描述>` / `change/<日期>-<简述>`
- 提交：**Conventional Commits**，scope 用功能域编号
  - 格式：`feat(<域编号>): <描述> (T-XX-YYY)`
- **禁止直接在 main 上改代码/提交**
- Task 完成 commit 必须引用 T 编号

---

## 6. 接续开发仪式（每次新对话）

```
每次新对话开始实现前，先读：
1. docs/constitution.md（宪法 — 最高约束）
2. docs/roadmap.md（里程碑 — 当前处于哪个阶段）
3. docs/specs/<编号>-<域名>/spec.md（规范 — 当前域做什么）
4. docs/tasks/<编号>-<域名>/tasks.md（进度 — 做到哪了）
然后才动手。

每完成一个 Task，输出对照 AC 的自查结果。
```

---

## 7. 目录地图

```
farm-manage-system/
├── AGENTS.md                    # ← 你正在读的文件（AI 自动加载）
├── AGENTS.local.md              # 本地覆盖（不进 git）
├── docs/                        # 📚 文档中心（VitePress 站点，pnpm dev 可预览）
│   ├── index.md                 #   文档中心首页
│   ├── package.json             #   VitePress 依赖（vitepress + mermaid 插件）
│   ├── .vitepress/
│   │   └── config.ts            #   侧边栏/导航配置
│   ├── constitution.md          #   项目宪法（最高约束）
│   ├── roadmap.md               #   里程碑规划（功能域划分 + 阶段验收）
│   ├── specs/                   #   功能规范 — 按域编号组织
│   │   ├── _template/           #     spec/plan/tasks 三件套模板
│   │   ├── 01-租户身份/         #     每个功能域一个目录
│   │   │   └── spec.md
│   │   ├── 02-农场资源/
│   │   │   └── spec.md
│   │   └── ...
│   ├── plans/                   #   技术方案 — 同样按域编号
│   │   ├── 01-租户身份/
│   │   │   └── plan.md
│   │   └── ...
│   ├── tasks/                   #   任务清单 — 同样按域编号
│   │   ├── 01-租户身份/
│   │   │   └── tasks.md
│   │   └── ...
│   ├── changes/                 #   变更提案（跨域需求变更）
│   └── architecture/            #   架构决策记录（ADR）
├── .dsh/
│   └── skills/                  # DSH AI 技能
│       └── tdd-workflow/        #   TDD 工作流自动触发
├── openspec/                    # OpenSpec 变更/规格/任务（机器校验权威层）
│   ├── config.yaml              #   schema + context（宪法摘要注入）
│   ├── changes/                 #   变更提案（proposal/specs/design/tasks）
│   └── specs/                   #   归档规格（Requirement/Scenario）
├── server/                      # 后端服务（Java/Spring Boot 3.x）
├── services/
│   └── render/                  #   渲染服务（Node + Playwright）
├── apps/                        # 前端应用
│   ├── web/                     #   主站
│   └── admin/                   #   管理后台
├── packages/
│   └── shared/                  # 共享类型/常量（不放业务逻辑）
├── deploy/                      # 部署配置
└── .github/workflows/           # CI/CD
```

### 关于文档中心（VitePress）

- `docs/` 目录既是 **AI 的事实来源**（.md 文件），也是 **人类可浏览的文档网站**（VitePress 渲染）
- **AI 直接编辑 .md 源文件**，VitePress 只是渲染层，不是独立数据源——两者共享同一份文件
- 新增功能域后，同步更新 `docs/.vitepress/config.ts` 的侧边栏配置
- 本地预览：`cd docs && pnpm dev`，构建：`cd docs && pnpm build`
- Mermaid 图表（ER 图、流程图）在 VitePress 中自动渲染为图形

---

## 8. 技术约束

| 层 | 待定/已定 | 说明 |
|---|---|---|
| 前端框架 | Vue 3 + TypeScript + Vite | 已定 |
| UI 库 | Element Plus（倾向） | 待 spec 最终确认 |
| 后端 | Java / Spring Boot 3.x + JDK 21 | 已定（ADR-001） |
| 数据库 | MySQL 8 | 已定（ADR-001） |
| 包管理 | pnpm monorepo | 已定 |
| 单元测试 | Vitest | 已定 |
| E2E 测试 | Playwright | 已定 |
| CI/CD | GitHub Actions | 已定 |

**共享包铁律**：`packages/shared` 只放**类型与常量**（权限码、DTO 类型、错误码），不放业务逻辑。

---

## 9. 禁止事项清单

| 禁止 | 说明 |
|------|------|
| ❌ 没有 spec 就写代码 | 先规范，后实现 |
| ❌ 先改代码后补文档 | 变更走提案 |
| ❌ 没有测试就提交 | TDD 铁律 |
| ❌ 直接改 main 分支 | 任何改动先切分支 |
| ❌ 推测性开发 | 只做 spec 要求的功能 |
| ❌ 顺手重构 | 不在 Task 范围内的改动 |
| ❌ 静默忽略错误 | 空 catch、返回 null 表示失败 |
| ❌ 术语漂移 | 严格使用 constitution.md 术语表 |
| ❌ 跨模块直接查表 | 跨模块通过 service 接口调用 |
| ❌ 把所有需求堆在一个文件 | 按功能域分目录组织 spec |
| ❌ 跳过 roadmap 直接写 spec | 先定域划分，再逐域深入 |

---

## 10. 变更提案模板

提案文件：`docs/changes/YYYYMMDD-简述.md`

```markdown
# 变更提案：<简述>
## 变更类型
新增功能 / 修改现有功能 / 删除功能 / 修改宪法
## 变更原因
为什么需要这次变更
## 变更内容
具体改什么，影响哪些 spec 章节
## 影响范围
受影响 spec / plan / 代码；是否影响宪法
## 评审结论
通过/不通过 + 评审人 + 日期 + 备注
```