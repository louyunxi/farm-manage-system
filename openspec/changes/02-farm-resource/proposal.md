# Proposal: 农场资源

## Why

农场、地块、批次是系统的核心业务实体，域 03 种植生产、04 采收、05 库存、09 设备接入都依赖它。必须先立起农场资源，业务操作才有归属对象。

## What Changes

- **农场管理**：农场 CRUD（多租户归属）。
- **地块管理**：地图多边形地块——Leaflet 绘制、GeoJSON 存储、面积由前端地图 SDK 计算、update 轮廓触发重算、服务端校验多边形合法性。
- **批次管理**：种植/养殖批次 CRUD。

## Capabilities

### New Capabilities

- `farm-resource`: 农场资源——农场、地图多边形地块、批次。

### Modified Capabilities

（无）

## Impact

- **数据**：新增 `farm`、`plot`（含 GEOMETRY/GeoJSON + 面积列）、`batch`，注入 `tenant_id`。
- **依赖**：依赖域 01（租户）、08（基础数据）；被 03/04/05/09 引用。
- **规范**：对应 `docs/roadmap.md` 域 02。
