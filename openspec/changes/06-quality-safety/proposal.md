# Proposal: 质量安全

## Why

质量安全是"产到销到溯源"闭环的终点：检测记录 + 合格证打印 + 扫码溯源。合格证需一证一码、动态模板、服务端渲染 PNG 下发打印。

## What Changes

- **检测记录**：农残等质量检测记录。
- **模板设计器**：可视化拖拽设计合格证模板（HTML/CSS，纸张宽高 + 彩色标记）。
- **证书生成**：一证一码、服务端渲染 PNG 下发打印。
- **二维码溯源**：扫码跳公开溯源页。

## Capabilities

### New Capabilities

- `quality-safety`: 质量安全——检测记录、合格证模板、证书生成、二维码溯源。

### Modified Capabilities

（无）

## Impact

- **数据**：新增 `inspection`、`cert_template`、`cert_field`、`cert_template_field`、`certificate`。
- **依赖**：依赖 02（批次）、05（库存）、07（溯源页）；调用 `services/render`。
- **规范**：对应 `docs/roadmap.md` 域 06。
