## Purpose

提供首页 AI Agent 问答与工具调用能力，支撑双层知识库检索与基于物候期的种养建议推送。

## ADDED Requirements

### Requirement: Agent 对话与工具调用

系统 SHALL 支持对话式问答，Agent MUST 能分析需求并调用内部接口完成操作；凡写库/打印/控制等有副作用的操作 MUST 先经用户二次确认。

#### Scenario: 一句话创建农事记录

- **WHEN** 用户说「今天给 3 号地打了一次药」
- **THEN** Agent 解析出操作意图与参数，经用户确认后调用农事接口完成记录

#### Scenario: 副作用需确认

- **WHEN** Agent 拟执行写库/打印/控制等操作
- **THEN** 系统先展示将执行的操作与参数，用户确认后才真正执行

### Requirement: 系统知识库

系统 SHALL 提供平台级共享知识库，所有租户 MUST 可检索。

#### Scenario: 检索系统知识

- **WHEN** 用户询问平台知识库中的问题
- **THEN** 系统返回系统知识库的检索结果

### Requirement: 农场专有知识库

系统 SHALL 支持每农场建立专有知识库，检索 MUST 按租户隔离。

#### Scenario: 跨租户知识不可见

- **WHEN** 租户 A 检索知识
- **THEN** 系统仅返回系统知识库与租户 A 专有知识库的结果，不含其他租户

### Requirement: 物候期推荐

系统 SHALL 结合当前种植计划的作物与物候期知识库，推送当前时机的种养建议。

#### Scenario: 推送种养建议

- **WHEN** 某种植计划的作物进入某物候期
- **THEN** 系统生成对应建议并推送给该租户
