# Proposal: 采收与产后

## Why

采收是"产到销"的衔接点，产量统计为溯源与报表提供数据源。依赖域 02 的批次与地块。

## What Changes

- **采收记录**：采摘批次/产量记录。
- **产量统计**：按地块/批次/作物统计。

## Capabilities

### New Capabilities

- `harvest`: 采收与产后——采收记录、产量统计。

### Modified Capabilities

（无）

## Impact

- **数据**：新增 `harvest`（关联批次/地块、产量）。
- **依赖**：依赖 02（批次/地块）、08（品种）；被 06/07 引用。
- **规范**：对应 `docs/roadmap.md` 域 04。
