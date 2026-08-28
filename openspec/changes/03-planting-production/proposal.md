# Proposal: 种植生产

## Why

农事记录是农场的核心日常操作，种植计划是生产排程。农事需支持批量（作业单 + 明细），种植计划需联动投入品预估与成本预算。

## What Changes

- **农事记录**：在地块/批次上记录农事，支持批量（作业单 + 明细主从）。
- **农事列表**：按地块/批次/时间筛选。
- **种植计划**：地块×作物×时段排产。
- **投入品预估**：计划生成农资用量预估，联动域 05。
- **成本预算**：农资单价×用量 + 人工/机械。

## Capabilities

### New Capabilities

- `planting-production`: 种植生产——农事记录（批量）、种植计划、投入品预估、成本预算。

### Modified Capabilities

（无）

## Impact

- **数据**：新增 `farm_operation`、`farm_operation_plot`、`crop_plan`、`plan_item`。
- **依赖**：依赖 02（地块/批次）、08（品种/农资目录）、05（库存联动）。
- **规范**：对应 `docs/roadmap.md` 域 03。
