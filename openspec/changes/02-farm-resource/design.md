# Design: 农场资源

## Context

核心实体域。地块是多边形 + 面积的计算闭环，是关键复杂度所在。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 农场/地块/批次三组 CRUD，地块支持 GIS 多边形 + 面积 + 校验。

**Non-Goals:**
- 不做空间查询（点面判断等，由客户端 Turf.js 承担，见 ADR-001）。
- 不做卫片/影像叠加。

## Decisions

### 1. 表结构（业务表，注入 tenant_id）

| 表 | 关键列 |
|----|--------|
| `farm` | `farm_id`(UUID)、name、`tenant_id`、addr、`is_deleted` |
| `plot` | `plot_id`(UUID)、`farm_id`、name、`geom`(GEOMETRY)、`geojson`(TEXT)、`area_mu`(decimal)、`tenant_id`、`is_deleted` |
| `batch` | `batch_id`(UUID)、`farm_id`/`plot_id`、name、batch_type(text+CHECK：种植/养殖)、`tenant_id`、`is_deleted` |

### 2. 多边形与面积

- 存两份：`geom`（MySQL GEOMETRY，留显示/未来扩展）+ `geojson`（TEXT，前端直接取用）。
- 面积 `area_mu`（亩）由前端地图 SDK 计算后随请求提交；**不**依赖 MySQL `ST_Area`（SRID 4326 返回平方度，不可用）。
- update 轮廓时：服务端用 **JTS** 校验 `isValid()`/`isSimple()`（挡自相交、未闭合），校验通过才接受面积重算。

### 3. API

- `/api/v1/farms`、`/api/v1/plots`、`/api/v1/batches`，统一响应体。
- 地块写入带 `geojson` + `area_mu`；服务端 JTS 解析校验后再落库。

### 4. 地图绘制（前端）

- Leaflet + 绘制插件；面积用 Turf.js `area()` 换算亩；3D 展示后续用 Cesium/MapLibre，不在本 change。

## Risks / Trade-offs

- **JTS 校验与前端绘制口径不一致** → 以 JTS `isValid()` 为准，前端保存前也用 Turf 预检。
- **面积精度** → 亩保留 2 位小数（`decimal(10,2)`），大面积地块误差可接受。
- **GEOMETRY 冗余** → 初期只读，不建空间索引，避免过早优化。
