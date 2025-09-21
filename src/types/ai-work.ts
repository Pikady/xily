import { IdEntity, TimestampEntity } from './api';

// AI对话消息角色
export type ChatRole = 'user' | 'assistant' | 'system';

// AI对话消息
export interface ChatMessage extends TimestampEntity {
  id?: string;
  session_id: string;
  role: ChatRole;
  content: string;
  metadata?: {
    type?: 'text' | 'quick_reply' | 'system';
    stage?: string;
    confidence?: number;
    extracted_data?: any;
    quick_replies?: string[];
  };
}

// AI会话信息
export interface AISession extends IdEntity, TimestampEntity {
  session_id: string;
  user_id?: string;
  current_stage: DialogueStage;
  status: 'active' | 'completed' | 'cancelled';
  context: SessionContext;
  message_count: number;
}

// 对话阶段
export type DialogueStage =
  | 'greeting'           // 问候和引导
  | 'discovery'          // 创意探索
  | 'information_gathering' // 信息收集
  | 'motivation'         // 动机增强
  | 'confirmation'       // 信息确认
  | 'completed';         // 完成

// 会话上下文
export interface SessionContext {
  user_preferences?: {
    name?: string;
    communication_style?: 'formal' | 'casual' | 'encouraging';
  };
  conversation_history?: ChatMessage[];
  extracted_data?: ExtractedWorkData;
  motivation_data?: MotivationData;
  temporary_data?: {
    ideas?: string[];
    keywords?: string[];
    emotions?: string[];
  };
}

// AI提取的作品数据
export interface ExtractedWorkData {
  name: string;
  description?: string;
  target_hours: number;
  color?: string;
  confidence: number; // AI对提取数据的置信度 0-1
  extraction_notes?: string;
  suggestions?: {
    name_alternatives?: string[];
    description_improvements?: string[];
    target_hour_recommendations?: number[];
    color_recommendations?: string[];
  };
}

// 动机心理学数据
export interface MotivationData {
  // WOOP方法数据
  woop?: {
    wish: string;           // 愿望
    outcome: string;        // 结果
    obstacle: string;       // 障碍
    plan: string;           // 计划
  };

  // 执行意图
  implementation_intentions?: {
    if: string;             // 如果...
    then: string;           // 那么...
    priority: number;       // 优先级 1-5
  }[];

  // 承诺机制
  commitments?: {
    statement: string;      // 承诺声明
    type: 'public' | 'private';
    deadline?: string;
    accountability_partner?: string;
  };

  // 激励因素
  motivation_factors?: {
    intrinsic: string[];    // 内在动机
    extrinsic: string[];    // 外在动机
    values: string[];       // 相关价值观
  };
}

// AI响应类型
export interface AIResponse {
  message: string;
  stage?: DialogueStage;
  extracted_data?: ExtractedWorkData;
  motivation_data?: MotivationData;
  suggestions?: {
    quick_replies?: string[];
    actions?: string[];
  };
  metadata?: {
    processing_time?: number;
    confidence?: number;
    model?: string;
  };
}

// 创建作品的请求数据（AI版本）
export interface CreateWorkFromAIParams {
  extracted_data: ExtractedWorkData;
  motivation_data?: MotivationData;
  conversation_history: ChatMessage[];
  session_id: string;
}

// 快捷回复选项
export interface QuickReplyOption {
  id: string;
  text: string;
  action?: 'send' | 'extract' | 'motivate' | 'confirm';
  metadata?: any;
}

// AI服务配置
export interface AIServiceConfig {
  api_endpoint: string;
  api_key?: string;
  model: string;
  max_tokens: number;
  temperature: number;
  timeout: number;
}

// 对话模板
export interface DialogueTemplate {
  stage: DialogueStage;
  system_prompt: string;
  user_context_prompt?: string;
  expected_outputs: {
    message: boolean;
    extracted_data?: boolean;
    motivation_data?: boolean;
  };
  quick_replies?: QuickReplyOption[];
}

// AI错误类型
export interface AIError {
  code: string;
  message: string;
  details?: any;
  retryable: boolean;
  timestamp: Date;
}

// 组件Props类型
export interface AIWorkCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (work: any) => void;
  onCancel?: () => void;
}

export interface ChatMessageProps {
  message: ChatMessage;
  isTyping?: boolean;
  onQuickReply?: (reply: string) => void;
}

export interface WorkPreviewProps {
  data: ExtractedWorkData;
  onEdit?: (field: string, value: any) => void;
  isValid?: boolean;
}

export interface MotivationSummaryProps {
  data: MotivationData;
  editable?: boolean;
  onEdit?: (data: MotivationData) => void;
}

// 状态类型
export interface AIWorkCreatorState {
  currentSession: AISession | null;
  messages: ChatMessage[];
  isTyping: boolean;
  isProcessing: boolean;
  currentStage: DialogueStage;
  extractedWork: ExtractedWorkData | null;
  motivationData: MotivationData | null;
  error: AIError | null;
  quickReplies: QuickReplyOption[];
}