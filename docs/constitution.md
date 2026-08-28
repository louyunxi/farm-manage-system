# 项目宪法（Constitution）

> 本文档是 farm-manage-system 的**最高约束文件**。
> 所有 spec、plan、代码不得与宪法冲突。修改宪法必须走变更提案 + 评审。

---

## 一、项目定位

### 1.1 是什么
农场管理系统 SaaS，多租户架构，服务农场/农业企业的日常经营管理。

### 1.2 不是什么（边界）
| 不做 | 原因 |
|------|------|
| 通用 ERP | 超出农业场景 |
| 财务系统 | 独立系统，不耦合 |
| 电商交易 | 不做商城/支付 |
| IoT 硬件直连 | 硬件适配成本高，仅做数据接入 |
| 社交/社区 | 非核心场景 |

> 「IoT 硬件直连」指 MQTT/Modbus 等设备协议直连。通过第三方平台 API 的数据接入与设备控制（API 级指令下发）属于允许范围。

### 1.3 核心用户
- **农场主/管理员**：管理农场、人员、查看报表
- **技术员/操作员**：日常农事记录、地块管理

---

## 二、架构原则

### 2.1 模块化单体优先
- 单仓单部署，内部按业务域拆模块边界
- 跨模块通过 service 层接口调用，**禁止跨模块直接查表**
- 规模增长后再评估拆微服务

### 2.2 前后端分离
- 前端：Vue 3 + TypeScript + Vite
- 后端：Java / Spring Boot 3.x + JDK 21（详见 `docs/architecture/ADR-001`）
- 共享：`packages/shared` **只放类型与常量**，不放业务逻辑

### 2.3 API 优先
- 前后端通过 API 契约协作
- 接口变更先改契约文档（plan.md），再改实现
- 统一响应体：`{ code, message, data }`

### 2.4 外部依赖接口化
- 存储、短信、支付等外部依赖做成接口 + 适配层
- 本地 mock 实现起步，云实现可平替
- 环境变量切换，本地开发零外部依赖

---

## 三、数据原则

### 3.1 主键
- 统一使用 UUID
- 主键名 `*_id`（禁裸 `id`）
- 主键名与跨表引用列名一致

### 3.2 时间
- 统一 UTC 存储（MySQL `DATETIME` 存 UTC）
- 展示层转本地时区

### 3.3 软删除
- 核心档案表支持软删除（`is_deleted`）
- 业务流水表只增不改不删

### 3.4 枚举
- 枚举值落 `text` + CHECK 约束
- 值集与 spec 一致
- 禁止 int 编码枚举

### 3.5 精度
- 金额/数量：`decimal(10,2)`
- 比率：`decimal(5,2)`
- 禁止 float/double 存钱或检测值

---

## 四、术语表

> 所有 spec、plan、代码、对话必须使用标准术语。**禁止使用禁用别名。**

| 标准术语 | 英文 | 禁用别名 | 说明 |
|----------|------|----------|------|
| 农场 | farm | 养殖场、基地、园区 | 核心业务实体 |
| 地块 | plot | 田地、片区、区域 | 农场下的地理分区 |
| 批次 | batch | 批号、生产批次 | 种植/养殖批次 |
| 农事 | farm_log | 农活、作业、农事操作 | 农事操作记录 |
| 租户 | tenant | 商户、企业、客户 | 多租户隔离单元 |
| 员工 | employee | 工人、职工、人员 | 租户下的人员 |
| 种植计划 | crop_plan | 种植安排、生产计划 | 地块×作物×时段的排产 |
| 物联网基地 | iot_base | 基地、IoT 基地 | 农场对接的第三方物联网基地 |
| 设备 | device | 机器、装置 | 接入的传感器/农机设备 |
| 传感器 | sensor | 探头、探测器 | 采集环境数据的设备 |
| 农机 | machine | 机械、农机具 | 农业机械设备 |
| 合格证 | certificate | 证书、合格凭证 | 食用农产品合格证 |
| 溯源码 | trace_code | 二维码、溯源码 | 合格证唯一码，指向溯源页 |
| 物候期 | phenology | 生育期、生长期 | 作物生长阶段 |
| 知识库 | knowledge_base | KB、知识文档 | AI 检索的知识集合 |
| 检测 | inspection | 质检、检验 | 农残等质量检测 |

> 术语表随项目演进而更新。新增术语必须在 spec 中登记，评审通过后加入宪法。

---

## 五、SDD 约束

### 5.1 优先级链路
```
宪法 > Spec > Plan > Task > 代码
```

### 5.2 变更流程（双轨）

```
需求变更
├─ 宪法级/跨域 → docs/changes/ 提案 → 评审 → 合并 → 同步 openspec
└─ 域内功能   → openspec change（proposal/specs/design/tasks）→ apply(TDD) → archive
```

### 5.3 开发流程（映射 OpenSpec）

```
Specify（写规范）     → proposal.md + specs/**/spec.md
Plan（技术规划）      → design.md
Task（任务分解）      → tasks.md
Implement（TDD 实现） → openspec apply（红 → 绿 → 重构）
```

### 5.4 文档层级（双源）

| 层 | 权威事实源 | 人类导航/详述 | 回答 | 稳定性 |
|---|---|---|---|---|
| 宪法 | `docs/constitution.md` | 同左 | 不可变原则 | 最高，走提案 |
| 里程碑 | `docs/roadmap.md` | 同左 | 分几阶段 | 走提案 |
| 架构决策 | `docs/architecture/ADR-*.md` | 同左 | 技术选型为什么 | 评审后冻结 |
| 变更 | `openspec/changes/<name>/` | `docs/changes/`（仅宪法级/跨域） | 为什么改 | 临时，archive 后合并 |
| 规范 | `openspec/specs/` | `docs/specs/` | 做什么 | 归档后冻结 |
| 规划 | `openspec/changes/<name>/design.md` | `docs/plans/` | 怎么做 | 评审后冻结 |
| 任务 | `openspec/changes/<name>/tasks.md` | `docs/tasks/` | 做到哪了 | 高频更新 |

### 5.5 OpenSpec 集成

OpenSpec 是本项目的「变更 + 规格 + 任务」机器校验层，与 `docs/` 人类导航层深度融合：

| 关注点 | OpenSpec（机器校验，权威） | docs（人类导航/详述） |
|---|---|---|
| 行为规格 | `openspec/specs/`：`### Requirement` + `#### Scenario`（WHEN/THEN） | `docs/specs/`：用户故事 + AC + 数据模型 + 业务流程 |
| 变更提案 | `openspec/changes/<name>/`：proposal.md、specs/、design.md、tasks.md | `docs/changes/`：仅宪法级/跨域提案 |
| 技术规划 | design.md | `docs/plans/` |
| 任务清单 | tasks.md（`- [ ] X.Y`） | `docs/tasks/`（`T-<域编号>-<序号>`，提交引用） |

规则：
- 域内功能开发 MUST 走 OpenSpec：`openspec new change` → proposal → specs → design → tasks → `openspec apply`（TDD）→ `openspec archive`（delta 合并进 `openspec/specs/`）。
- 宪法/roadmap/跨域变更 MUST 走 `docs/changes/` 提案，评审通过后同步 `openspec/`。
- OpenSpec 生成的 artifact MUST 遵守本宪法（架构原则/数据原则/术语表）；约束经 `openspec/config.yaml` 的 `context` 注入。
- 双表达一致性：`docs/specs/` 的 AC 与 `openspec/specs/` 的 Scenario MUST 一一对应，任一变更需同步两处。

---

## 六、质量门禁

| 门禁 | 说明 |
|------|------|
| Lint | `pnpm lint` 零错误 |
| Typecheck | `pnpm typecheck` 零错误 |
| 测试 | 新功能必须有测试，测试先于实现（TDD） |
| AC 自查 | 每个 Task 完成后对照 AC 逐条勾选 |
| 提交 | Conventional Commits，引用 T 编号 |

---

## 七、版本

| 版本 | 日期 | 变更 |
|------|------|------|
| v1.0 | 2026-08-21 | 初始宪法，确立项目定位、架构原则、数据原则、术语表、SDD 约束 |
| v1.1 | 2026-08-27 | 集成 OpenSpec：变更/规格/任务双轨与映射、文档层级双源化 |
| v1.2 | 2026-08-27 | 数据原则对齐 MySQL（DATETIME 存 UTC）、后端定 Java/Spring Boot、IoT 边界澄清、术语表补 10 词 |