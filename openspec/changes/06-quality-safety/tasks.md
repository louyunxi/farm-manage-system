# Tasks: 质量安全

## 1. 数据模型

- [ ] 1.1 建表 `inspection`、`cert_template`、`cert_field`、`cert_template_field`、`certificate`；验证 DDL 可执行

## 2. 检测与模板 API

- [ ] 2.1 实现检测记录 CRUD；验证单测通过（对应 spec 检测场景）
- [ ] 2.2 实现模板 CRUD 与字段关联；验证单测通过（对应 spec 模板场景）

## 3. 证书与渲染

- [ ] 3.1 实现溯源码生成（全局唯一、高熵）；验证唯一性测试
- [ ] 3.2 实现证书生成链路：组装 HTML → 调 render 服务 → 存 PNG；验证 PNG 产物与落库
- [ ] 3.3 实现证书下载/打印下发接口；验证返回 PNG 图片

## 4. 前端与验收

- [ ] 4.1 `apps/web` 检测记录页与模板管理页；验证闭环
- [ ] 4.2 模板拖拽设计器（可视化，输出 HTML/CSS）；验证保存的 HTML/CSS 可渲染
- [ ] 4.3 后端 TDD 全绿；验证 `mvn test` 通过
- [ ] 4.4 端到端验收：与 spec 全部 Scenario 一致
