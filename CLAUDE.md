# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

**汐律** 是一个专为创作者和学习者设计的桌面端智能时间管理工具，基于 Tauri + TypeScript 构建。产品核心是"输入×输出的节律器"，通过潮汐节律理念帮助用户建立健康的学习创作节奏。

## 开发环境

### 技术栈
- **前端**: TypeScript + Vite
- **桌面应用**: Tauri 2.x
- **后端**: Rust (Tauri Core)
- **数据库**: SQLite (规划中)
- **样式**: CSS

### 开发命令
```bash
# 开发模式
npm run dev

# 构建项目
npm run build

# 预览构建结果
npm run preview

# Tauri 开发
npm run tauri dev

# Tauri 构建
npm run tauri build
```

## 项目架构

### 目录结构
```
xily/
├── src/                    # 前端源代码
│   ├── main.ts            # 主入口文件
│   └── styles.css         # 样式文件
├── src-tauri/             # Tauri Rust 后端
│   ├── src/
│   │   ├── main.rs        # Rust 主入口
│   │   └── lib.rs         # Rust 库文件
│   └── Cargo.toml         # Rust 依赖配置
├── index.html             # HTML 入口文件
├── package.json           # Node.js 依赖配置
├── tsconfig.json          # TypeScript 配置
├── vite.config.ts         # Vite 构建配置
└── PRD.md                 # 产品需求文档
```

### 核心功能模块（规划中）

#### 1. 潮汐节律系统
- **探索模式** (蓝色系): 知识学习、信息输入阶段
- **利用模式** (橙色系): 创作输出、灵感实现阶段
- **自动切换**: 根据用户习惯智能推荐模式切换

#### 2. 智能计时系统
- 25分钟专注时段（番茄钟）
- 5分钟短休息、15分钟长休息
- 支持自定义时长
- 系统托盘后台运行

#### 3. 悬浮窗系统
- 透明背景的圆形悬浮窗
- 一键开始/暂停/结束计时
- 显示当前模式和时间
- 支持拖拽和位置记忆

#### 4. 作品管理系统
- 创建作品/目标/启航点
- 时间归属到特定作品
- 进度跟踪和目标设定
- 基于作品的数据分析

#### 5. 数据分析系统
- 时间分布统计
- 效率分析报告
- 趋势分析图表
- 多格式数据导出

### 数据模型（规划中）

#### 作品表 (works)
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

#### 时间记录表 (time_records)
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

## 开发注意事项

### TypeScript 配置
- 严格模式启用 (`strict: true`)
- 未使用变量检测 (`noUnusedLocals: true`)
- 未使用参数检测 (`noUnusedParameters: true`)

### Tauri 开发
- 开发服务器端口: 1420
- HMR 端口: 1421
- 忽略 `src-tauri` 目录的文件监听

### 品牌规范
- **主色调**: 蓝色系 (#3498db) 和橙色系 (#e67e22)
- **设计理念**: 简洁优雅、自然流畅、高效操作
- **品牌标语**: "随潮汐节奏，专注每一刻"

### 当前状态
项目处于初始化阶段，基础框架已搭建，核心功能待开发。当前只有 Tauri 模板的示例代码（greet 功能），需要根据 PRD.md 中的需求文档实现完整的时间管理功能。