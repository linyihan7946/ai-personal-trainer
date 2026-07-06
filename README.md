# AI 私教 (AI Personal Trainer)

AI 驱动的个人学习助手 PWA 应用。拍照上传试卷，AI 自动批改，构建个人专属知识图谱。

## 核心功能

- 📸 **拍照上传试卷**：支持手机拍照和相册选取，AI 自动识别题目
- 🤖 **AI 自动批改**：基于通义千问 Vision API，自动识别题目、判断对错、给出解析
- 📝 **错题本**：错题自动收集，重做连续 3 次正确后移入知识库
- 🧠 **个人知识库**：Obsidian 风格的网状知识图谱可视化
- 🔍 **知识点搜索**：关键字搜索知识点
- 📱 **PWA 支持**：可添加到手机主屏幕，支持离线访问

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 18 + TypeScript + Vite + TailwindCSS |
| 状态管理 | Zustand |
| 图可视化 | D3.js Force Simulation |
| PWA | vite-plugin-pwa |
| 后端 | Python FastAPI |
| 数据库 | PostgreSQL + SQLAlchemy 2.0 (async) |
| 迁移 | Alembic |
| AI 服务 | 通义千问 (Qwen) Vision API |
| 认证 | 手机验证码 + JWT |

## 项目结构

```
ai-personal-trainer/
├── frontend/              # PWA 前端
│   ├── src/
│   │   ├── components/    # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── stores/        # Zustand 状态管理
│   │   └── api/           # API 客户端
│   └── ...
├── backend/               # FastAPI 后端
│   ├── app/
│   │   ├── api/           # API 路由
│   │   ├── models/        # SQLAlchemy 模型
│   │   ├── schemas/       # Pydantic 模型
│   │   ├── services/      # 业务逻辑
│   │   └── core/          # 配置/安全/数据库
│   └── alembic/           # 数据库迁移
└── docker-compose.yml     # Docker 编排
```

## 快速开始

### 前置要求

- Node.js 18+
- Python 3.12+
- Docker & Docker Compose (用于 PostgreSQL)

### 1. 启动数据库

```bash
docker-compose up -d db
```

### 2. 配置后端

```bash
cd backend
cp .env.example .env   # 编辑 .env，填入你的通义千问 API Key
pip install -r requirements.txt

# 运行数据库迁移
alembic upgrade head

# 启动后端 (开发模式)
uvicorn app.main:app --reload --port 8000
```

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

### 4. 打开浏览器

访问 http://localhost:5173，用手机浏览器打开可获得最佳体验：
- 输入任意手机号，验证码为 `1234`（开发模式）
- 拍照或选取试卷图片上传
- 查看 AI 批改结果和知识图谱

### Docker 一键启动

```bash
# 设置环境变量
export AI_API_KEY=your_qwen_api_key

# 启动所有服务
docker-compose up -d
```

## API 接口

### 认证 `/api/auth`
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/login` - 验证码登录

### 试卷 `/api/exams`
- `POST /api/exams/upload` - 上传试卷图片
- `GET /api/exams` - 试卷列表
- `GET /api/exams/:id` - 试卷详情

### 错题 `/api/wrong-questions`
- `GET /api/wrong-questions` - 错题列表
- `GET /api/wrong-questions/:id` - 错题详情
- `POST /api/wrong-questions/:id/redo` - 提交重做
- `GET /api/wrong-questions/stats` - 统计信息

### 知识库 `/api/knowledge`
- `GET /api/knowledge/graph` - 知识图谱数据
- `GET /api/knowledge/points/:id` - 知识点详情
- `GET /api/knowledge/search?q=keyword` - 搜索知识点

## 配置 AI API Key

在 [阿里云 DashScope 控制台](https://dashscope.console.aliyun.com/) 获取 API Key：

```bash
# 后端 .env 文件
AI_API_KEY=sk-your-api-key-here
AI_MODEL=qwen-vl-max  # 或 qwen-vl-plus
```

不配置 API Key 时，系统会使用内置的 Mock 数据用于演示。

## 开发模式说明

- 验证码固定为 `1234`
- 任何手机号均可登录（自动创建账号）
- 未配置 AI API Key 时使用 Mock 批改数据
