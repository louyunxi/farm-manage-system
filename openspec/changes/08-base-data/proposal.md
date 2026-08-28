# Proposal: 基础数据

## Why

基础数据（字典、品种、农资目录）是多数业务域的支撑件——域 02 农场资源、03 种植生产、05 投入品库存、06 质量安全都依赖统一的字典与目录。先立基础数据，后续域才能引用一致的枚举与档案。

## What Changes

- **字典管理**：平台级字典类型与字典项 CRUD（供全系统枚举/下拉引用）。
- **品种管理**：农作物品种库 CRUD（含作物类别、生育期等属性）。
- **农资目录**：农药/化肥等农资目录 CRUD（供库存域引用）。

## Capabilities

### New Capabilities

- `base-data`: 基础数据——字典管理、品种管理、农资目录。

### Modified Capabilities

（无）

## Impact

- **数据**：新增平台级表 `dict_type`、`dict_item`、`variety`、`input_catalog`（不注入 `tenant_id`，走多租户白名单）。
- **依赖**：被域 02/03/05/06/10 引用。
- **规范**：对应 `docs/roadmap.md` 域 08。
