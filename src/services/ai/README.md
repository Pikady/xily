# AI服务层使用说明

## 概述

本服务层提供了完整的DeepSeek AI集成，支持智能对话创作、数据提取和动机心理学策略生成。

## 功能特性

- ✅ 真实DeepSeek API集成
- ✅ 智能对话管理
- ✅ 自动数据提取
- ✅ 动机心理学策略生成
- ✅ 错误处理和重试机制
- ✅ 会话状态管理
- ✅ 模拟模式回退

## 快速开始

### 1. 配置API密钥

创建 `.env` 文件并添加你的DeepSeek API密钥：

```env
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
```

### 2. 基本使用

```typescript
import { aiWorkService } from '@/services/aiWorkService';

// 检查服务状态
const status = await aiWorkService.checkAPIStatus();

// 开始会话
const session = await aiWorkService.startSession();

// 发送消息
const response = await aiWorkService.sendMessage(
  session.session_id,
  "我想写一本书"
);
```

### 3. 高级用法

```typescript
import { conversationManager } from '@/services/ai';

// 直接使用对话管理器
const result = await conversationManager.sendMessage(sessionId, message);

// 获取会话信息
const sessionData = conversationManager.getSession(sessionId);

// 更新会话数据
conversationManager.updateSessionData(sessionId, {
  extractedData: workData,
  motivationData: motivationData
});
```

## 服务架构

### 核心组件

1. **DeepSeekClient** - DeepSeek API客户端
2. **PromptBuilder** - 智能提示词构建
3. **ConversationManager** - 对话状态管理
4. **AIWorkService** - 统一服务接口

### 数据流

```
用户输入 → AIWorkService → ConversationManager → DeepSeekClient → DeepSeek API
                                    ↓
                              PromptBuilder (提示词构建)
                                    ↓
                              自动数据提取和阶段转换
```

## 配置选项

### AI服务配置

```typescript
const config = {
  maxHistoryLength: 50,        // 最大历史记录长度
  enableAutoExtraction: true,  // 启用自动数据提取
  enableStageTransition: true, // 启用自动阶段转换
  streamResponse: false,       // 流式响应
};
```

### DeepSeek配置

```typescript
const deepseekConfig = {
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  maxTokens: 4000,
  temperature: 0.7,
  timeout: 30000,
};
```

## 错误处理

服务层包含完整的错误处理机制：

```typescript
try {
  const response = await aiWorkService.sendMessage(sessionId, message);
} catch (error) {
  if (error.code === 'RATE_LIMIT_ERROR') {
    // 处理限流
  } else if (error.code === 'AUTH_ERROR') {
    // 处理认证错误
  }
  // 其他错误...
}
```

### 错误类型

- `NETWORK_ERROR` - 网络连接失败
- `AUTH_ERROR` - API认证失败
- `RATE_LIMIT_ERROR` - 请求频率限制
- `TIMEOUT_ERROR` - 请求超时
- `VALIDATION_ERROR` - 数据验证失败
- `UNKNOWN_ERROR` - 未知错误

## 对话阶段

服务支持6个对话阶段：

1. **greeting** - 问候和引导
2. **discovery** - 创意探索
3. **information_gathering** - 信息收集
4. **motivation** - 动机增强
5. **confirmation** - 信息确认
6. **completed** - 完成

## 模拟模式

当没有配置API密钥时，服务会自动切换到模拟模式：

```typescript
// 检查是否使用真实AI
if (aiWorkService.isUsingRealAI()) {
  // 使用真实AI
} else {
  // 使用模拟模式
}
```

## 最佳实践

### 1. API密钥管理

- 不要在前端代码中硬编码API密钥
- 使用环境变量或配置管理系统
- 定期轮换API密钥

### 2. 错误处理

- 始终使用try-catch包装AI调用
- 为用户提供友好的错误信息
- 实现重试机制处理临时错误

### 3. 性能优化

- 限制对话历史长度
- 使用适当的超时设置
- 考虑使用流式响应改善用户体验

### 4. 用户体验

- 提供加载状态指示
- 实现渐进式数据展示
- 保存对话状态防止数据丢失

## 故障排除

### 常见问题

1. **API密钥无效**
   - 检查环境变量配置
   - 验证API密钥是否正确

2. **网络连接失败**
   - 检查网络连接
   - 验证API端点是否可访问

3. **请求超时**
   - 增加超时时间
   - 检查服务器性能

4. **数据解析失败**
   - 验证AI响应格式
   - 检查提示词配置

### 调试方法

```typescript
// 启用详细日志
console.log('AI服务状态:', await aiWorkService.getServiceInfo());

// 检查会话状态
const sessionData = await aiWorkService.getSession(sessionId);
console.log('会话数据:', sessionData);

// 测试API连接
const status = await aiWorkService.checkAPIStatus();
console.log('API状态:', status);
```

## 更新日志

### v1.0.0
- 初始版本发布
- DeepSeek API集成
- 完整的对话管理
- 自动数据提取
- 错误处理和重试机制

## 许可证

此服务层作为汐律项目的一部分发布。