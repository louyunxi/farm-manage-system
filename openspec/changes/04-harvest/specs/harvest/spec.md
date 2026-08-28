## Purpose

记录采摘批次与产量，提供按地块、批次、作物的产量统计，为溯源与报表提供数据源。

## ADDED Requirements

### Requirement: 采收记录

系统 SHALL 支持采收记录，记录 MUST 关联批次或地块，并包含采收日期与产量。

#### Scenario: 录入采收记录

- **WHEN** 用户录入采收的批次/地块、日期与产量
- **THEN** 系统保存采收记录并返回其唯一标识

### Requirement: 产量统计

系统 SHALL 支持按地块、批次、作物统计产量。

#### Scenario: 按批次统计产量

- **WHEN** 用户按批次查询产量
- **THEN** 系统返回该批次的累计产量
