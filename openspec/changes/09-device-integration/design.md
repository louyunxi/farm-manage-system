# Design: 设备接入

## Context

集成域：第三方异构系统，需设备模型抽象与代理层。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 基地映射、授权、设备台账、代理转发、控制指令。

**Non-Goals:**
- 不做硬件协议直连（MQTT/Modbus），只做第三方 API 对接（宪法 1.2）。

## Decisions

### 1. 核心表

| 表 | 关键列 |
|----|--------|
| `iot_base` | `iot_base_id`、farm_id、name、provider、auth_config(加密)、tenant_id |
| `iot_device` | `iot_device_id`、iot_base_id、name、device_type(text+CHECK)、external_id、tenant_id |
| `device_control_log` | control_log_id、iot_device_id、command、status、idempotency_key(唯一)、operator、tenant_id |

### 2. 设备模型抽象

第三方各家接口不同，后端定义统一 `DeviceProvider` 接口（拉状态/发指令），每家做适配实现。业务层只依赖接口，不感知第三方差异。

### 3. 控制指令安全

- **授权**：指令下发前校验当前用户对该基地/设备的权限。
- **幂等**：`idempotency_key` 唯一，重复请求返回原结果，不重复下发。
- **审计**：每条指令落 `device_control_log`。
- **防 SSRF**：代理转发目标仅限已登记基地的域名/白名单。

### 4. API

`/api/v1/iot-bases`、`/api/v1/iot-devices`、`/api/v1/iot-devices/{id}/status`、`/api/v1/iot-devices/{id}/control`。

## Risks / Trade-offs

- **第三方接口不稳定** → 超时/重试 + 状态异步回调。
- **凭证泄露** → 加密存储 + 最小权限，不落明文日志。
- **控制误操作** → 高危指令二次确认（与 AI 域一致的人机确认原则）。
