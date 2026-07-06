# AGENTS.md — AI 私教 (AI Personal Trainer)

> AI 驱动的个人学习助手 PWA 应用。拍照上传试卷，AI 自动批改，构建个人专属知识图谱。

---

## 项目概览

| 属性 | 值 |
|------|-----|
| **类型** | 全栈 Web 应用 + PWA |
| **语言** | 前端 TypeScript，后端 Python |
| **仓库结构** | Monorepo（`frontend/` + `backend/`） |
| **主要用户语言** | 中文（所有 UI 文本、API 错误消息、注释均为中文） |

### 核心业务流程

```
用户拍照上传试卷 → AI (Qwen Vision) 识别题目并批改
    → 错题自动收集到「错题本」
    → 重做连续 3 次正确 → 移入「知识库」
    → 知识点自动构建 D3.js 网状图谱
```

---

## 技术栈

### 前端 (`frontend/`)

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | React | 19 |
| 构建工具 | Vite | 8 |
| 类型系统 | TypeScript | 6.0 |
| 样式 | TailwindCSS | 4（CSS-based `@theme` 配置） |
| 状态管理 | Zustand | 5 |
| 路由 | React Router DOM | 7 |
| HTTP 客户端 | Axios | — |
| 图标 | Lucide React | — |
| 图可视化 | D3.js Force Simulation | 7 |
| PWA | vite-plugin-pwa | — |
| Linter | Oxlint | — |

### 后端 (`backend/`)

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | FastAPI | 0.115 |
| ASGI 服务器 | Uvicorn | 0.30.6 |
| ORM | SQLAlchemy（async） | 2.0 |
| 数据库（开发） | SQLite + aiosqlite | — |
| 数据库（生产） | PostgreSQL + asyncpg | 16 |
| 迁移 | Alembic | 1.13 |
| 认证 | JWT（python-jose） | — |
| 配置管理 | Pydantic Settings | 2.9 |
| AI 服务 | 通义千问 Qwen Vision API | `qwen-vl-max` |
| HTTP 客户端 | httpx | 0.27 |
| 图片处理 | Pillow | 10.4 |

### 基础设施

| 工具 | 用途 |
|------|------|
| Docker Compose | PostgreSQL + 后端容器编排 |
| GitHub Actions | （未配置，可扩展） |

---

## 目录结构

```
ai-personal-trainer/
├── AGENTS.md                          # 本文档
├── README.md                          # 用户文档
├── .gitignore                         # Git 忽略规则
├── docker-compose.yml                 # Docker 编排（db + backend）
│
├── frontend/                          # React PWA 前端
│   ├── index.html                     # 入口 HTML
│   ├── vite.config.ts                 # Vite 配置（含 PWA、代理）
│   ├── tsconfig.json                  # TypeScript 配置
│   ├── package.json                   # 前端依赖
│   ├── public/                        # 静态资源（PWA 图标、manifest）
│   └── src/
│       ├── main.tsx                   # React 入口
│       ├── App.tsx                    # 根组件 + 路由定义
│       ├── index.css                  # TailwindCSS 入口 + 主题变量
│       ├── api/
│       │   └── client.ts              # Axios 实例 + API 函数
│       ├── components/                # 可复用组件
│       │   ├── BottomNav.tsx          # 底部导航栏
│       │   ├── CameraCapture.tsx      # 相机/相册拍照
│       │   ├── KnowledgeGraph.tsx     # D3.js 知识图谱
│       │   └── QuestionCard.tsx       # 题目卡片
│       ├── pages/                     # 页面组件（每个路由一个文件）
│       │   ├── Login.tsx
│       │   ├── Home.tsx
│       │   ├── Upload.tsx
│       │   ├── ExamResult.tsx
│       │   ├── WrongQuestions.tsx
│       │   ├── RedoQuestion.tsx
│       │   ├── KnowledgeBase.tsx
│       │   ├── KnowledgeDetail.tsx
│       │   └── Search.tsx
│       └── stores/                    # Zustand 状态管理
│           ├── authStore.ts           # 认证状态（token、用户信息）
│           ├── examStore.ts           # 试卷状态
│           └── knowledgeStore.ts      # 知识库状态
│
└── backend/                           # FastAPI 后端
    ├── .env                           # 环境变量（⚠️ 不入版本库）
    ├── .env.example                   # 环境变量模板
    ├── requirements.txt               # Python 依赖
    ├── Dockerfile                     # 后端容器镜像
    ├── alembic.ini                    # Alembic 配置
    ├── alembic/                       # 数据库迁移
    │   ├── env.py                     # 异步迁移配置
    │   └── versions/                  # 迁移脚本
    └── app/
        ├── main.py                    # FastAPI 入口、中间件、路由注册
        ├── api/                       # 路由层（Router）
        │   ├── auth.py                # 认证 /api/auth/*
        │   ├── exams.py               # 试卷 /api/exams/*
        │   ├── wrong_questions.py     # 错题 /api/wrong-questions/*
        │   └── knowledge.py           # 知识库 /api/knowledge/*
        ├── core/                      # 核心基础设施
        │   ├── config.py              # Pydantic Settings 配置
        │   ├── database.py            # 异步引擎 + 会话工厂
        │   └── security.py            # JWT 工具函数
        ├── models/                    # SQLAlchemy ORM 模型
        │   ├── base.py                # Base 类 + 工具函数
        │   ├── user.py                # 用户模型
        │   ├── exam.py                # 试卷 + 题目模型
        │   ├── wrong_question.py      # 错题模型
        │   └── knowledge.py           # 知识点 + 关系模型
        ├── schemas/                   # Pydantic 请求/响应模型
        │   ├── auth.py
        │   ├── exam.py
        │   ├── wrong_question.py
        │   └── knowledge.py
        ├── services/                  # 业务逻辑层
        │   ├── ai_service.py          # Qwen Vision API 集成
        │   ├── exam_service.py        # 试卷处理流程
        │   ├── wrong_q_service.py     # 错题重做逻辑
        │   └── knowledge_service.py   # 知识图谱构建
        └── uploads/                   # 上传图片存储（⚠️ 不入版本库）
```

---

## 启动与开发命令

### 本地开发（推荐）

```bash
# 后端
cd backend
cp .env.example .env           # 首次需要创建 .env
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端（另开终端）
cd frontend
npm install                    # 首次需要
npm run dev                    # 默认端口 5173，API 请求代理到 localhost:8000
```

### Docker 启动

```bash
export AI_API_KEY=your_key
docker-compose up -d           # 启动 PostgreSQL + 后端
```

### 常用命令速查

| 命令 | 说明 |
|------|------|
| `cd frontend && npm run dev` | 启动前端开发服务器 |
| `cd frontend && npm run build` | 构建生产版本 |
| `cd frontend && npm run lint` | Oxlint 检查 |
| `cd backend && uvicorn app.main:app --reload` | 启动后端（热重载） |
| `cd backend && alembic upgrade head` | 运行数据库迁移 |
| `cd backend && alembic revision --autogenerate -m "msg"` | 生成新迁移 |
| `docker-compose up -d` | Docker 启动全部服务 |

### 开发模式特殊行为

- 验证码固定为 `1234`，任意手机号可登录（自动创建账号）
- 未配置 `AI_API_KEY` 时，AI 批改使用内置 Mock 数据
- CORS 允许所有来源（`allow_origins=["*"]`）
- SQLite 数据库在启动时自动建表（lifespan hook）

---

## 架构设计

### 分层架构（后端）

```
请求 → API Router (api/*.py)
          ↓
     Service 层 (services/*.py)   ← 业务逻辑
          ↓
     Model 层 (models/*.py)       ← ORM 模型
          ↓
     Database (core/database.py)  ← 异步会话
```

**关键约束**：
- Router 不直接操作数据库，通过 Service 层调用
- Service 接收 `AsyncSession` 参数，不自行创建会话
- 所有路由通过 `Depends(get_current_user)` 验证 JWT 身份
- 请求/响应使用 Pydantic Schema 定义，与 ORM Model 分离

### 前端状态流

```
用户操作 → Page 组件 → Zustand Store → API Client (Axios) → 后端
                ↑                                           ↓
                └──── Store 更新 ← API 响应 ←──────────────┘
```

### API 路由表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/send-code` | 发送验证码 | ❌ |
| POST | `/api/auth/login` | 验证码登录 | ❌ |
| POST | `/api/exams/upload` | 上传试卷图片 | ✅ |
| GET | `/api/exams` | 试卷列表 | ✅ |
| GET | `/api/exams/:id` | 试卷详情 | ✅ |
| GET | `/api/wrong-questions` | 错题列表 | ✅ |
| GET | `/api/wrong-questions/:id` | 错题详情 | ✅ |
| POST | `/api/wrong-questions/:id/redo` | 提交重做 | ✅ |
| GET | `/api/wrong-questions/stats` | 统计信息 | ✅ |
| GET | `/api/knowledge/graph` | 知识图谱数据 | ✅ |
| GET | `/api/knowledge/points/:id` | 知识点详情 | ✅ |
| GET | `/api/knowledge/search?q=` | 搜索知识点 | ✅ |
| GET | `/api/health` | 健康检查 | ❌ |
| GET | `/uploads/:filename` | 静态文件（图片） | ❌ |

### 前端路由表

| 路径 | 页面组件 | 认证 | 说明 |
|------|----------|------|------|
| `/login` | `Login` | ❌ | 登录页 |
| `/` | `Home` | ✅ | 首页仪表盘 |
| `/upload` | `Upload` | ✅ | 上传试卷 |
| `/exam/:id` | `ExamResult` | ✅ | 试卷批改结果 |
| `/wrong-questions` | `WrongQuestions` | ✅ | 错题本列表 |
| `/redo/:id` | `RedoQuestion` | ✅ | 重做错题 |
| `/knowledge` | `KnowledgeBase` | ✅ | 知识图谱 |
| `/knowledge/:id` | `KnowledgeDetail` | ✅ | 知识点详情 |
| `/search` | `Search` | ✅ | 搜索知识点 |

---

## 编码规范与约定

### Python 后端

```python
# ✅ Model 定义规范
from .base import Base, new_uuid, utcnow

class MyModel(Base):
    __tablename__ = "my_models"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=new_uuid)
    user_id: Mapped[str] = mapped_column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(500), nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utcnow)
```

- **ID 策略**：UUID v4 字符串（36 字符），由 `new_uuid()` 生成
- **时间字段**：使用 `utcnow()` 返回 UTC 时间（`datetime.now(timezone.utc)`）
- **类型注解**：使用 SQLAlchemy 2.0 `Mapped[]` + `mapped_column()` 风格
- **关系查询**：使用 `select()` 语句 + `await db.execute()`
- **配置访问**：通过 `get_settings()` 单例（`@lru_cache`），不直接读 `.env`
- **Schema 规范**：请求用 `*Request`，响应用 `*Response`，开启 `from_attributes = True`
- **所有用户消息**：使用中文（如 `"验证码已发送"`、`"请上传图片文件"`）
- **导入顺序**：标准库 → 第三方库 → 本地模块（用相对导入 `..core`）

### TypeScript 前端

```typescript
// ✅ Zustand Store 规范
import { create } from 'zustand'

interface MyState {
  items: MyItem[]
  setItems: (items: MyItem[]) => void
}

export const useMyStore = create<MyState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
```

- **组件命名**：PascalCase 函数组件（`export default function MyComponent()`）
- **文件命名**：组件 PascalCase，工具/常量 camelCase
- **状态管理**：按功能域拆 Store（authStore、examStore、knowledgeStore）
- **API 调用**：统一通过 `api/client.ts` 中的命名空间对象（`authApi`、`examApi`）
- **样式方案**：优先使用 TailwindCSS 工具类；颜色用主题变量（`text-primary`、`bg-bg`）
- **路由保护**：在 `App.tsx` 中用 `<ProtectedRoute>` 包裹需要认证的页面
- **响应式**：移动端优先，最大宽度 480px 居中布局

### 样式主题

```css
/* TailwindCSS v4 @theme 自定义变量（定义在 index.css） */
--color-primary: #6366f1;       /* 主色（靛蓝） */
--color-primary-dark: #4f46e5;
--color-primary-light: #a5b4fc;
--color-success: #22c55e;       /* 成功/正确 */
--color-danger: #ef4444;        /* 危险/错误 */
--color-warning: #f59e0b;       /* 警告 */
--color-bg: #f8fafc;            /* 页面背景 */
--color-surface: #ffffff;       /* 卡片/容器背景 */
--color-text: #1e293b;          /* 主文本 */
--color-text-secondary: #64748b;/* 次要文本 */
--color-border: #e2e8f0;        /* 边框 */
```

**注意**：不要硬编码颜色值，使用上述主题变量。

---

## 数据模型

### 实体关系

```
User 1──N Exam 1──N Question
  │                      │
  │                      │
  └──N WrongQuestion ────┘ (question_id FK)
  │
  └──N KnowledgePoint N──N KnowledgePoint (via KnowledgeRelation)
```

### 核心模型字段

| 模型 | 关键字段 | 说明 |
|------|----------|------|
| `User` | phone, nickname, avatar_url | 手机号唯一索引 |
| `Exam` | image_url, total/correct/wrong_count, status | status: `processing` → `done` |
| `Question` | question_text, type(choice/blank/essay), options(JSON), correct/student_answer, is_correct, explanation, knowledge_point_ids(JSON) | 属于 Exam |
| `WrongQuestion` | question_id, redo_count, is_mastered | redo_count 达 3 次 → is_mastered=true |
| `KnowledgePoint` | name, category, mastery_level(1-5), source_question_ids(JSON) | 按学科分类 |
| `KnowledgeRelation` | source_id, target_id, relation_type, weight | 知识点间关系 |

---

## AI 服务集成

### Qwen Vision API 调用流程

```
上传图片 (JPEG/PNG) → base64 编码 → 发送至 Qwen Vision API
    → AI 返回 JSON（题目列表 + 批改结果 + 知识点）
    → 解析 JSON → 写入 Exam / Question / WrongQuestion / KnowledgePoint
```

### AI 返回 JSON 格式

```json
{
  "questions": [
    {
      "question_text": "题目内容",
      "question_type": "choice|blank|essay",
      "options": ["A选项", "B选项", ...],
      "correct_answer": "正确答案",
      "student_answer": "学生答案",
      "is_correct": true/false,
      "explanation": "解析",
      "knowledge_point": "具体知识点名称"
    }
  ]
}
```

- Prompt 模板定义在 `backend/app/services/ai_service.py` 的 `GRADING_PROMPT` 常量
- 未配置 API Key 时自动使用 `_mock_grade_result()` 返回 Mock 数据
- API 使用 OpenAI 兼容接口格式（`/chat/completions`）

---

## 安全注意事项

### 绝不能提交到 Git 的文件

| 文件/模式 | 原因 |
|-----------|------|
| `.env` | 含 API Key、JWT 密钥 |
| `*.db` / `*.sqlite` | 数据库文件 |
| `backend/uploads/*` | 用户上传的隐私图片 |
| `node_modules/` | 依赖目录 |

### 代码安全约定

- ✅ 所有敏感值通过 `get_settings()` 从环境变量读取
- ✅ `.env.example` 提供模板，值用 `your-api-key-here` 等占位符
- ✅ 所有认证路由使用 `Depends(get_current_user)` 校验 JWT
- ✅ 前端 401 响应自动清除 token 并跳转登录页
- ❌ 不要在代码中硬编码 API Key 或密钥
- ❌ 不要在日志中打印完整的 token 或密码

---

## 常见开发任务指南

### 新增后端 API 端点

1. **定义 Schema**：`backend/app/schemas/my_feature.py`
   - 请求模型：`class MyRequest(BaseModel)`
   - 响应模型：`class MyResponse(BaseModel)`
2. **创建 Service**：`backend/app/services/my_service.py`
   - 接收 `AsyncSession` 参数
   - 实现业务逻辑
3. **创建 Router**：`backend/app/api/my_feature.py`
   - `router = APIRouter(prefix="/my-feature", tags=["my-feature"])`
   - 使用 `Depends(get_current_user)` 保护路由
4. **注册路由**：`backend/app/main.py`
   - `from .api.my_feature import router as my_router`
   - `app.include_router(my_router, prefix="/api")`

### 新增前端页面

1. **添加 API 函数**：`frontend/src/api/client.ts`
   - 在对应的命名空间对象中添加方法
2. **创建 Store**（如需）：`frontend/src/stores/myStore.ts`
3. **创建页面组件**：`frontend/src/pages/MyPage.tsx`
4. **注册路由**：`frontend/src/App.tsx`
   - 用 `<ProtectedRoute>` 包裹（如需认证）

### 修改数据库模型

```bash
# 1. 修改 models/*.py
# 2. 生成迁移
cd backend
alembic revision --autogenerate -m "describe change"
# 3. 运行迁移
alembic upgrade head
```

---

## 测试与调试

### 后端调试

- Swagger 文档：http://localhost:8000/docs
- 启动时 SQLAlchemy 会打印 SQL 日志（`echo=settings.debug`）
- 开发模式验证码固定 `1234`
- 可用任意手机号测试（自动创建账号）

### 前端调试

- 访问 http://localhost:5173
- 手机模拟：浏览器 DevTools → 设备工具栏（480px 宽度）
- 查看网络请求：DevTools → Network（API 代理到 localhost:8000）
- localStorage 中 `token` 字段存储 JWT

### 常见问题排查

| 问题 | 排查方向 |
|------|----------|
| 后端启动报端口占用 | `netstat -ano \| grep :8000` 找到并终止占用进程 |
| AI 批改返回空 | 检查 `.env` 中 `AI_API_KEY` 是否配置正确 |
| 前端请求 404 | 确认 Vite proxy 配置指向 `localhost:8000` |
| 数据库表不存在 | 运行 `alembic upgrade head` 或重启后端（自动建表） |
| JWT 401 错误 | 检查 localStorage 中 token 是否存在且未过期 |

---

## 关键约定速查

| 约定 | 说明 |
|------|------|
| 主键格式 | UUID v4 字符串（36 字符），如 `"a1b2c3d4-..."` |
| 时间格式 | UTC ISO 8601，存储和传输均用 UTC |
| API 前缀 | 所有业务 API 以 `/api` 开头 |
| 认证方式 | `Authorization: Bearer <jwt_token>` |
| Token 存储 | 前端 localStorage `token` 字段 |
| 图片上传 | `multipart/form-data`，字段名 `file`，限制 10MB |
| 图片 URL | 以 `/uploads/` 开头，由 StaticFiles 挂载 |
| 用户消息语言 | 中文 |
| 错题规则 | 连续重做 3 次正确 → `is_mastered=true` → 移入知识库 |
| 知识图谱 | D3.js force simulation，节点颜色按学科分类 |
| 移动端约束 | 最大宽度 480px，底部导航 4 个 tab |
| PWA | 支持离线缓存、可添加到主屏幕、竖屏锁定 |
