# Xily - 专注力管理应用

一个基于 Tauri + React + TypeScript 的专注力管理应用，帮助用户通过计时器功能提升工作效率。

## 功能特性

- 🎯 **双模式计时器**：探索模式（学习输入）和利用模式（创作输出）
- 📊 **数据分析**：详细的时间统计和分析报告
- 🎨 **作品管理**：创建和管理不同的工作项目
- 📱 **跨平台**：支持 Windows、macOS、Linux
- 🔔 **智能通知**：专注完成提醒
- 💾 **数据持久化**：本地数据库存储

## 技术栈

- **前端**: React 18 + TypeScript + Vite
- **后端**: Rust + Tauri
- **数据库**: SQLite
- **UI组件**: shadcn/ui + Tailwind CSS
- **状态管理**: Zustand

## 开发环境设置

### 推荐IDE配置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

### 环境要求

- Node.js 18+
- Rust 1.70+
- Tauri CLI

### 安装和运行

```bash
# 安装依赖
npm install

# 开发模式运行
npm run tauri dev

# 构建应用
npm run tauri build
```

## 项目结构

```
src/
├── components/          # React组件
│   ├── timer/          # 计时器相关组件
│   ├── charts/         # 图表组件
│   ├── features/       # 功能模块
│   └── ui/             # 基础UI组件
├── hooks/              # 自定义Hooks
├── stores/             # 状态管理
├── services/           # API服务
├── types/              # TypeScript类型定义
└── utils/              # 工具函数

src-tauri/
├── src/
│   ├── commands/       # Tauri命令
│   ├── services/       # 后端服务
│   ├── models/         # 数据模型
│   └── database/       # 数据库相关
```

## 问题修复记录

### 2025-01-09: 计时器重启问题修复

**问题描述**: 在计时器页面点击计时按钮后，应用会突然重启。

**根本原因**: 
1. 错误处理机制过于激进，当后端API调用失败时会触发fallback机制
2. fallback机制会调用`resetTimer()`重置整个计时器状态
3. 前端状态管理存在依赖循环问题

**修复方案**:
1. 移除过于激进的错误处理机制，改用简单的try-catch
2. 将后端API调用改为异步非阻塞模式
3. 优化状态更新顺序，确保前端UI立即响应
4. 修复useEffect依赖循环问题

**修改文件**:
- `src/stores/timerStore.ts`: 重构所有计时器方法
- `src/components/timer/TimerController.tsx`: 优化状态管理逻辑

**测试方法**:
1. 启动应用: `npm run tauri dev`
2. 进入计时器页面
3. 点击开始计时按钮
4. 验证计时器正常启动，无重启现象

## 开发指南

### 添加新功能

1. 在 `src/components/features/` 下创建功能模块
2. 在 `src/stores/` 下添加对应的状态管理
3. 在 `src-tauri/src/commands/` 下添加后端命令
4. 更新类型定义和API服务

### 代码规范

- 使用 TypeScript 严格模式
- 遵循 React Hooks 最佳实践
- 使用 Zustand 进行状态管理
- 保持组件单一职责原则

## 许可证

MIT License
