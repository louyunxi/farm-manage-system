# Design: 种植生产

## Context

农事批量是主从结构；种植计划联动投入品与成本，形成 03 ↔ 05 的跨域数据流。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 农事作业单 + 明细主从，支持单条与批量。
- 种植计划 + 投入品预估 + 成本预算。

**Non-Goals:**
- 不做物候期知识库（域 10 承担）。
- 成本预算不做财务级核算（宪法：不做财务系统）。

## Decisions

### 1. 农事主从模型

```
farm_operation（作业单）: operation_id, tenant_id, operation_type(text+CHECK), operate_date, weather, operator, remark
farm_operation_plot（明细）: operation_plot_id, operation_id, plot_id, dosage, area, photo
```

单条记录 = 一主一从；批量 = 一主多从。**理由**：统一模型，避免两套表。

### 2. 种植计划模型

`crop_plan`（计划：plot_id、variety_id、start_date、end_date、tenant_id）+ `plan_item`（投入品预估明细：input_catalog_id、quantity、unit）。

### 3. 成本预算

在 `plan_item` 上挂单价，汇总公式 `Σ(单价×用量) + 人工 + 机械`，金额 `decimal(10,2)`。跨域联动通过 service 接口调 05 库存目录，**禁止跨模块直接查表**（宪法 2.1）。

### 4. API

- `/api/v1/operations`（作业单含明细批量提交）、`/api/v1/crop-plans`（含预估与预算）。

## Risks / Trade-offs

- **批量提交部分失败** → 事务包裹，任一明细非法整体回滚。
- **跨域联动 05 未就绪** → 预估先以目录快照存 quantity，05 就绪后接领用/采购流。
- **成本口径漂移** → 只做预算参考，金额列与宪法精度一致 `decimal(10,2)`。
