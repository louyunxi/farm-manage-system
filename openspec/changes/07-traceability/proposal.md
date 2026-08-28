# Proposal: 溯源展示

## Why

合格证二维码需指向一个公开、无鉴权的溯源页，向消费者展示产地、地块、农事与检测信息。这是质量安全的对外出口。

## What Changes

- **公开溯源页**：按溯源码无鉴权展示产地/地块/农事/检测。

## Capabilities

### New Capabilities

- `traceability`: 溯源展示——公开溯源页。

### Modified Capabilities

（无）

## Impact

- **数据**：只读，复用 02/03/04/06 的数据。
- **依赖**：依赖 06（溯源码）。
- **规范**：对应 `docs/roadmap.md` 域 07。
