# 开发指南

## 启动命令

```bash
# 后端
cd backend
cp .env.example .env          # 首次
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# 前端
cd frontend
npm install                   # 首次
npm run dev                   # → localhost:5173

# Docker
docker-compose up -d          # PostgreSQL + 后端
```

| 命令 | 说明 |
|------|------|
| `uvicorn app.main:app --reload` | 后端热重载 |
| `npm run dev` | 前端开发服务器 |
| `npm run build` | 前端生产构建 |
| `npm run lint` | Oxlint 检查 |
| `alembic upgrade head` | 运行数据库迁移 |
| `alembic revision --autogenerate -m "msg"` | 生成新迁移 |

## 常见开发任务

### 新增后端 API

1. **Schema** → `backend/app/schemas/my_feature.py`（`*Request`, `*Response`）
2. **Service** → `backend/app/services/my_service.py`（接收 `AsyncSession`）
3. **Router** → `backend/app/api/my_feature.py`（`APIRouter + Depends(get_current_user)`）
4. **注册** → `backend/app/main.py` 加 `app.include_router(router, prefix="/api")`

### 新增前端页面

1. **API 函数** → `frontend/src/api/client.ts` 命名空间对象
2. **Store**（如需）→ `frontend/src/stores/myStore.ts`
3. **页面组件** → `frontend/src/pages/MyPage.tsx`
4. **路由** → `frontend/src/App.tsx` 加 `<ProtectedRoute>`

### 修改数据库模型

```bash
# 1. 修改 models/*.py
# 2. 生成迁移
cd backend && alembic revision --autogenerate -m "describe change"
# 3. 运行迁移
alembic upgrade head
```

## 调试

| 工具 | 地址/方式 |
|------|-----------|
| Swagger 文档 | http://localhost:8000/docs |
| SQL 日志 | SQLAlchemy `echo=true`（开发模式自动开启） |
| 开发验证码 | 随机 6 位（debug_code 返回） |
| 前端 DevTools | http://localhost:5173，模拟 480px 移动端 |

## 常见问题排查

| 问题 | 排查 |
|------|------|
| 端口占用 | `netstat -ano \| grep :8000` 找到并终止 |
| AI 批改空 | 检查 `.env` 中 `AI_API_KEY` |
| 前端 404 | 确认 Vite proxy → `localhost:8000` |
| 数据库表不存在 | `alembic upgrade head` 或重启后端 |
| JWT 401 | 检查 `localStorage.token` 是否存在 |
| SMS 发送失败 | 检查 `.env` 中 UniSMS 配置，或触发频率限制 |

## 开发模式特殊行为

- 短信未配置 Key 时记录日志，验证码仍存储可用
- 未配置 AI API Key 时使用 Mock 批改数据
- CORS 允许所有来源
- SQLite 启动时自动建表
- 新用户登录自动创建账号（nickname: `同学+手机尾号`）
- 管理员手机号 `15915907946` 登录时自动设 `is_admin=True`
