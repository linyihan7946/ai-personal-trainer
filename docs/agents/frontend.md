# 前端架构与规范

## 技术栈

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

## 目录结构

```
frontend/
├── index.html
├── vite.config.ts
├── tsconfig.json
├── package.json
├── public/
└── src/
    ├── main.tsx                 # React 入口
    ├── App.tsx                  # 根组件 + 路由定义
    ├── index.css                # TailwindCSS 入口 + 主题变量
    ├── api/
    │   └── client.ts            # Axios 实例 + API 函数
    ├── components/
    │   ├── BottomNav.tsx
    │   ├── CameraCapture.tsx
    │   ├── KnowledgeGraph.tsx
    │   └── QuestionCard.tsx
    ├── pages/
    │   ├── Login.tsx
    │   ├── Home.tsx
    │   ├── Upload.tsx
    │   ├── ExamResult.tsx
    │   ├── WrongQuestions.tsx
    │   ├── RedoQuestion.tsx
    │   ├── KnowledgeBase.tsx
    │   ├── KnowledgeDetail.tsx
    │   ├── Search.tsx
    │   └── Profile.tsx
    └── stores/
        ├── authStore.ts
        ├── examStore.ts
        └── knowledgeStore.ts
```

## 状态流

```
用户操作 → Page 组件 → Zustand Store → API Client (Axios) → 后端
                ↑                                           ↓
                └──── Store 更新 ← API 响应 ←──────────────┘
```

## 前端路由

| 路径 | 页面 | 认证 | 说明 |
|------|------|------|------|
| `/login` | Login | ❌ | 手机号验证码登录 |
| `/` | Home | ✅ | 首页仪表盘 |
| `/upload` | Upload | ✅ | 上传试卷+学科选择 |
| `/exam/:id` | ExamResult | ✅ | 批改结果 |
| `/wrong-questions` | WrongQuestions | ✅ | 错题本 |
| `/redo/:id` | RedoQuestion | ✅ | 重做错题 |
| `/knowledge` | KnowledgeBase | ✅ | 知识图谱 |
| `/knowledge/:id` | KnowledgeDetail | ✅ | 知识点详情 |
| `/search` | Search | ✅ | 搜索知识点 |
| `/profile` | Profile | ✅ | 个人中心 |

## TypeScript 编码规范

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
- **API 调用**：统一通过 `api/client.ts` 命名空间对象
- **路由保护**：`<ProtectedRoute>` 包裹认证页面
- **响应式**：移动端优先，最大宽度 480px 居中

## 样式主题

```css
/* frontend/src/index.css — TailwindCSS v4 @theme */
--color-primary: #6366f1;
--color-primary-dark: #4f46e5;
--color-primary-light: #a5b4fc;
--color-success: #22c55e;
--color-danger: #ef4444;
--color-warning: #f59e0b;
--color-bg: #f8fafc;
--color-surface: #ffffff;
--color-text: #1e293b;
--color-text-secondary: #64748b;
--color-border: #e2e8f0;
```

**禁止硬编码颜色**，始终使用主题变量（`text-primary`、`bg-bg` 等）。

## 页面风格统一要求

| 规范项 | 规则 |
|--------|------|
| **主色** | `text-primary` / `bg-primary` |
| **容器** | 外层 `px-5 py-6`，最大宽度 480px 居中 |
| **卡片** | 圆角 `rounded-2xl`，边框 `border border-border` |
| **主按钮** | `bg-primary text-white rounded-2xl py-4 font-semibold shadow-lg shadow-primary/25` |
| **次按钮** | `border border-border rounded-2xl py-4` |
| **间距** | 区块间 `mb-6`~`mb-8`，元素间 `gap-3`~`gap-4` |
| **输入框** | `px-5 py-5 rounded-2xl border border-border text-base` |
| **图标** | lucide-react，尺寸 18-24px |
| **弹窗** | `fixed inset-0 z-50`，遮罩 `bg-black/40`，内容 `rounded-2xl p-6` |
| **空状态** | 居中排列，灰色图标 + 引导文字 + 操作按钮 |
| **移动端** | 宽度 ≤ 480px，禁用横向滚动 |

### 反例

- ❌ `rounded-xl` → ✅ 用 `rounded-2xl`
- ❌ `text-[#6366f1]` → ✅ 用 `text-primary`
- ❌ 输入框 `py-3` → ✅ 用 `py-5`
- ❌ 主按钮无 shadow → ✅ 加 `shadow-lg shadow-primary/25`

## 前端认证

- Token 存储：`localStorage.token`
- 请求注入：Axios interceptor 自动加 `Authorization: Bearer <token>`
- 401 处理：清除 token → 跳转 `/login`
- 登录状态：`authStore.isLoggedIn` 检查 token 存在性
- 用户信息：`authStore.fetchMe()` 调用 `/api/auth/me`
- 管理员：`user.is_admin === true` 时显示管理员功能

## API Client 结构

```typescript
// frontend/src/api/client.ts
export const authApi = { sendCode, login, me, logout }
export const examApi = { upload, list, detail }
export const wrongQApi = { list, detail, redo, stats }
export const knowledgeApi = { graph, pointDetail, search }
export const adminApi = { stats }  // 仅管理员
```

## PWA 配置

- 插件：`vite-plugin-pwa`
- 注册模式：`autoUpdate`
- 主题色：`#6366f1`
- 显示模式：`standalone`
- 方向：`portrait-primary`
- 离线缓存：workbox CacheFirst 策略
