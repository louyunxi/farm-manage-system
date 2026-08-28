# Design: 质量安全

## Context

合格证是技术含量最高的一块：动态模板 + 一证一码 + 服务端渲染 PNG + 扫码溯源。详见 proposal.md。

## Goals / Non-Goals

**Goals:**
- 检测记录、模板设计器、证书生成、溯源四件事。

**Non-Goals:**
- 模板设计器本 change 只定义数据契约与渲染链路，完整拖拽编辑器前端实现另列子任务。
- 不做检测设备对接。

## Decisions

### 1. 模板动态字段模型

```
cert_template: template_id, name, html, css, width_mm, height_mm, color_mode(text+CHECK), is_default, tenant_id
cert_field:    field_id, code, name, data_type, source(批次/地块/检测/固定文本)
cert_template_field: template_id, field_id, required, default_value
```

HTML 里用 `{{field.code}}` 占位；模板与字段多对多，实现"每个模板关联不同字段"。

### 2. 证书与溯源码

`certificate`: certificate_id, template_id, batch_id, trace_code(全局唯一、不可枚举), status, image_path(PNG), print_count, tenant_id。

溯源码生成用随机（如 ULID/随机 base32），**全局唯一**（公开页无租户上下文），一证一码。

### 3. 渲染链路

后端组装 HTML + 数据 → 调 `services/render`（Node + Playwright）`POST /render` → 返回 PNG → 存 `image_path` → 下发客户端打印。二维码用 ZXing 生成 PNG 嵌入模板。

### 4. 溯源

二维码内容 = `https://域名/trace/{trace_code}`，由域 07 公开页消费。

## Risks / Trade-offs

- **渲染并发/批量** → 渲染服务做队列限流，批量打印异步化，留 M2 细化。
- **溯源码被枚举** → 高熵随机码 + 访问限流（域 07）。
- **模板 XSS** → 模板内容服务端白名单过滤，渲染在隔离的无头浏览器上下文。
