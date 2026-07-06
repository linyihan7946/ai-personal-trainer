# 后端架构与规范

## 技术栈

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
| SMS 服务 | UniSMS 合一短信 | — |
| HTTP 客户端 | httpx | 0.27 |
| 图片处理 | Pillow | 10.4 |

## 目录结构

```
backend/
├── .env
├── .env.example
├── requirements.txt
├── Dockerfile
├── alembic.ini
├── alembic/
│   ├── env.py
│   └── versions/
├── uploads/
└── app/
    ├── main.py                # FastAPI 入口、中间件、路由注册
    ├── api/                   # 路由层
    ├── core/                  # 基础设施（config, database, security）
    ├── models/                # SQLAlchemy ORM 模型
    ├── schemas/               # Pydantic 请求/响应模型
    └── services/              # 业务逻辑层
```

## 分层架构

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

## API 路由表

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/send-code` | 发送验证码（UniSMS） | ❌ |
| POST | `/api/auth/login` | 验证码登录 | ❌ |
| GET | `/api/auth/me` | 当前用户信息 | ✅ |
| GET | `/api/auth/admin/stats` | 管理员统计数据 | 🔒 |
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

> 🔒 = 仅管理员可访问

## Python 编码规范

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
- **所有用户消息**：使用中文
- **导入顺序**：标准库 → 第三方库 → 本地模块（用相对导入 `..core`）
- **异步模式**：所有数据库操作用 `async/await`
- **数据隔离**：所有查询必须按 `user_id` 过滤

## 数据模型

### 实体关系

```
User 1──N Exam 1──N Question
  │                      │
  └──N WrongQuestion ────┘ (question_id FK)
  │
  └──N KnowledgePoint N──N KnowledgePoint (via KnowledgeRelation)
```

### 核心模型

| 模型 | 关键字段 | 说明 |
|------|----------|------|
| `User` | phone, nickname, avatar_url, **is_admin** | 手机号唯一索引，管理员标识 |
| `Exam` | image_url, total/correct/wrong_count, status, **subject** | status: `processing` → `done` |
| `Question` | question_text, type, options(JSON), correct/student_answer, is_correct, explanation | 属于 Exam |
| `WrongQuestion` | question_id, redo_count, is_mastered | redo_count 达 3 次 → mastered |
| `KnowledgePoint` | name, category, mastery_level(1-5), source_question_ids(JSON) | 按学科分类 |
| `KnowledgeRelation` | source_id, target_id, relation_type, weight | 知识点间关系 |

## AI 服务集成

### Qwen Vision API

```
上传图片 → base64 编码 → Qwen Vision API
    → AI 返回 JSON → 写入 Exam/Question/WrongQuestion/KnowledgePoint
```

- Prompt 模板：`backend/app/services/ai_service.py` 的 `GRADING_PROMPT`
- 未配置 API Key 时返回 Mock 数据 `_mock_grade_result()`
- 支持学科上下文注入 `学科：{subject}`
- API 使用 OpenAI 兼容格式（`/chat/completions`）

### UniSMS 短信服务

- SDK：`unisms`（PyPI）
- 域名：`https://uni.apistd.com`
- 验证码模板变量：`{code}`
- 配置文件：`.env` → `SMS_ACCESS_KEY_ID`、`SMS_SIGNATURE`、`SMS_TEMPLATE_ID`

## 管理员系统

- 管理员手机号定义在 `auth.py` 的 `ADMIN_PHONES` 集合中
- User 模型有 `is_admin: bool` 字段
- 管理员访问统计接口 `GET /api/auth/admin/stats`
- 统计指标：总用户数、今日活跃、总试卷、总错题、总知识点

## 安全注意事项

- ✅ 所有 API 接口通过 `get_current_user` 校验 JWT
- ✅ 所有查询按 `user_id` 过滤（数据隔离）
- ✅ 管理员接口通过 `get_current_admin` 额外校验
- ✅ `.env` 不入版本库，`.env.example` 提供模板
- ❌ 不硬编码 API Key 或密钥
- ❌ 不提交 `*.db`、`uploads/*` 到 Git
