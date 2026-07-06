# AGENTS.md — AI 私教 (AI Personal Trainer)

> AI 驱动的个人学习助手 PWA 应用。拍照上传试卷，AI 自动批改，构建个人专属知识图谱。

---

## 快速导航

| 文档 | 说明 |
|------|------|
| [后端](docs/agents/backend.md) | Python FastAPI、ORM 模型、API 路由、AI 服务、SMS 服务、管理员系统 |
| [前端](docs/agents/frontend.md) | React + TypeScript、组件、路由、状态管理、样式主题、PWA |
| [开发指南](docs/agents/dev-guide.md) | 启动命令、开发任务、调试、常见问题 |

---

## 项目概览

| 属性 | 值 |
|------|-----|
| **类型** | 全栈 Web 应用 + PWA |
| **语言** | 前端 TypeScript + React 19，后端 Python + FastAPI |
| **仓库结构** | Monorepo（`frontend/` + `backend/`） |
| **UI 语言** | 中文 |

### 核心流程

```
拍照上传试卷 → AI (Qwen Vision) 批改 → 错题本 → 重做3次正确 → 知识库图谱
```

### 关键约定速查

| 约定 | 值 |
|------|------|
| 主键格式 | UUID v4 字符串（36 字符） |
| 时间格式 | UTC ISO 8601 |
| API 前缀 | `/api` |
| 认证方式 | `Authorization: Bearer <jwt>` |
| 图片上传 | `multipart/form-data`，字段名 `file`，≤10MB |
| 移动端 | 最大 480px 宽度，竖屏 |
| 管理员 | 手机号 `15915907946`，`is_admin=True` |

---

## 文档维护规范

### 更新规则

- **新模块开发或旧模块逻辑改动时，必须同步更新 AGENTS.md 及对应子文档。**
- 涉及新增 API、新页面、新模型、配置变更、第三方服务集成时，更新对应章节。

### 拆分规则

- AGENTS.md 超过 **500 行**时，按模块拆分为 `docs/agents/<模块>.md`。
- AGENTS.md 自身缩减为模块导航页。
- 子文档命名：kebab-case（如 `docs/agents/backend.md`）。

---

## 页面风格规范

所有页面必须遵循统一风格：

| 元素 | 规范 |
|------|------|
| 主色 | `text-primary` / `bg-primary`，不硬编码 `#6366f1` |
| 容器 | `px-5 py-6`，480px 居中 |
| 卡片 | `rounded-2xl border border-border` |
| 主按钮 | `bg-primary text-white rounded-2xl py-4 font-semibold shadow-lg shadow-primary/25` |
| 次按钮 | `border border-border rounded-2xl py-4` |
| 输入框 | `px-5 py-5 rounded-2xl border border-border text-base` |
| 弹窗 | `fixed inset-0 z-50`，遮罩 `bg-black/40`，内容 `rounded-2xl p-6` |
| 空状态 | 居中 + 灰色图标 + 引导文字 + 操作按钮 |
| 图标 | lucide-react，18-24px |
