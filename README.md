# 汐律 (Xily) - 智能时间管理应用

> 随潮汐节奏，专注每一刻 🌊

**汐律** 是一个专为创作者和学习者设计的桌面端智能时间管理工具，基于潮汐节律理念帮助用户建立健康的学习创作节奏。通过输入×输出的平衡管理，让学习与产出不再失衡。

## ✨ 核心功能

### 🌊 潮汐节律系统
- **探索模式** (蓝色系): 知识学习、信息输入阶段
- **利用模式** (橙色系): 创作输出、灵感实现阶段
- **智能模式切换**: 根据用户习惯推荐模式转换

### ⏱️ 智能计时系统
- 番茄钟计时 (25分钟专注 + 5分钟休息)
- 自定义计时器设置
- 悬浮窗一键控制
- 系统托盘后台运行

### 🎯 作品管理系统
- 创建作品/目标/启航点
- 时间归属到特定作品
- 进度跟踪和目标设定
- 作品数据统计分析

### 📊 数据分析系统
- 时间分布统计图表
- 效率分析和趋势报告
- 多维度数据可视化
- 数据导出功能

### 🪟 悬浮窗功能
- 透明背景的圆形悬浮窗
- 支持拖拽和位置记忆
- 实时显示计时状态
- 快速切换作品和模式

## 🛠️ 技术栈

### 前端技术
- **框架**: React 18 + TypeScript
- **构建**: Vite 6.x
- **UI库**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand
- **路由**: React Router DOM
- **图表**: Recharts
- **动画**: Framer Motion
- **表单**: React Hook Form + Zod

### 桌面应用
- **框架**: Tauri 2.x
- **后端**: Rust
- **数据库**: SQLite

### 开发工具
- **代码检查**: ESLint + TypeScript
- **格式化**: Prettier
- **测试**: Vitest + Testing Library
- **样式**: PostCSS + Autoprefixer

## 🚀 快速开始

### 环境要求
- Node.js 18+
- Rust 1.70+
- Tauri CLI

### 安装依赖
```bash
npm install
```

### 开发命令
```bash
# 前端开发服务器
npm run dev

# Tauri 开发模式 (推荐)
npm run tauri dev

# 构建应用
npm run tauri build

# 代码检查
npm run lint

# 类型检查
npm run type-check

# 运行测试
npm run test
```

## 📁 项目结构

```
xily-backend/
├── src/                          # 前端源码
│   ├── components/               # React 组件
│   │   ├── ui/                   # 基础 UI 组件 (shadcn/ui)
│   │   ├── timer/                # 计时器相关组件
│   │   ├── charts/               # 图表组件
│   │   ├── works/                # 作品管理组件
│   │   ├── layout/               # 布局组件
│   │   ├── float/                # 悬浮窗组件
│   │   └── tray/                 # 系统托盘组件
│   ├── pages/                    # 页面组件
│   ├── hooks/                    # 自定义 Hooks
│   ├── stores/                   # 状态管理 (Zustand)
│   ├── services/                 # API 服务
│   ├── types/                    # TypeScript 类型定义
│   ├── utils/                    # 工具函数
│   ├── events/                   # 事件系统
│   ├── errors/                   # 错误处理
│   ├── validations/              # 数据验证
│   └── lib/                      # 第三方库配置
├── src-tauri/                    # Tauri 后端
│   ├── src/                      # Rust 源码
│   │   ├── commands/             # Tauri 命令
│   │   ├── services/             # 后端服务
│   │   └── database/             # 数据库相关
│   └── Cargo.toml                # Rust 依赖配置
├── config/                       # 配置文件
├── constants/                    # 常量定义
├── docs/                         # 文档目录
├── public/                       # 静态资源
└── dist/                         # 构建输出
```

## 🎨 设计理念

### 视觉风格
- **主色调**: 蓝色系 (#3498db) 和橙色系 (#e67e22)
- **设计原则**: 简洁优雅、自然流畅、高效操作
- **视觉隐喻**: 基于潮汐概念的自然节律

### 用户体验
- 一键开始/暂停/结束计时
- 实时显示当前状态和进度
- 智能通知和提醒
- 直观的数据可视化

## 📊 数据模型

### 作品表 (works)
```sql
CREATE TABLE works (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    color TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    target_hours INTEGER DEFAULT 0
);
```

### 时间记录表 (time_records)
```sql
CREATE TABLE time_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER,
    mode TEXT NOT NULL, -- 'explore' or 'utilize'
    duration INTEGER NOT NULL, -- minutes
    start_time DATETIME NOT NULL,
    end_time DATETIME NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (work_id) REFERENCES works(id)
);
```

## 🔧 开发指南

### 代码规范
- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 组件单一职责原则
- 使用 ESLint 和 Prettier 保持代码风格一致

### 状态管理
- 全局状态使用 Zustand
- 组件内部状态使用 useState
- 复杂状态逻辑使用 useReducer
- 事件驱动的状态更新

### 组件开发
- 使用 shadcn/ui 组件库
- 自定义组件遵循统一命名规范
- 组件文档和类型定义完整
- 单元测试覆盖核心逻辑

### API 设计
- RESTful API 设计风格
- 统一的错误处理机制
- 类型安全的 API 调用
- 数据验证和格式化

## 🐛 已知问题与修复

### 计时器稳定性优化 (2025-09-14)
- 修复了计时器状态管理中的依赖循环问题
- 优化了错误处理机制，避免应用意外重启
- 改进了悬浮窗的响应性能和用户体验

### 数据同步改进 (2025-09-13)
- 实现了前后端数据同步机制
- 修复了数据库操作的并发问题
- 优化了数据持久化性能

## 📈 性能优化

- 使用 React.memo 和 useMemo 优化渲染性能
- 虚拟滚动处理大量数据列表
- 图片和资源懒加载
- 代码分割和按需加载

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🙏 致谢

感谢所有为这个项目做出贡献的开发者和用户。

---

*随潮汐节奏，专注每一刻* 🌊
