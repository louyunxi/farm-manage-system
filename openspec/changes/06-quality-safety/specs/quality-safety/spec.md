## Purpose

提供检测记录、合格证模板设计、证书生成与二维码溯源，支撑食用农产品合格证的一证一码打印闭环。

## ADDED Requirements

### Requirement: 检测记录

系统 SHALL 支持农残等质量检测记录的录入与查看。

#### Scenario: 录入检测记录

- **WHEN** 用户录入检测项目、结果与批次信息
- **THEN** 系统保存检测记录并返回其唯一标识

### Requirement: 合格证模板设计器

系统 SHALL 支持可视化拖拽设计合格证模板，模板 MUST 以 HTML/CSS 形式存储，并 MUST 记录纸张宽高与彩色标记。

#### Scenario: 设计并保存模板

- **WHEN** 用户在拖拽设计器中排版字段/二维码并保存
- **THEN** 系统保存模板的 HTML/CSS、纸张宽高与彩色标记

### Requirement: 证书生成与打印

系统 SHALL 支持一证一码生成证书，服务端 MUST 渲染 PNG 图片下发客户端打印，每张证 MUST 拥有唯一溯源码。

#### Scenario: 生成证书

- **WHEN** 用户选择模板与批次发起打印
- **THEN** 系统为每张证生成唯一溯源码并渲染 PNG 图片返回

### Requirement: 二维码溯源

系统 SHALL 使证书二维码指向公开溯源页，扫码 MUST 能打开对应证书的溯源信息。

#### Scenario: 扫码溯源

- **WHEN** 用户扫描证书二维码
- **THEN** 系统跳转到公开溯源页并展示该证书关联的产地/批次/检测信息
