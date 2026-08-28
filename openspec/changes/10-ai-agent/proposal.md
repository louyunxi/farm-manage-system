# Proposal: AI 智能体

## Why

在客户端首页提供 AI Agent：问答分析需求并调用内部接口（一句话完成农事记录/打印合格证），叠加双层知识库（系统级 + 每农场专有）与物候期推荐，提升经营效率。

## What Changes

- **Agent 对话**：问答分析需求 + 工具调用。
- **系统知识库**：平台级共享知识库。
- **农场专有知识库**：租户级知识库（隔离）。
- **物候期推荐**：种植计划 × 作物物候期知识库 → 推送种养建议。

## Capabilities

### New Capabilities

- `ai-agent`: AI 智能体——Agent 对话、双层知识库、物候期推荐。

### Modified Capabilities

（无）

## Impact

- **依赖**：Spring AI（主干）/ LangChain4j（备选）、国产 LLM、向量库（Qdrant/Milvus）、MCP 工具。
- **数据**：新增知识库文档、向量索引、推荐记录。
- **规范**：对应 `docs/roadmap.md` 域 10；遵守 ADR-001 的 AI 护栏。
