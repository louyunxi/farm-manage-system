# Proposal: 设备接入

## Why

对接第三方物联网系统（非硬件直连），实现农场→物联网基地映射、服务端代理转发、客户端渲染与控制设备。

## What Changes

- **物联网基地**：农场→物联网基地映射表。
- **授权对接**：第三方系统 OAuth2/AppKey 授权对接。
- **设备台账**：传感器/农机档案。
- **数据转发**：服务端代理转发第三方服务，客户端渲染设备。
- **设备控制**：控制指令下发（授权 + 审计 + 幂等）。

## Capabilities

### New Capabilities

- `device-integration`: 设备接入——物联网基地、授权、设备台账、数据转发、设备控制。

### Modified Capabilities

（无）

## Impact

- **数据**：新增 `iot_base`、`iot_device`、`device_control_log`。
- **依赖**：依赖 01（授权）、02（农场）。
- **规范**：对应 `docs/roadmap.md` 域 09；边界符合宪法 1.2（第三方 API 对接，非硬件直连）。
