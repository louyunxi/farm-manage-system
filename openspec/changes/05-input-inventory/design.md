# Design: 投入品库存

## Context

库存按宪法 3.3「业务流水只增不改不删」建模。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 出入库流水 + 实时库存查询。

**Non-Goals:**
- 不做采购/财务结算（宪法：不做财务系统）。
- 不做多仓/调拨的复杂拓扑（单仓起步）。

## Decisions

### 1. 流水模型（只增不改）

`input_stock`：`stock_flow_id`(UUID)、`input_catalog_id`、`batch_no`、`expire_date`、flow_type(text+CHECK：入库/出库)、quantity(decimal)、unit_price(decimal)、`tenant_id`、created_at。

- 出入库都是**新增一行流水**，不改历史行。
- 库存 = `Σ(入库) - Σ(出库)`，查询时聚合，不存冗余库存列（避免不一致）。

### 2. 出库校验

出库前校验 `可用库存 ≥ 出库数量`，不足则拒绝。在事务内锁定校验，防并发超卖。

### 3. 批次效期

档案/流水带 `batch_no` + `expire_date`，库存查询返回临近效期批次供预警。

### 4. API

- `/api/v1/input-stocks`（流水列表）、`/api/v1/input-stocks/inbound`、`/api/v1/input-stocks/outbound`、`/api/v1/input-stocks/balance`。

## Risks / Trade-offs

- **并发超卖** → 事务 + 行锁校验库存。
- **聚合查询性能** → 初期数据量小，直接聚合；量大再加库存快照表。
- **效期预警口径** → 先做查询返回，主动通知留后续。
