# Design: 采收与产后

## Context

轻量域：采收记录 + 产量聚合。详见 proposal.md。

## Goals / Non-Goals

**Goals:** 采收记录与产量统计。

**Non-Goals:** 不做销售/物流（宪法：不做电商）。

## Decisions

### 1. 表结构

`harvest`: harvest_id(UUID)、batch_id/plot_id、harvest_date、quantity(decimal)、unit、tenant_id、is_deleted。

### 2. 产量统计

按 batch_id 聚合 `SUM(quantity)`；按作物经批次关联品种后二次聚合。

### 3. API

`/api/v1/harvests`（记录）、`/api/v1/harvests/stats`（统计）。

## Risks / Trade-offs

- **统计跨域查品种** → 经 service 接口查 08，不跨模块查表（宪法 2.1）。
