# Design: 基础数据

## Context

基础数据是平台级共享数据，与租户业务数据不同——多租户插件（`TenantLineHandler`）默认给业务表注入 `tenant_id`，而基础数据表必须排除在外。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 字典、品种、农资目录三组 CRUD API，统一响应体 `{ code, message, data }`。
- 平台级数据不随租户隔离。

**Non-Goals:**
- 不做字典的租户级扩展（租户自定义字典项，留待后续需求）。
- 不做品种/农资目录的批量导入（Excel 等，留后续）。

## Decisions

### 1. 平台级数据走多租户白名单

`dict_type`、`dict_item`、`variety`、`input_catalog` 加入 `TenantLineHandler` 白名单，查询/写入不注入 `tenant_id`。**理由**：这些是平台共享数据；备选"每租户复制一份"——放弃，冗余且难维护。

### 2. 表结构（遵循宪法数据原则）

| 表 | 关键列 |
|----|--------|
| `dict_type` | `dict_type_id`(UUID)、code、name、`is_deleted` |
| `dict_item` | `dict_item_id`(UUID)、`dict_type_id`、code、label、sort、`is_enabled`、`is_deleted` |
| `variety` | `variety_id`(UUID)、name、crop_category(text+CHECK)、phenology_days、`is_deleted` |
| `input_catalog` | `input_catalog_id`(UUID)、name、category(text+CHECK：农药/化肥/种子/其他)、spec、unit、`is_deleted` |

- 主键 UUID、列名 `*_id`；枚举 `text`+CHECK；时间 UTC 存 `DATETIME`。
- `dict_item` 用 `is_enabled` 表示启停，区别于 `is_deleted` 软删除。

### 3. API 约定

- 前缀 `/api/v1`：`/dicts`（含类型与项）、`/varieties`、`/input-catalogs`。
- 枚举字段（作物类别、农资类别）在字典表预置，前端下拉从字典取。

### 4. 缓存（留后）

字典高频读取，后续可用 Redis 缓存；M1 直接查库，不提前引入缓存复杂度。

## Risks / Trade-offs

- **白名单误伤** → 单测覆盖：断言基础数据表查询不携带 `tenant_id` 条件。
- **字典项被业务表引用后停用** → 停用不删除（`is_enabled=false`），保留历史引用完整性。
- **品种生育期字段口径** → 与域 10 物候期知识库对齐，字段名 `phenology_days` 先做占位，后续 spec 细化。
