---
layout: home
hero:
  name: farm-manage-system
  text: 农场管理系统
  tagline: 需求规范 · 技术方案 · 架构决策 — 单一事实来源
  actions:
    - theme: brand
      text: 项目宪法
      link: /constitution
    - theme: alt
      text: 开发路线图
      link: /roadmap

features:
  - icon: 📜
    title: 项目宪法
    details: 项目定位、架构原则、数据铁律、术语表 — 最高约束文件
    link: /constitution
  - icon: 🗺️
    title: 开发路线图
    details: 里程碑规划、功能域划分、阶段验收标准、依赖关系
    link: /roadmap
  - icon: 📋
    title: 功能规范
    details: 按功能域编号组织，每个域独立 spec + plan + tasks 三件套
    link: /specs/
  - icon: 🔧
    title: 技术方案
    details: 接口契约、数据库设计、组件结构、测试计划
    link: /plans/
  - icon: ✅
    title: 任务清单
    details: T 编号可勾选、0.5~2 天粒度、五态状态、commit 关联
    link: /tasks/
  - icon: 📝
    title: 变更提案
    details: 需求变更走提案，评审留痕，合并后才动代码
    link: /changes/
---

## 关于本项目

**farm-manage-system** 是一个农场管理 SaaS 系统，采用 **SDD（规范驱动开发）+ TDD（测试驱动开发）+ OpenSpec** 三合一流程。

本文档中心是项目的**唯一事实来源**——所有 AI 和人类开发者都从这里获取需求与设计信息。

## 快速开始

```bash
# 启动文档中心
cd docs && pnpm dev

# 构建静态站点
cd docs && pnpm build
```

## 文档层级

```
宪法(constitution.md) > 路线图(roadmap.md) > 功能规范(specs/) > 技术方案(plans/) > 任务清单(tasks/) > 代码
```