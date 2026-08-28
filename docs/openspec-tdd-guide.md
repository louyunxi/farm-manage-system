# OpenSpec × TDD 规范开发完全指南

> 面向 farm-manage-system（前端优先、多租户 SaaS）的 OpenSpec 实操手册。
> 覆盖：安装初始化 → 产品故事 → 任务拆解 → 多端需求 → 实现 → 测试 → 归档的完整闭环。
>
> 当前环境：OpenSpec CLI **v1.10.0**（Volta 安装），npm 最新版 **v1.11.0**，schema 为 `spec-driven`。

---

## 0. 当前版本与升级

| 项目           | 版本                   |
| -------------- | ---------------------- |
| 本机已安装     | **1.10.0**       |
| npm 最新稳定版 | **1.11.0**       |
| 是否最新       | ❌ 落后一个 minor 版本 |

CLI 包名是 `@fission-ai/openspec`（注意：npm 上叫 `openspec` 的那个包版本号是 `0.0.0`，是无关的另一个包）。

**升级（Volta 管理）**：

```bash
volta install @fission-ai/openspec@latest
# 或直接
volta install @fission-ai/openspec
openspec --version   # 确认升级结果
```

**升级后同步项目里的指令文件**：

```bash
# 在项目根目录执行，把最新版指令文件刷进 openspec/ 与 AGENTS 相关文件
openspec update
```

> `openspec update` 只会刷新 OpenSpec 自己生成的指令文件，不会动你手写的 `specs/`、`changes/` 内容。

---

## 1. OpenSpec 是什么

OpenSpec 是一套 **AI 原生（AI-native）的规范驱动开发（Spec-Driven Development, SDD）** 系统。它解决的核心问题是：

> 让「需求 → 规格 → 设计 → 任务 → 实现 → 归档」这条链路上的每一个环节都**落盘成结构化文件**，并且让 AI（DSH / Claude / Codex / Cursor 等）能按同一套规则读这些文件、按规则干活。

它和纯文档的区别在于：

- **规格（Spec）即验收标准**：每条需求带 `Given/When/Then` 场景，场景可以直接变成测试用例。
- **变更（Change）是有边界的**：一次只做一个 `change`，做完归档，历史可追溯。
- **AI 可执行**：CLI 提供 `instructions` / `status` 等命令，把「当前该写哪个文件、约束是什么、模板长什么样」直接喂给 AI。
- **Schema 可插拔**：`spec-driven` 是最常用的一套工作流 schema，也可以自定义。

**和 TDD 的关系**：OpenSpec 管「规格层」的规范（需求、验收场景），TDD 管「代码层」的规范（红→绿→重构）。两者天然互补——spec 里的 `Scenario` 就是测试的蓝图，任务就是测试要覆盖的单元。

---

## 2. 核心概念（先建立词汇表）

| 概念                             | 说明                                                     | 文件/位置                                              |
| -------------------------------- | -------------------------------------------------------- | ------------------------------------------------------ |
| **Spec（规格）**           | 一个能力域（capability）的权威规格，含需求 + 验收场景    | `openspec/specs/<capability>/spec.md`                |
| **Change（变更）**         | 一次有边界的改动提案，做完归档                           | `openspec/changes/<name>/`                           |
| **Delta Spec（增量规格）** | change 内对主 spec 的「增减改」描述，归档时合并回主 spec | `openspec/changes/<name>/specs/<capability>/spec.md` |
| **Artifact（工件）**       | change 内的结构化产物：proposal / specs / design / tasks | 见下文                                                 |
| **Requirement（需求）**    | spec 中的一条`### Requirement:`，带场景                | spec.md                                                |
| **Scenario（场景）**       | 验收标准，`#### Scenario:` + Given/When/Then           | spec.md                                                |
| **Schema（工作流）**       | 定义「有哪些工件、依赖顺序、归档逻辑」                   | `openspec/config.yaml` 的 `schema:`                |

---

## 3. 安装与初始化

### 3.1 安装

```bash
# 推荐用 Volta 管理（本机已用）
volta install @fission-ai/openspec

# 或用 npm 全局安装
npm install -g @fission-ai/openspec

# 验证
openspec --version
```

### 3.2 初始化项目

```bash
cd E:\AI\farm-manage-system
openspec init
```

`init` 会做几件事：

1. 创建 `openspec/` 目录结构（`config.yaml`、`changes/`、`specs/`）。
2. 询问/配置 AI 工具（生成该工具读取 OpenSpec 的指令文件，例如 AGENTS 相关文件）。
3. 写项目上下文（context）与规则（rules）到 `config.yaml`。

**非交互初始化**（脚本/CI 里用）：

```bash
# 指定 AI 工具（all / none / 逗号分隔列表）
openspec init --tools codex,claude --language zh-CN

# 全跳过
openspec init --tools none
```

### 3.3 `config.yaml`（当前 farm-manage-system 的配置）

```yaml
schema: spec-driven

# 项目上下文（可选）：AI 创建工件时会看到
context: |
  Tech stack: Vue3 + TypeScript + Vite, pnpm monorepo
  测试: Vitest(单元) + Playwright(e2e)
  领域: 多租户农场管理 SaaS

# 每类工件的自定义规则（可选）
rules:
  proposal:
    - 提案控制在 500 词以内
  tasks:
    - 每个任务控制在 2 小时以内可完成

# apply / archive 阶段的指导（可选）
operations:
  apply:
    guidance:
      - 先写失败测试，再实现
  archive:
    guidance:
      - 归档前总结本次变更成果
```

> 建议：把你项目里已经定好的「铁律」（AGENTS.md、docs/constitution.md）里跟写代码相关的约束，抄一份到 `config.yaml` 的 `context` 和 `rules`，这样 AI 每次生成规格/任务时都会自动遵守。

---

## 4. 目录结构

```
E:\AI\farm-manage-system\
├── openspec\
│   ├── config.yaml                # 工作流 schema + 上下文 + 规则
│   ├── specs\                     # ★ 主规格（长期事实来源）
│   │   └── <capability>\spec.md   #    例：specs/auth/spec.md
│   └── changes\                   # ★ 变更提案（做完就归档）
│       ├── <change-name>\         #    例：changes/add-tenant-login\
│       │   ├── .openspec.yaml     #    该 change 的元数据
│       │   ├── proposal.md        #    为什么做、做什么、不做什么
│       │   ├── specs\             #    增量规格（对本主 spec 的增减改）
│       │   │   └── <capability>\spec.md
│       │   ├── design.md          #    技术方案（架构、取舍）
│       │   └── tasks.md           #    实现任务清单（checkbox）
│       └── archive\               #    归档区（YYYY-MM-DD-<name>）
└── docs\                          # ★ 你的人类可读文档中心（VitePress）
    ├── constitution.md            #    宪法（铁律）
    ├── roadmap.md                 #    里程碑
    └── specs\<域>\...             #    三件套模板（plan/spec/tasks）
```

**两层文档的分工（重要）**：

- `openspec/`：**AI 的工作台**，给 AI 和 CLI 用，驱动实现。
- `docs/`：**人的导航图 + 可浏览网站**，给人和评审看。

两者不重复劳动：`openspec/specs/` 是权威规格，`docs/specs/` 可以放面向人的解释版或直接链到 openspec 规格。

---

## 5. 命令速查

### 5.1 顶层命令

```bash
openspec init [path]          # 初始化
openspec update [path]        # 刷新指令文件
openspec list                 # 列出所有变更（默认）；--specs 列规格
openspec view                 # 交互式仪表盘（规格 + 变更总览）
openspec change ...           # 管理变更（show/list/validate）
openspec spec ...             # 管理规格（show/list/validate）
openspec show [name]          # 显示某个变更或规格
openspec status --change <n>  # 显示某变更的工件完成状态
openspec validate [name]      # 校验变更/规格
openspec archive [name]       # 归档已完成的变更，合并回主规格
openspec doctor               # 检查 OpenSpec 根目录的健康状态
openspec context              # 打印当前工作上下文
openspec instructions <id>    # 输出某工件的富化指令（给 AI 用）
openspec new change <name>    # 新建变更目录
openspec config ...           # 查看/修改全局配置
openspec schema ...           # 管理工作流 schema（实验性）
openspec store ...            # 创建/管理 store（独立 OpenSpec 仓库）
openspec workset ...          # 组合/打开个人工作视图（纯本地）
openspec completion           # 管理 shell 自动补全
```

### 5.2 高频组合

```bash
openspec list --json                        # 程序化读取变更列表
openspec list --specs                       # 列出所有规格
openspec status --change <name> --json      # 工件依赖 + 完成状态
openspec instructions <artifact> --change <name> --json   # 拿模板和约束
openspec validate --all                     # 校验所有变更和规格
openspec validate <name> --strict --json    # 严格校验
openspec show <name> --json --deltas-only   # 只看增量
openspec archive <name> -y                  # 归档并确认
```

---

## 6. 工作流全景（一张图）

```
                 ┌─────────────────────────────────────────────┐
                 │         OpenSpec 规范开发闭环（SDD）          │
                 └─────────────────────────────────────────────┘

  💭 探索                 ✍️ 提案                📐 规格/设计
┌──────────┐        ┌──────────────┐        ┌──────────────────┐
│ explore  │ ─────▶ │ new change   │ ─────▶ │ proposal.md      │
│ (想清楚) │        │ + proposal   │        │ specs/*.md (delta)│
└──────────┘        └──────────────┘        │ design.md        │
     ▲                                     └────────┬─────────┘
     │                                              │
     │                                              ▼
     │                                      ┌──────────────────┐
     │                                      │ tasks.md         │
     │                                      │ (拆解任务清单)    │
     │                                      └────────┬─────────┘
     │                                               │
     │                                               ▼
     │   ┌────────────────────────────────────────────────────┐
     │   │  apply（实现）+ TDD（红→绿→重构）                    │
     │   │  每个任务：先写失败测试 → 实现 → 重构 → 打勾          │
     │   └───────────────────────────┬────────────────────────┘
     │                               │ 全部完成
     │                               ▼
     │   ┌────────────────────────────────────────────────────┐
     │   │  archive（归档）                                    │
     │   │  增量规格合并回 openspec/specs/ → 移到 archive/     │
     │   └───────────────────────────┬────────────────────────┘
     │                               │
     └───────────────────────────────┘ （开始下一个 change）
```

在 DSH 里，这四步有对应的**技能**：

| 环节 | DSH 技能                    | 触发说法                 |
| ---- | --------------------------- | ------------------------ |
| 探索 | `openspec-explore`        | "先探索/想清楚/讨论一下" |
| 提案 | `openspec-propose`        | "提一个变更/我要做个 XX" |
| 实现 | `openspec-apply-change`   | "开始实现/继续实现"      |
| 归档 | `openspec-archive-change` | "归档这个变更"           |

---

## 7. 完整实操：从需求到完成

下面按 7 步走一遍。假设要做一个新功能：**租户登录（tenant login）**。

### 7.1 Step 0 —— 探索（explore）

不急着写文件，先把问题想清楚。可以用 DSH 的 `openspec-explore` 技能，或直接问 AI。

```bash
openspec list --json          # 看看当前有没有在进行的 change
openspec list --specs         # 看看已有哪些能力域
```

探索阶段要回答：

- 这个功能到底解决谁的问题？
- 边界在哪？（做什么 / 明确不做什么）
- 和已有能力域（如已存在的 `auth`？）是什么关系？
- 有哪些风险、未知点？

**产物**：不是文件，而是「想清楚了」。想清楚了才进入提案。

### 7.2 Step 1 —— 创建 change 并生成产品故事（proposal）

```bash
# 1. 新建变更目录（kebab-case 命名）
openspec new change add-tenant-login

# 2. 查看该变更的工件依赖顺序
openspec status --change add-tenant-login --json
# 输出里重点关注两个字段：
#   applyRequires: 实现前必须完成的工件（通常是 ["tasks"]）
#   artifacts:     每个工件的 status（ready / done）和依赖
```

用 `openspec-propose` 技能让 AI 生成所有工件，或手动按顺序写。**spec-driven schema 的典型顺序是：`proposal` → `specs` → `design` → `tasks`**。

**proposal.md（产品故事 = 为什么 + 做什么 + 不做什么）**：

```markdown
# Change: add-tenant-login

## Why
租户管理员需要能登录自己的农场工作台。当前没有任何登录能力，
所有页面都是无状态的，无法区分租户、无法隔离数据。

## What Changes
- 新增登录页与登录接口
- 新增租户会话（JWT），区分多租户
- 未登录访问受保护路由时重定向到登录页

## Non-goals
- 不做注册/自助开通（租户由平台运营手动开通）
- 不做 SSO / 第三方 OAuth
- 不做密码找回（本期不做）

## Affected Specs
- specs/auth/spec.md（新增）
```

> 「产品故事」在 OpenSpec 里的载体就是 **proposal.md 的 What Changes + specs 里的 Requirement/Scenario**。你项目里 docs/specs/_template 的 `plan.md` 可以和 proposal 对应，保持口径一致即可。

### 7.3 Step 2 —— 写增量规格（需求 + 验收标准，多端拆分）

增量规格写在 `openspec/changes/add-tenant-login/specs/<capability>/spec.md`。

**这是全流程最关键的一步**：每条 `Requirement` 必须带可验证的 `Scenario`（Given/When/Then），因为场景就是测试的蓝图。

```markdown
# auth

## ADDED Requirements

### Requirement: 租户管理员登录
系统 SHALL 允许租户管理员用邮箱 + 密码登录，成功后签发会话令牌。

#### Scenario: 登录成功
- **WHEN** 管理员提交正确的邮箱和密码
- **THEN** 系统返回 200 与 JWT 令牌
- **AND** 前端保存令牌并跳转到工作台

#### Scenario: 密码错误
- **WHEN** 管理员提交错误密码
- **THEN** 系统返回 401 与统一错误信息
- **AND** 不泄露"邮箱是否存在"

#### Scenario: 未登录访问受保护路由
- **GIVEN** 用户没有有效令牌
- **WHEN** 用户访问 /dashboard
- **THEN** 前端重定向到 /login

### Requirement: 多租户数据隔离
系统 SHALL 保证一个租户只能看到自己的数据。

#### Scenario: 跨租户访问被拒绝
- **GIVEN** 租户 A 的令牌
- **WHEN** 请求租户 B 的资源
- **THEN** 系统返回 403
```

**多端需求拆分（关键技巧）**：

一个 change 可能同时影响「Web 管理端」「移动端 H5」「后端 API」多个端。拆法有两个维度：

1. **按 capability（能力域）拆 spec**——每个端一个能力域：

```
openspec/changes/add-tenant-login/specs/
├── auth/spec.md              # 认证能力（跨端通用：登录/登出/令牌）
├── web-dashboard/spec.md     # Web 管理端
├── mobile-h5/spec.md         # 移动端 H5
└── tenant-api/spec.md        # 后端 API
```

2. **按 Requirement 标注端归属**——在同一条需求里用前缀标注：

```markdown
### Requirement: [Web] 登录页表单校验
### Requirement: [API] 登录接口限流
### Requirement: [Mobile-H5] 记住登录态
```

推荐做法：**能力域横切（auth / dashboard / api），端归属用 Requirement 前缀或独立的 `### Requirement` 分组**。这样 `auth` 这种跨端能力只写一份，避免 Web 和 H5 各写一套认证规格导致漂移。

> 拆多端的判断标准：**如果两个端的验收场景（Scenario）不一样，就拆；场景一样，就复用同一份 spec**。例：「登录」对 Web 和 H5 场景基本一致 → 合在 `auth`；「工作台布局」Web 和 H5 场景不同 → 分到 `web-dashboard` 和 `mobile-h5`。

### 7.4 Step 3 —— 写技术方案（design.md）

```markdown
# Design: add-tenant-login

## Context
前端 Vue3 + TS + Vite；后端/DB 待 spec 确定（本期用 mock + JWT）。

## Goals / Non-Goals
- 目标：会话可用、路由守卫、多租户隔离的骨架
- 非目标：生产级 SSO、刷新令牌轮换

## Decisions
- 令牌：JWT（HS256），payload 带 tenantId
- 前端存储：access token 存内存 + refresh 存 httpOnly cookie（本期仅内存）
- 路由守卫：Vue Router beforeEach 全局守卫
- 接口：登录 POST /api/auth/login，本期前端 mock 先行

## Risks
- JWT 无后端校验前，前端 mock 的隔离是"演示级"的，需在 design 里明确标注
```

### 7.5 Step 4 —— 拆解任务（tasks.md）

拆解原则（对齐你项目的铁律）：

- 每个任务 **≤ 2 小时**可完成；
- 每个任务**可独立验证**（做完能跑测试证明）；
- **按 TDD 顺序排**：测试能先写的排前面；
- 任务粒度 = 「一个可打勾的最小工作单元」。

```markdown
# Tasks: add-tenant-login

## 1. 认证模块（TDD）
- [ ] 1.1 写 login store 的失败测试（登录成功/密码错误/未登录跳转）
- [ ] 1.2 实现 auth store（登录动作、token 状态）
- [ ] 1.3 写路由守卫测试（未登录访问 /dashboard 重定向 /login）
- [ ] 1.4 实现路由守卫

## 2. Web 登录页
- [ ] 2.1 写登录表单校验测试（邮箱格式、必填）
- [ ] 2.2 实现登录页 UI 与表单校验
- [ ] 2.3 写登录成功跳转工作台的 e2e 测试（Playwright）
- [ ] 2.4 联调登录接口（mock → 真实 API）

## 3. 多租户隔离
- [ ] 3.1 写跨租户访问被拒的测试
- [ ] 3.2 实现请求头注入 tenantId + 校验
```

> 注意任务里「测试」和「实现」**成对出现**，而且测试写在实现前面——这就是 TDD 在任务层的体现。

### 7.6 Step 5 —— 实现（apply）+ TDD

用 DSH 的 `openspec-apply-change` 技能，或手动执行：

```bash
# 1. 看状态
openspec status --change add-tenant-login --json

# 2. 拿 apply 指令（contextFiles 会列出要读的文件）
openspec instructions apply --change add-tenant-login --json
```

实现循环（每个任务）：

```
  ┌──────────────────────────────────────────────┐
  │  对 tasks.md 里每个 - [ ] 任务：              │
  │                                              │
  │  1. 读该任务对应的 Requirement + Scenario    │
  │  2. 🔴 RED   ：写一个会失败的测试            │
  │  3. 🟢 GREEN ：写最少代码让测试通过           │
  │  4. 🔵 REFACTOR：重构，保持测试绿             │
  │  5. 运行测试确认全绿                         │
  │  6. 把任务 checkbox 从 - [ ] 改为 - [x]       │
  └──────────────────────────────────────────────┘
```

**任务完成就立刻打勾**（`- [ ]` → `- [x]`），不要攒到最后。

```bash
# 随时查看整体进度
openspec status --change add-tenant-login
```

### 7.7 Step 6 —— 测试（重点）

OpenSpec 的 spec 场景和测试框架的对应关系：

| Spec 层                            | 测试层   | 工具       |
| ---------------------------------- | -------- | ---------- |
| Requirement 的`Scenario`         | 测试用例 | —         |
| 单元/组件逻辑（store、守卫、校验） | 单元测试 | Vitest     |
| 跨页面流程（登录→跳转、隔离）     | e2e 测试 | Playwright |

**场景 → 测试的映射示例**：

spec 里的：

```markdown
#### Scenario: 密码错误
- WHEN 管理员提交错误密码
- THEN 系统返回 401 与统一错误信息
```

对应的 Vitest 测试：

```ts
it('密码错误时返回统一错误信息', async () => {
  const res = await authStore.login({ email: 'a@farm.com', password: 'wrong' });
  expect(res.ok).toBe(false);
  expect(res.message).toBe('邮箱或密码错误'); // 不泄露"邮箱是否存在"
});
```

**测试执行**：

```bash
# 单元测试（pnpm monorepo 里按包跑）
pnpm --filter <包名> test
pnpm --filter <包名> test:watch      # TDD 监听模式

# e2e
pnpm --filter <包名> test:e2e
```

**验收口径**：

- 每条 `Scenario` 至少有一个对应测试；
- 所有测试绿 + `openspec validate --all` 通过 + 任务全打勾 = 可以归档。

### 7.8 Step 7 —— 归档（archive）

```bash
openspec archive add-tenant-login
```

归档会做两件事：

1. **合并增量规格**：把 `changes/add-tenant-login/specs/auth/spec.md` 里的 ADDED/MODIFIED/REMOVED 合并进 `openspec/specs/auth/spec.md`（没有就用 `--skip-specs` 跳过，例如纯基建/文档变更）。
2. **移动到归档区**：`changes/add-tenant-login` → `changes/archive/2026-XX-XX-add-tenant-login`。

```bash
# 常用参数
openspec archive add-tenant-login -y        # 跳过确认
openspec archive add-tenant-login --skip-specs  # 不更新主规格
```

归档后，`openspec/specs/` 就是新的「事实来源」，下一次 change 在此基础上做增量。

---

## 8. TDD 与 OpenSpec 深度结合（红-绿-重构如何落到每个环节）

| 环节     | TDD 动作         | OpenSpec 载体                    |
| -------- | ---------------- | -------------------------------- |
| 需求定义 | 明确"什么算对"   | Requirement + Scenario           |
| 红灯     | 写失败测试       | tasks.md 里「写 XX 测试」任务    |
| 绿灯     | 最少实现         | tasks.md 里「实现 XX」任务       |
| 重构     | 不改行为、改结构 | 可单独拆「重构 XX」任务          |
| 验收     | 全绿 + 校验      | `openspec validate` + 任务全勾 |

**四条纪律**：

1. **测试任务永远排在实现任务前面**（tasks.md 的顺序就是 TDD 顺序）。
2. **一个 Scenario = 至少一个测试**，没有场景的"需求"不是需求。
3. **红灯必须是真失败**（断言、而非语法错误/编译失败）。先跑一遍确认红，再写实现。
4. **任务打勾 = 测试绿**，不允许"代码写完了但测试没跑"就勾。

---

## 9. 多端需求拆分实战（模板）

当一次变更涉及多端时，`specs/` 目录按能力域横切：

```
openspec/changes/<change-name>/specs/
├── <capability>/spec.md      # 跨端通用能力（auth、tenant、api）
├── web-<域>/spec.md          # Web 管理端
└── mobile-<域>/spec.md       # 移动端
```

tasks.md 里按端分组，实现顺序建议：**先跨端能力（API/auth），再各端 UI**：

```markdown
## 1. 跨端能力（先做，各端依赖它）
- [ ] 1.1 写 auth API 契约测试（登录成功/失败/401/403）
- [ ] 1.2 实现 auth 接口

## 2. Web 端
- [ ] 2.1 ...（依赖 1.x）

## 3. Mobile-H5 端
- [ ] 3.1 ...（依赖 1.x）
```

判断"要不要拆端"的口诀：**场景同 → 合并；场景异 → 拆分；共享逻辑 → 抽到跨端能力域**。

---

## 10. 完整示例：farm-manage-system「租户登录」端到端

```bash
# ① 探索
openspec list --specs

# ② 新建变更
openspec new change add-tenant-login

# ③ 让 AI 生成工件（DSH 里直接说"用 openspec-propose 生成 add-tenant-login 的全部工件"）
#    或手动按顺序写 proposal.md → specs/auth/spec.md → design.md → tasks.md
openspec status --change add-tenant-login --json   # 确认 applyRequires 全部 done

# ④ 实现（TDD）
openspec instructions apply --change add-tenant-login --json
# 按 tasks.md 逐条：红 → 绿 → 重构 → 打勾

# ⑤ 验证
pnpm --filter <包> test
openspec validate --all

# ⑥ 归档
openspec archive add-tenant-login -y

# ⑦ 确认主规格已更新
openspec spec list
openspec show auth
```

---

## 11. 常用命令速查表

| 目的            | 命令                                                                      |
| --------------- | ------------------------------------------------------------------------- |
| 看版本          | `openspec --version`                                                    |
| 初始化          | `openspec init --tools none --language zh-CN`                           |
| 刷新指令        | `openspec update`                                                       |
| 列变更 / 列规格 | `openspec list` / `openspec list --specs`                             |
| 新建变更        | `openspec new change <kebab-name>`                                      |
| 看变更状态      | `openspec status --change <name> --json`                                |
| 拿工件指令      | `openspec instructions <artifact>\|apply\|archive --change <name> --json` |
| 显示变更/规格   | `openspec show <name>` / `openspec show <name> --json --deltas-only`  |
| 校验            | `openspec validate <name> --strict` / `openspec validate --all`       |
| 健康检查        | `openspec doctor`                                                       |
| 工作上下文      | `openspec context`                                                      |
| 交互仪表盘      | `openspec view`                                                         |
| 归档            | `openspec archive <name> [-y] [--skip-specs]`                           |
| 全局配置        | `openspec config list` / `openspec config set <k> <v>`                |

---

## 12. FAQ 与踩坑

**Q1：`openspec` 和 `@fission-ai/openspec` 有什么区别？**
npm 上 `openspec` 是无关的旧包（版本 0.0.0）。正确包名是 `@fission-ai/openspec`。装错会出现 `openspec --version` 输出异常或命令缺失。

**Q2：`openspec update` 会不会覆盖我写的 specs/changes？**
不会。它只刷新 OpenSpec 自己管理的指令文件。你的 `specs/`、`changes/` 内容不受影响。

**Q3：proposal / specs / design / tasks 的顺序能乱吗？**
`spec-driven` schema 有依赖顺序（proposal → specs → design → tasks）。用 `openspec status --change <name> --json` 看 `applyRequires`，不要凭感觉跳过；`instructions <artifact>` 会告诉你当前该写哪个、依赖哪些已完成的文件。

**Q4：什么时候用 `--skip-specs` 归档？**
纯基建、纯工具、纯文档的变更（没有需求/规格变更）用它跳过主规格更新，避免往 spec 里灌无意义条目。

**Q5：主规格（openspec/specs）和 docs/specs 三件套会不会打架？**
不会。约定：`openspec/specs/` 是**权威规格**（AI 工作台）；`docs/specs/` 是**人类可浏览的解释版**（VitePress）。新增功能域时两边同步更新，docs 侧维护侧边栏（`.vitepress/config.ts`）。

**Q6：一个 change 做多大合适？**
一个 change = 一个可独立交付、可独立归档的完整增量。太大（一个 change 拆 50 个任务）说明该拆成多个 change；太小（只改一个标点）不值得走流程。

**Q7：任务实现到一半发现需求要变怎么办？**
暂停实现，**先回头改工件**（spec 或 design 或 tasks），再继续。不要边写代码边偷偷改需求——这会让 spec 和代码漂移，违背 SDD 初衷。

**Q8：`archive` 前必须 `validate` 通过吗？**
建议必须。`openspec validate --all` 通过 + 任务全勾 + 测试全绿，再归档。`archive --no-validate` 会额外要求确认，不推荐日常使用。

---

## 附：与本项目现有脚手架的对应关系

| 你已有的                                     | OpenSpec 对应物                              | 关系                                               |
| -------------------------------------------- | -------------------------------------------- | -------------------------------------------------- |
| `docs/constitution.md`（宪法/铁律）        | `config.yaml` 的 `context` + `rules`   | 把铁律抄进 config.yaml，让 AI 自动遵守             |
| `docs/roadmap.md`（8 功能域）              | `openspec/specs/<capability>/`             | 每个功能域一个 capability 目录                     |
| `docs/specs/_template`（三件套）           | `proposal.md` + `spec.md` + `tasks.md` | 口径对齐，plan↔proposal、spec↔spec、tasks↔tasks |
| `.dsh/skills/tdd-workflow`（TDD 自动触发） | `openspec-apply-change` + 红绿重构         | 实现阶段两者叠加：TDD 技能管代码，OpenSpec 管规格  |
| Vitest + Playwright                          | Scenario → 测试用例                         | 单元=Vitest，跨页=e2e=Playwright                   |
| VitePress 文档中心                           | `openspec/` 事实来源                       | docs 面向人，openspec 面向 AI                      |

---

*本文档由 DSH 生成，版本信息基于 2026 年检查时的 npm registry 快照（`@fission-ai/openspec@1.11.0`）。*
