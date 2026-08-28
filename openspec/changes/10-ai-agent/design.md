# Design: AI 智能体

## Context

横向能力域，横跨农事/合格证/库存。LLM + 工具调用 + 双层 RAG + 物候期推送。详见 proposal.md 与 ADR-001。

## Goals / Non-Goals

**Goals:**
- Agent 对话 + 工具调用、双层知识库、物候期推荐。

**Non-Goals:**
- 不做多 Agent 编排（LangGraph 等，留后续）。
- 不做模型训练/微调。

## Decisions

### 1. 技术选型（对齐 ADR-001）

- 框架：**Spring AI**（主干），LangChain4j 备选。
- 模型：OpenAI 兼容接口接国产模型（DeepSeek/通义/GLM），Provider 抽象可切换。
- 向量库：Qdrant（初期）/ Milvus（规模化），按 `tenant_id` 过滤。
- 工具：Function Calling + MCP，把农事/合格证/库存接口封装为工具。

### 2. 双层知识库

- 系统知识库：`kb_doc`（tenant_id 为空，全局）。
- 农场专有知识库：`kb_doc`（tenant_id 非空）。
- 向量索引带 `tenant_id` 元数据，检索时强制过滤。

### 3. 副作用护栏

- 工具分「读」与「写」两类；写类（记农事/打印合格证/控制设备）先返回拟执行计划，用户确认后再执行。
- 工具参数用 JSON Schema 强约束，后端二次校验。

### 4. 物候期推荐

定时任务扫描 `crop_plan` × 品种物候期 → 匹配知识库建议 → 生成推荐记录 → 站内通知。不实时调用 LLM（降成本），建议文本可模板化或 LLM 润色（可选）。

## Risks / Trade-offs

- **幻觉写脏数据** → 写操作强制 human-in-the-loop + JSON Schema 校验。
- **租户越权** → 向量检索与工具调用全程带 `tenant_id`。
- **成本失控** → 按租户 token 配额 + 限流；物候期推荐用定时批处理。
- **上下文超限** → 工具结果摘要后注入，不全量塞入。
