# <编号>-<功能域名称> — 技术方案

> 版本：v1.0 | 最后更新：YYYY-MM-DD | 对应 spec：docs/specs/<编号>-<域名>/spec.md

## 变更历史

| 版本 | 日期 | 变更说明 |
|------|------|----------|
| v1.0 | YYYY-MM-DD | 初始版本 |

---

## 1. 接口契约

### 1.1 API 列表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| GET | /api/v1/xxx | 列表查询 | 需要 |
| POST | /api/v1/xxx | 创建 | 需要 |
| PUT | /api/v1/xxx/:id | 更新 | 需要 |
| DELETE | /api/v1/xxx/:id | 删除 | 需要 |

### 1.2 请求/响应示例

```json
// GET /api/v1/xxx
// Response
{
  "code": "00000",
  "message": "success",
  "data": {
    "list": [],
    "total": 0,
    "page": 1,
    "pageSize": 20
  }
}
```

---

## 2. 数据库变更

### 2.1 新增表

```sql
CREATE TABLE xxx (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

### 2.2 变更表

```sql
ALTER TABLE xxx ADD COLUMN yyy TEXT;
```

### 2.3 索引

```sql
CREATE INDEX idx_xxx_yyy ON xxx(yyy);
```

---

## 3. 前端设计

### 3.1 路由

| 路径 | 组件 | 权限 | 说明 |
|------|------|------|------|
| /xxx | XxxPage | xxx:view | 列表页 |
| /xxx/:id | XxxDetail | xxx:view | 详情页 |

### 3.2 组件树

```
XxxPage
├── SearchBar
├── DataTable
│   └── ActionColumn
└── CreateModal / EditModal
```

### 3.3 状态管理

| 状态 | 类型 | 说明 |
|------|------|------|
| | | |

---

## 4. 测试计划

### 4.1 单元测试

| 测试对象 | 场景 | 预期 |
|----------|------|------|
| | | |

### 4.2 E2E 测试

| 场景 | 步骤 | 预期 |
|------|------|------|
| | | |

---

## 5. 实现顺序

1. 数据库迁移
2. 后端接口 → 单元测试
3. 前端页面 → 组件测试
4. 联调 → E2E 测试
5. 验收 → 勾选 AC