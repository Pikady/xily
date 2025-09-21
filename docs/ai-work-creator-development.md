# AI对话创建作品功能开发文档

## 1. 开发环境准备

### 1.1 依赖需求
```json
{
  "dependencies": {
    "openai": "^4.0.0",
    "react-markdown": "^9.0.0",
    "@types/react-markdown": "^8.0.0"
  }
}
```

### 1.2 环境配置
```bash
# 安装新依赖
npm install openai react-markdown @types/react-markdown

# 创建环境变量文件
echo "VITE_AI_API_KEY=your_api_key_here" >> .env
echo "VITE_AI_API_ENDPOINT=https://api.openai.com/v1" >> .env
```

## 2. 项目结构设计

### 2.1 目录结构
```
src/
├── components/
│   ├── ai-work-creator/
│   │   ├── AIWorkCreatorDialog.tsx     # 主对话模态框
│   │   ├── ChatContainer.tsx           # 对话容器
│   │   ├── ChatMessage.tsx             # 消息组件
│   │   ├── TypingIndicator.tsx         # 输入指示器
│   │   ├── QuickReplies.tsx            # 快捷回复
│   │   ├── WorkPreview.tsx             # 作品预览
│   │   ├── MotivationSummary.tsx       # 动机总结
│   │   └── AIService.ts                # AI服务封装
│   └── works/
│       └── WorkFormModal.tsx           # 需要修改以支持AI创建
├── services/
│   ├── aiWorkService.ts                # AI作品服务
│   └── promptTemplates.ts              # 提示词模板
├── stores/
│   ├── aiWorkStore.ts                  # AI工作状态管理
│   └── worksStore.ts                   # 现有作品store（需扩展）
├── types/
│   ├── ai-work.ts                      # AI相关类型定义
│   └── work.ts                         # 现有作品类型（需扩展）
├── hooks/
│   └── useAIWorkCreator.ts             # AI创建作品Hook
└── utils/
    ├── aiHelpers.ts                    # AI辅助函数
    └── validation.ts                   # 数据验证
```

### 2.2 文件依赖关系
```
AIWorkCreatorDialog
├── ChatContainer
│   ├── ChatMessage
│   ├── TypingIndicator
│   └── QuickReplies
├── WorkPreview
├── MotivationSummary
└── AIService
```

## 3. 核心功能实现

### 3.1 数据类型定义 (src/types/ai-work.ts)

```typescript
// 对话消息类型
export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    type?: 'text' | 'quick_reply' | 'system';
    stage?: string;
  };
}

// 对话阶段
export type DialogueStage =
  | 'greeting'
  | 'discovery'
  | 'information_gathering'
  | 'motivation'
  | 'confirmation'
  | 'completed';

// 提取的作品数据
export interface ExtractedWorkData {
  name: string;
  description?: string;
  target_hours: number;
  color?: string;
  suggestions?: {
    name_alternatives?: string[];
    color_recommendations?: string[];
  };
}

// 动机数据
export interface MotivationData {
  woop?: {
    wish: string;
    outcome: string;
    obstacle: string;
    plan: string;
  };
  implementation_intentions?: Array<{
    if: string;
    then: string;
    priority: number;
  }>;
  commitments?: {
    statement: string;
    type: 'public' | 'private';
  };
}
```

### 3.2 AI服务封装 (src/services/aiWorkService.ts)

```typescript
import { invoke } from '@tauri-apps/api/core';

export class AIWorkService {
  // 开始新的AI会话
  async startSession(): Promise<AISession> {
    return await invoke('start_ai_session');
  }

  // 发送消息并获取AI响应
  async sendMessage(
    sessionId: string,
    message: string,
    context: SessionContext
  ): Promise<AIResponse> {
    return await invoke('send_ai_message', {
      sessionId,
      message,
      context: JSON.stringify(context)
    });
  }

  // 提取作品信息
  async extractWorkInfo(
    sessionId: string,
    conversationHistory: ChatMessage[]
  ): Promise<ExtractedWorkData> {
    return await invoke('extract_work_information', {
      sessionId,
      conversationHistory: JSON.stringify(conversationHistory)
    });
  }

  // 生成动机策略
  async generateMotivationStrategies(
    sessionId: string,
    workInfo: string
  ): Promise<MotivationData> {
    return await invoke('generate_motivation_strategies', {
      sessionId,
      workInfo
    });
  }

  // 创建作品
  async createWorkFromAI(data: CreateWorkFromAIParams): Promise<Work> {
    return await invoke('create_work_from_ai', data);
  }
}
```

### 3.3 状态管理 (src/stores/aiWorkStore.ts)

```typescript
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AIWorkState {
  // 会话状态
  currentSession: AISession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isProcessing: boolean;
  currentStage: DialogueStage;

  // 数据状态
  extractedWork: ExtractedWorkData | null;
  motivationData: MotivationData | null;

  // UI状态
  error: string | null;

  // Actions
  startSession: () => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setStage: (stage: DialogueStage) => void;
  setExtractedWork: (data: ExtractedWorkData) => void;
  setMotivationData: (data: MotivationData) => void;
  clearSession: () => void;
}

export const useAIWorkStore = create<AIWorkState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        currentSession: null,
        messages: [],
        isTyping: false,
        isProcessing: false,
        currentStage: 'greeting',
        extractedWork: null,
        motivationData: null,
        error: null,
        quickReplies: [],

        // Actions
        startSession: async () => {
          try {
            set({ isProcessing: true, error: null });
            const service = new AIWorkService();
            const session = await service.startSession();

            set({
              currentSession: session,
              messages: [],
              currentStage: 'greeting',
              isProcessing: false
            });
          } catch (error) {
            set({ error: '启动会话失败', isProcessing: false });
          }
        },

        sendMessage: async (message: string) => {
          const state = get();
          if (!state.currentSession || state.isProcessing) return;

          try {
            // 添加用户消息
            const userMessage: ChatMessage = {
              id: Date.now().toString(),
              session_id: state.currentSession.session_id,
              role: 'user',
              content: message,
              timestamp: new Date()
            };

            set({
              messages: [...state.messages, userMessage],
              isTyping: true,
              isProcessing: true
            });

            // 调用AI服务
            const service = new AIWorkService();
            const response = await service.sendMessage(
              state.currentSession.session_id,
              message,
              {
                stage: state.currentStage,
                messages: [...state.messages, userMessage]
              }
            );

            // 添加AI响应
            const aiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              session_id: state.currentSession.session_id,
              role: 'assistant',
              content: response.message,
              timestamp: new Date(),
              metadata: {
                stage: response.stage,
              }
            };

            set({
              messages: [...state.messages, userMessage, aiMessage],
              isTyping: false,
              isProcessing: false,
              currentStage: response.stage || state.currentStage,
              quickReplies: response.suggestions?.quick_replies || []
            });

            // 处理提取的数据
            if (response.extracted_data) {
              get().setExtractedWork(response.extracted_data);
            }

            if (response.motivation_data) {
              get().setMotivationData(response.motivation_data);
            }

          } catch (error) {
            set({
              error: '发送消息失败',
              isTyping: false,
              isProcessing: false
            });
          }
        },

        setStage: (stage: DialogueStage) => set({ currentStage: stage }),
        setExtractedWork: (data: ExtractedWorkData) => set({ extractedWork: data }),
        setMotivationData: (data: MotivationData) => set({ motivationData: data }),
        clearSession: () => set({
          currentSession: null,
          messages: [],
          isTyping: false,
          isProcessing: false,
          currentStage: 'greeting',
          extractedWork: null,
          motivationData: null,
          error: null,
          quickReplies: []
        })
      }),
      {
        name: 'ai-work-store',
        partialize: (state) => ({
          messages: state.messages,
          currentSession: state.currentSession
        })
      }
    )
  )
);
```

### 3.4 提示词模板系统 (src/services/promptTemplates.ts)

```typescript
export const PROMPT_TEMPLATES = {
  // 系统角色设定
  SYSTEM_ROLE: `你是一位专业的创意教练和动机心理学专家，擅长帮助用户明确创作目标并增强完成动力。
你的风格温暖、鼓励、有条理，同时保持专业性。通过对话引导用户探索创意、明确目标、制定计划。`,

  // 各阶段提示词
  STAGE_PROMPTS: {
    greeting: {
      system: `欢迎用户开始AI辅助创作之旅。了解用户的创作想法，建立信任关系。
目标是激发用户的创作兴趣，引导他们开始思考具体的创作项目。`,
      context: `当前阶段：初次问候和创意引导
需要收集：用户的大致创作方向和兴趣
对话风格：温暖友好，鼓励表达`,
      output_format: `{
        "message": "友好的问候和引导性回复",
        "stage": "discovery",
        "suggestions": {
          "quick_replies": ["我想写一本书", "我想开发一个应用", "我想学习新技能", "我还不太确定"]
        }
      }`
    },

    discovery: {
      system: `深入探索用户的创作想法，帮助他们明确具体的创作目标和内容。
通过提问引导用户思考创作的细节、动机和期望。`,
      context: `当前阶段：创意探索和目标明确
需要收集：具体的创作想法、动机、预期结果
关键问题：创作什么？为什么创作？希望达到什么效果？`,
      output_format: `{
        "message": "探索性的回复和深度提问",
        "stage": "information_gathering",
        "suggestions": {
          "quick_replies": ["详细说说你的想法", "是什么激发了你的灵感？", "你希望达到什么目标？"]
        }
      }`
    },

    information_gathering: {
      system: `收集创作作品的具体信息，包括作品名称、描述、时间规划等。
从对话中智能提取关键信息，形成结构化的作品数据。`,
      context: `当前阶段：信息收集和结构化
需要提取：作品名称、描述、目标时间、颜色偏好
提取原则：准确、完整、符合用户意图`,
      output_format: `{
        "message": "信息收集的回复",
        "stage": "motivation",
        "extracted_data": {
          "name": "作品名称",
          "description": "作品描述",
          "target_hours": 目标小时数,
          "color": "推荐颜色",
          "suggestions": {
            "name_alternatives": ["备选名称1", "备选名称2"],
            "color_recommendations": ["#3498db", "#e67e22"]
          }
        }
      }`
    },

    motivation: {
      system: `应用WOOP方法和执行意图策略，帮助用户增强完成作品的动力。
引导用户制定具体的行动计划和承诺机制。`,
      context: `当前阶段：动机增强和计划制定
应用方法：WOOP（愿望-结果-障碍-计划）、执行意图
目标：增强用户完成作品的动力和信心`,
      output_format: `{
        "message": "动机增强的指导和建议",
        "stage": "confirmation",
        "motivation_data": {
          "woop": {
            "wish": "用户的愿望",
            "outcome": "预期结果",
            "obstacle": "可能的障碍",
            "plan": "应对计划"
          },
          "implementation_intentions": [
            {
              "if": "触发条件",
              "then": "执行行动",
              "priority": 优先级1-5
            }
          ],
          "commitments": {
            "statement": "承诺声明",
            "type": "public|private"
          }
        }
      }`
    },

    confirmation: {
      system: `总结和确认所有收集的信息，让用户对即将创建的作品进行最终确认。
提供清晰的信息展示和调整建议。`,
      context: `当前阶段：信息确认和最终调整
需要确认：作品信息、动机策略、创建意图
后续步骤：创建作品或继续调整`,
      output_format: `{
        "message": "信息确认的总结和建议",
        "stage": "completed",
        "suggestions": {
          "quick_replies": ["确认创建", "调整信息", "重新开始"],
          "actions": ["create_work", "edit_info", "restart"]
        }
      }`
    }
  },

  // 信息提取提示词
  INFORMATION_EXTRACTION: `基于以下对话内容，提取并结构化作品信息：

对话历史：
{conversation_history}

请提取以下信息：
1. 作品名称：最准确的名称表达
2. 作品描述：简洁清晰的描述
3. 目标时间：用户期望投入的小时数
4. 颜色偏好：根据作品性质推荐合适的颜色

返回JSON格式数据，包含置信度评估和改进建议。`,

  // 动机策略提示词
  MOTIVATION_STRATEGY: `基于以下作品信息，应用动机心理学策略增强用户完成动力：

作品信息：
{work_info}

请应用以下方法：
1. WOOP方法：明确愿望、预期结果、可能障碍、应对计划
2. 执行意图：制定"如果...那么..."的具体计划
3. 承诺机制：帮助用户建立明确的承诺

返回JSON格式的动机策略数据。`
};
```

## 4. 组件实现

### 4.1 主对话组件 (src/components/ai-work-creator/AIWorkCreatorDialog.tsx)

```typescript
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ChatContainer } from './ChatContainer';
import { WorkPreview } from './WorkPreview';
import { MotivationSummary } from './MotivationSummary';
import { useAIWorkStore } from '@/stores/aiWorkStore';
import { Brain, X, CheckCircle } from 'lucide-react';

interface AIWorkCreatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (work: any) => void;
}

export function AIWorkCreatorDialog({
  open,
  onOpenChange,
  onSuccess
}: AIWorkCreatorDialogProps) {
  const {
    currentSession,
    messages,
    isTyping,
    isProcessing,
    currentStage,
    extractedWork,
    motivationData,
    error,
    quickReplies,
    startSession,
    sendMessage,
    clearSession
  } = useAIWorkStore();

  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // 开始新会话
  useEffect(() => {
    if (open && !currentSession) {
      startSession();
    }
  }, [open, currentSession, startSession]);

  // 处理发送消息
  const handleSend = async (message: string) => {
    if (message.trim() && !isProcessing) {
      setInputMessage('');
      await sendMessage(message);
    }
  };

  // 处理快捷回复
  const handleQuickReply = (reply: string) => {
    handleSend(reply);
  };

  // 创建作品
  const handleCreateWork = async () => {
    if (!extractedWork) return;

    try {
      const service = new AIWorkService();
      const work = await service.createWorkFromAI({
        extracted_data: extractedWork,
        motivation_data: motivationData,
        conversation_history: messages,
        session_id: currentSession!.session_id
      });

      onSuccess?.(work);
      onOpenChange(false);
      clearSession();
    } catch (error) {
      console.error('创建作品失败:', error);
    }
  };

  // 重置会话
  const handleReset = () => {
    clearSession();
    startSession();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-[90vh]">
          {/* 左侧对话区域 */}
          <div className="flex-1 flex flex-col border-r">
            <DialogHeader className="p-6 pb-4">
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-blue-500" />
                AI创意助手
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 overflow-hidden flex flex-col">
              <ChatContainer
                messages={messages}
                isTyping={isTyping}
                onQuickReply={handleQuickReply}
                quickReplies={quickReplies}
                messagesEndRef={messagesEndRef}
              />

              {/* 输入区域 */}
              <div className="p-4 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="输入你的想法..."
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend(inputMessage);
                      }
                    }}
                    disabled={isProcessing}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSend(inputMessage)}
                    disabled={!inputMessage.trim() || isProcessing}
                  >
                    发送
                  </Button>
                </div>

                {error && (
                  <div className="mt-2 p-2 bg-destructive/10 text-destructive text-sm rounded">
                    {error}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="w-80 flex flex-col">
            {/* 作品预览 */}
            {extractedWork && (
              <div className="flex-1 p-4 overflow-y-auto">
                <WorkPreview
                  data={extractedWork}
                  onEdit={(field, value) => {
                    // 处理编辑逻辑
                  }}
                />
              </div>
            )}

            {/* 动机总结 */}
            {motivationData && (
              <div className="p-4 border-t">
                <MotivationSummary
                  data={motivationData}
                  editable={true}
                  onEdit={(data) => {
                    // 处理编辑逻辑
                  }}
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="p-4 border-t bg-muted/30">
              {currentStage === 'completed' && extractedWork && (
                <div className="space-y-2">
                  <Button
                    onClick={handleCreateWork}
                    className="w-full"
                    size="lg"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    创建作品
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="w-full"
                  >
                    重新开始
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 关闭按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-4 h-8 w-8"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
        </Button>
      </DialogContent>
    </Dialog>
  );
}
```

### 4.2 聊天容器组件 (src/components/ai-work-creator/ChatContainer.tsx)

```typescript
import { useEffect, useRef } from 'react';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { QuickReplies } from './QuickReplies';
import { ChatMessage as ChatMessageType, QuickReplyOption } from '@/types/ai-work';

interface ChatContainerProps {
  messages: ChatMessageType[];
  isTyping: boolean;
  onQuickReply: (reply: string) => void;
  quickReplies: QuickReplyOption[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export function ChatContainer({
  messages,
  isTyping,
  onQuickReply,
  quickReplies,
  messagesEndRef
}: ChatContainerProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => (
        <ChatMessage
          key={message.id}
          message={message}
          onQuickReply={onQuickReply}
        />
      ))}

      {isTyping && <TypingIndicator />}

      {/* 快捷回复 */}
      {quickReplies.length > 0 && !isTyping && (
        <QuickReplies
          options={quickReplies}
          onSelect={onQuickReply}
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
```

### 4.3 消息组件 (src/components/ai-work-creator/ChatMessage.tsx)

```typescript
import { useMemo } from 'react';
import { Markdown } from 'react-markdown';
import { cn } from '@/lib/utils';
import { ChatMessage as ChatMessageType, QuickReplyOption } from '@/types/ai-work';
import { Bot, User, CheckCircle } from 'lucide-react';

interface ChatMessageProps {
  message: ChatMessageType;
  onQuickReply?: (reply: string) => void;
}

export function ChatMessage({ message, onQuickReply }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  const messageContent = useMemo(() => {
    // 处理Markdown内容
    return (
      <div className="prose prose-sm max-w-none">
        <Markdown>{message.content}</Markdown>
      </div>
    );
  }, [message.content]);

  return (
    <div
      className={cn(
        'flex gap-3',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && !isSystem && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Bot className="h-4 w-4 text-white" />
          </div>
        </div>
      )}

      <div
        className={cn(
          'max-w-[80%] rounded-lg px-4 py-3',
          isUser
            ? 'bg-primary text-primary-foreground'
            : isSystem
            ? 'bg-muted text-muted-foreground text-sm'
            : 'bg-muted'
        )}
      >
        {messageContent}

        {/* 快捷回复 */}
        {message.metadata?.quick_replies && onQuickReply && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.metadata.quick_replies.map((reply: string, index: number) => (
              <button
                key={index}
                onClick={() => onQuickReply(reply)}
                className="px-3 py-1 bg-background/50 hover:bg-background/70 rounded-full text-sm border transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

      </div>

      {isUser && (
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
        </div>
      )}
    </div>
  );
}
```

## 5. Rust后端实现

### 5.1 数据库模型 (src-tauri/src/models/ai_work.rs)

```rust
use serde::{Deserialize, Serialize};
use chrono::{DateTime, Utc};

#[derive(Debug, Serialize, Deserialize)]
pub struct AIConversation {
    pub id: Option<i64>,
    pub session_id: String,
    pub role: String,
    pub content: String,
    pub timestamp: DateTime<Utc>,
    pub metadata: Option<serde_json::Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AISession {
    pub id: Option<i64>,
    pub session_id: String,
    pub user_id: Option<String>,
    pub current_stage: String,
    pub status: String,
    pub context: String, // JSON
    pub message_count: i32,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MotivationCommitment {
    pub id: Option<i64>,
    pub work_id: i64,
    pub wish: Option<String>,
    pub outcome: Option<String>,
    pub obstacle: Option<String>,
    pub plan: Option<String>,
    pub implementation_intention: Option<String>,
    pub commitment_statement: Option<String>,
    pub created_at: DateTime<Utc>,
}
```

### 5.2 Tauri命令 (src-tauri/src/commands/ai_work.rs)

```rust
use tauri::State;
use serde_json::json;
use crate::services::ai_service::AIService;
use crate::services::database::Database;

#[tauri::command]
pub async fn start_ai_session(
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    let session_id = uuid::Uuid::new_v4().to_string();

    let session = AISession {
        id: None,
        session_id: session_id.clone(),
        user_id: None,
        current_stage: "greeting".to_string(),
        status: "active".to_string(),
        context: json!({}).to_string(),
        message_count: 0,
        created_at: Utc::now(),
        updated_at: Utc::now(),
    };

    db.create_ai_session(&session).await
        .map_err(|e| format!("Failed to create session: {}", e))?;

    Ok(json!({
        "session_id": session_id,
        "stage": "greeting",
        "status": "active"
    }))
}

#[tauri::command]
pub async fn send_ai_message(
    session_id: String,
    message: String,
    context: String,
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    // 获取AI服务
    let ai_service = AIService::new().await
        .map_err(|e| format!("Failed to initialize AI service: {}", e))?;

    // 调用AI API
    let response = ai_service.send_message(&session_id, &message, &context).await
        .map_err(|e| format!("AI service error: {}", e))?;

    // 保存对话记录
    let user_message = AIConversation {
        id: None,
        session_id: session_id.clone(),
        role: "user".to_string(),
        content: message,
        timestamp: Utc::now(),
        metadata: None,
    };

    let ai_message = AIConversation {
        id: None,
        session_id: session_id.clone(),
        role: "assistant".to_string(),
        content: response.message.clone(),
        timestamp: Utc::now(),
        metadata: Some(json!({
            "stage": response.stage,
        })),
    };

    db.save_conversation(&user_message).await
        .map_err(|e| format!("Failed to save conversation: {}", e))?;

    db.save_conversation(&ai_message).await
        .map_err(|e| format!("Failed to save conversation: {}", e))?;

    // 更新会话状态
    db.update_ai_session_stage(&session_id, &response.stage.unwrap_or_default()).await
        .map_err(|e| format!("Failed to update session: {}", e))?;

    Ok(json!(response))
}

#[tauri::command]
pub async fn extract_work_information(
    session_id: String,
    conversation_history: String,
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    let ai_service = AIService::new().await
        .map_err(|e| format!("Failed to initialize AI service: {}", e))?;

    let extracted_data = ai_service.extract_work_info(&conversation_history).await
        .map_err(|e| format!("Failed to extract work information: {}", e))?;

    Ok(json!(extracted_data))
}

#[tauri::command]
pub async fn generate_motivation_strategies(
    session_id: String,
    work_info: String,
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    let ai_service = AIService::new().await
        .map_err(|e| format!("Failed to initialize AI service: {}", e))?;

    let motivation_data = ai_service.generate_motivation_strategies(&work_info).await
        .map_err(|e| format!("Failed to generate motivation strategies: {}", e))?;

    Ok(json!(motivation_data))
}

#[tauri::command]
pub async fn create_work_from_ai(
    extracted_data: serde_json::Value,
    motivation_data: Option<serde_json::Value>,
    conversation_history: serde_json::Value,
    session_id: String,
    db: State<'_, Database>
) -> Result<serde_json::Value, String> {
    // 创建作品
    let work = CreateWorkParams {
        name: extracted_data["name"].as_str().unwrap_or_default().to_string(),
        description: extracted_data["description"].as_str().map(|s| s.to_string()),
        color: extracted_data["color"].as_str().map(|s| s.to_string()),
        target_hours: extracted_data["target_hours"].as_f64().unwrap_or(8.0) as f64,
    };

    let created_work = db.create_work(&work).await
        .map_err(|e| format!("Failed to create work: {}", e))?;

    // 保存动机数据
    if let Some(motivation) = motivation_data {
        if let Some(wish) = motivation["woop"]["wish"].as_str() {
            let commitment = MotivationCommitment {
                id: None,
                work_id: created_work.id,
                wish: Some(wish.to_string()),
                outcome: motivation["woop"]["outcome"].as_str().map(|s| s.to_string()),
                obstacle: motivation["woop"]["obstacle"].as_str().map(|s| s.to_string()),
                plan: motivation["woop"]["plan"].as_str().map(|s| s.to_string()),
                implementation_intention: motivation["implementation_intentions"].as_str().map(|s| s.to_string()),
                commitment_statement: motivation["commitments"]["statement"].as_str().map(|s| s.to_string()),
                created_at: Utc::now(),
            };

            db.save_motivation_commitment(&commitment).await
                .map_err(|e| format!("Failed to save motivation data: {}", e))?;
        }
    }

    // 标记会话为完成
    db.update_ai_session_status(&session_id, "completed").await
        .map_err(|e| format!("Failed to update session status: {}", e))?;

    Ok(json!(created_work))
}
```

### 5.3 AI服务实现 (src-tauri/src/services/ai_service.rs)

```rust
use serde::{Deserialize, Serialize};
use serde_json::json;
use reqwest::Client;
use std::env;

#[derive(Debug, Serialize, Deserialize)]
pub struct AIRequest {
    model: String,
    messages: Vec<ChatMessage>,
    temperature: f64,
    max_tokens: i32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AIResponse {
    message: String,
    stage: Option<String>,
    extracted_data: Option<serde_json::Value>,
    motivation_data: Option<serde_json::Value>,
    suggestions: Option<AISuggestions>,
    metadata: serde_json::Value,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AISuggestions {
    quick_replies: Option<Vec<String>>,
    actions: Option<Vec<String>>,
}

pub struct AIService {
    client: Client,
    api_key: String,
    api_endpoint: String,
    model: String,
}

impl AIService {
    pub async fn new() -> Result<Self, Box<dyn std::error::Error>> {
        let client = Client::new();
        let api_key = env::var("OPENAI_API_KEY")
            .unwrap_or_else(|_| "default_key".to_string());
        let api_endpoint = env::var("AI_API_ENDPOINT")
            .unwrap_or_else(|_| "https://api.openai.com/v1/chat/completions".to_string());
        let model = env::var("AI_MODEL")
            .unwrap_or_else(|_| "gpt-3.5-turbo".to_string());

        Ok(Self {
            client,
            api_key,
            api_endpoint,
            model,
        })
    }

    pub async fn send_message(
        &self,
        session_id: &str,
        message: &str,
        context: &str,
    ) -> Result<AIResponse, Box<dyn std::error::Error>> {
        let context_data: serde_json::Value = serde_json::from_str(context)?;
        let current_stage = context_data["stage"].as_str().unwrap_or("greeting");

        // 构建提示词
        let system_prompt = self.get_system_prompt(current_stage);
        let context_prompt = self.get_context_prompt(current_stage, context);
        let output_format = self.get_output_format(current_stage);

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: format!("{}\\n{}\\n输出格式：{}", system_prompt, context_prompt, output_format),
            },
            ChatMessage {
                role: "user".to_string(),
                content: message.to_string(),
            },
        ];

        let request = AIRequest {
            model: self.model.clone(),
            messages,
            temperature: 0.7,
            max_tokens: 1000,
        };

        let response = self.client
            .post(&self.api_endpoint)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        let ai_response: OpenAIResponse = response.json().await?;

        // 解析AI响应
        self.parse_ai_response(&ai_response.choices[0].message.content, current_stage)
            .await
    }

    pub async fn extract_work_info(
        &self,
        conversation_history: &str,
    ) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let prompt = format!(
            "基于以下对话内容，提取作品信息：\\n{}\\n\\n请返回JSON格式的作品信息。",
            conversation_history
        );

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "你是一个专业的信息提取助手，能从对话中准确提取关键信息并转换为结构化数据。".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            },
        ];

        let request = AIRequest {
            model: self.model.clone(),
            messages,
            temperature: 0.3,
            max_tokens: 500,
        };

        let response = self.client
            .post(&self.api_endpoint)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        let ai_response: OpenAIResponse = response.json().await?;
        let content = &ai_response.choices[0].message.content;

        // 尝试解析JSON
        serde_json::from_str(content)
            .map_err(|_| Ok(json!({"raw_content": content})))
            .unwrap_or_else(|_| Ok(json!({"raw_content": content})))
    }

    pub async fn generate_motivation_strategies(
        &self,
        work_info: &str,
    ) -> Result<serde_json::Value, Box<dyn std::error::Error>> {
        let prompt = format!(
            "基于以下作品信息，应用WOOP方法和执行意图策略生成动机增强方案：\\n{}\\n\\n请返回JSON格式的动机策略数据。",
            work_info
        );

        let messages = vec![
            ChatMessage {
                role: "system".to_string(),
                content: "你是一个动机心理学专家，擅长应用WOOP方法和执行意图策略帮助用户增强完成动力。".to_string(),
            },
            ChatMessage {
                role: "user".to_string(),
                content: prompt,
            },
        ];

        let request = AIRequest {
            model: self.model.clone(),
            messages,
            temperature: 0.7,
            max_tokens: 800,
        };

        let response = self.client
            .post(&self.api_endpoint)
            .header("Authorization", format!("Bearer {}", self.api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;

        let ai_response: OpenAIResponse = response.json().await?;
        let content = &ai_response.choices[0].message.content;

        serde_json::from_str(content)
            .map_err(|_| Ok(json!({"raw_content": content})))
            .unwrap_or_else(|_| Ok(json!({"raw_content": content})))
    }

    fn get_system_prompt(&self, stage: &str) -> String {
        match stage {
            "greeting" => "你是一位专业的创意教练，擅长帮助用户探索创作想法。你的风格温暖友好，鼓励用户表达创意。",
            "discovery" => "你是一位专业的创意教练，擅长通过深度提问帮助用户明确创作目标和动机。",
            "information_gathering" => "你是一个专业的信息提取助手，能从对话中准确提取关键信息并转换为结构化数据。",
            "motivation" => "你是一位动机心理学专家，擅长应用WOOP方法和执行意图策略帮助用户增强完成动力。",
            "confirmation" => "你是一位专业的创意助手，擅长总结和确认信息，为用户提供清晰的指导。",
            _ => "你是一位专业的创意教练和动机心理学专家。",
        }
    }

    fn get_context_prompt(&self, stage: &str, context: &str) -> String {
        match stage {
            "greeting" => "当前阶段：初次问候和创意引导。目标：了解用户的创作兴趣，激发创作灵感。",
            "discovery" => "当前阶段：创意探索和目标明确。目标：深入挖掘用户的创作想法和动机。",
            "information_gathering" => "当前阶段：信息收集和结构化。目标：提取作品的具体信息。",
            "motivation" => "当前阶段：动机增强和计划制定。目标：应用WOOP方法增强用户动力。",
            "confirmation" => "当前阶段：信息确认和最终调整。目标：总结信息并准备创建作品。",
            _ => "继续与用户的创意对话。",
        }
    }

    fn get_output_format(&self, stage: &str) -> String {
        format!(
            "请返回JSON格式响应，包含：message（回复内容）、stage（下一阶段）、{}",
            match stage {
                "information_gathering" => "extracted_data（提取的作品信息）",
                "motivation" => "motivation_data（动机策略数据）",
                _ => "suggestions（快速回复建议）",
            }
        )
    }

    async fn parse_ai_response(
        &self,
        content: &str,
        stage: &str,
    ) -> Result<AIResponse, Box<dyn std::error::Error>> {
        // 尝试解析JSON响应
        if let Ok(parsed) = serde_json::from_str::<serde_json::Value>(content) {
            return Ok(AIResponse {
                message: parsed["message"].as_str().unwrap_or(content).to_string(),
                stage: parsed["stage"].as_str().map(|s| s.to_string()),
                extracted_data: parsed.get("extracted_data").cloned(),
                motivation_data: parsed.get("motivation_data").cloned(),
                suggestions: parsed.get("suggestions").cloned().map(|s| serde_json::from_value(s).unwrap_or_default()),
                metadata: parsed.get("metadata").cloned().unwrap_or_default(),
            });
        }

        // 如果JSON解析失败，返回简单响应
        Ok(AIResponse {
            message: content.to_string(),
            stage: None,
            extracted_data: None,
            motivation_data: None,
            suggestions: None,
            metadata: json!({}),
        })
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIResponse {
    choices: Vec<OpenAIChoice>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIChoice {
    message: OpenAIMessage,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAIMessage {
    content: String,
}
```

## 6. 数据库迁移

### 6.1 数据库迁移文件

```sql
-- AI对话历史表
CREATE TABLE IF NOT EXISTS ai_conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT -- JSON格式存储元数据
);

-- AI会话表
CREATE TABLE IF NOT EXISTS ai_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    user_id TEXT,
    current_stage TEXT NOT NULL DEFAULT 'greeting',
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    context TEXT, -- JSON格式存储上下文
    message_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 动机承诺表
CREATE TABLE IF NOT EXISTS motivation_commitments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    work_id INTEGER NOT NULL,
    wish TEXT,
    outcome TEXT,
    obstacle TEXT,
    plan TEXT,
    implementation_intention TEXT,
    commitment_statement TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (work_id) REFERENCES works(id) ON DELETE CASCADE
);

-- 扩展作品表
ALTER TABLE works ADD COLUMN ai_created BOOLEAN DEFAULT FALSE;
ALTER TABLE works ADD COLUMN ai_session_id TEXT;
ALTER TABLE works ADD COLUMN motivation_summary TEXT;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_ai_conversations_session_id ON ai_conversations(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_session_id ON ai_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_sessions_status ON ai_sessions(status);
CREATE INDEX IF NOT EXISTS idx_motivation_commitments_work_id ON motivation_commitments(work_id);
```

## 7. 集成到现有系统

### 7.1 修改作品管理页面 (src/pages/Works.tsx)

```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkList } from '@/components/works/WorkList';
import { WorkFormModal } from '@/components/works/WorkFormModal';
import { AIWorkCreatorDialog } from '@/components/ai-work-creator/AIWorkCreatorDialog';
import { Plus, Brain } from 'lucide-react';

export function Works() {
  const [showFormModal, setShowFormModal] = useState(false);
  const [showAICreator, setShowAICreator] = useState(false);
  const [selectedWork, setSelectedWork] = useState<Work | null>(null);

  const handleWorkCreated = (work: Work) => {
    // 刷新作品列表
    setShowAICreator(false);
    setShowFormModal(false);
    setSelectedWork(null);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">作品管理</h1>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowAICreator(true)}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            AI创作助手
          </Button>
          <Button
            onClick={() => setShowFormModal(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            传统创建
          </Button>
        </div>
      </div>

      <WorkList
        onEdit={(work) => {
          setSelectedWork(work);
          setShowFormModal(true);
        }}
      />

      {/* AI创作对话框 */}
      <AIWorkCreatorDialog
        open={showAICreator}
        onOpenChange={setShowAICreator}
        onSuccess={handleWorkCreated}
      />

      {/* 传统表单对话框 */}
      <WorkFormModal
        open={showFormModal}
        onOpenChange={(open) => {
          setShowFormModal(open);
          if (!open) setSelectedWork(null);
        }}
        work={selectedWork}
        onSuccess={handleWorkCreated}
      />
    </div>
  );
}
```

## 8. 测试计划

### 8.1 单元测试
- AI服务单元测试
- 状态管理测试
- 组件渲染测试
- 数据验证测试

### 8.2 集成测试
- 端到端对话流程测试
- 数据库操作测试
- AI API集成测试
- 错误处理测试

### 8.3 用户测试
- 可用性测试
- 用户体验测试
- 功能完整性测试
- 性能测试

## 9. 部署和发布

### 9.1 构建配置
```json
{
  "build": {
    "beforeBuildCommand": "npm run build",
    "beforeDevCommand": "npm run dev",
    "devPath": "http://localhost:1420",
    "distDir": "../dist"
  }
}
```

### 9.2 环境变量
```bash
# .env.production
VITE_AI_API_KEY=your_production_api_key
VITE_AI_API_ENDPOINT=https://api.openai.com/v1
VITE_AI_MODEL=gpt-3.5-turbo
```

## 10. 监控和日志

### 10.1 性能监控
- AI响应时间监控
- 对话完成率统计
- 用户行为分析
- 系统性能指标

### 10.2 错误监控
- AI服务错误
- 数据库错误
- 前端错误
- 网络错误

---

*本文档最后更新时间: 2025-09-21*