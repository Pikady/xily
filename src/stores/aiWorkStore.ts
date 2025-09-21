import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import {
  AISession,
  ChatMessage,
  DialogueStage,
  ExtractedWorkData,
  MotivationData,
  AIError,
  AIWorkCreatorState
} from '@/types/ai-work';
import { aiWorkService } from '@/services/aiWorkService';

interface AIWorkStore extends AIWorkCreatorState {
  // Actions
  startSession: () => Promise<void>;
  resumeSession: (sessionId: string) => Promise<void>;
  sendMessage: (message: string) => Promise<void>;
  setStage: (stage: DialogueStage) => void;
  setExtractedWork: (data: ExtractedWorkData) => void;
  setMotivationData: (data: MotivationData) => void;
  updateExtractedWork: (field: string, value: any) => void;
  updateMotivationData: (data: Partial<MotivationData>) => void;
  addMessage: (message: ChatMessage) => void;
  setError: (error: string | AIError | null) => void;
  clearSession: () => void;
  retryLastAction: () => Promise<void>;
}

export const useAIWorkStore = create<AIWorkStore>()(
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

        // Actions
        startSession: async () => {
          try {
            set({ isProcessing: true, error: null });

            const session = await aiWorkService.startSession();

            set({
              currentSession: session,
              messages: [],
              currentStage: 'greeting',
              isProcessing: false
            });

            console.log('AI session started:', session.session_id);
          } catch (error) {
            console.error('Failed to start AI session:', error);
            set({
              error: error instanceof Error ? { code: 'STARTUP_ERROR', message: error.message, retryable: true, timestamp: new Date() } : { code: 'STARTUP_ERROR', message: '启动会话失败', retryable: true, timestamp: new Date() },
              isProcessing: false
            });
          }
        },

        // 恢复会话
        resumeSession: async (sessionId: string) => {
          try {
            set({ isProcessing: true, error: null });

            const session = await aiWorkService.resumeSession(sessionId);

            set({
              currentSession: session,
              isProcessing: false
            });

            console.log('AI session resumed:', session.session_id);
          } catch (error) {
            console.error('Failed to resume AI session:', error);
            set({
              error: error instanceof Error ? { code: 'RESUME_ERROR', message: error.message, retryable: true, timestamp: new Date() } : { code: 'RESUME_ERROR', message: '恢复会话失败', retryable: true, timestamp: new Date() },
              isProcessing: false
            });
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
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };

            // 创建临时的AI消息用于流式显示
            const tempAiMessage: ChatMessage = {
              id: (Date.now() + 1).toString(),
              session_id: state.currentSession.session_id,
              role: 'assistant',
              content: '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              metadata: {
                stage: state.currentStage,
              }
            };

            set({
              messages: [...state.messages, userMessage, tempAiMessage],
              isTyping: true,
              isProcessing: true
            });

            // 构建上下文
            const context = {
              stage: state.currentStage,
              messages: [...state.messages, userMessage],
              extractedWork: state.extractedWork,
              motivationData: state.motivationData
            };

            // 调用AI服务，支持流式响应
            const response = await aiWorkService.sendMessage(
              state.currentSession.session_id,
              message,
              context,
              // 流式回调函数
              (streamContent: string) => {
                set((state) => ({
                  messages: state.messages.map(msg =>
                    msg.id === tempAiMessage.id
                      ? { ...msg, content: streamContent, updated_at: new Date().toISOString() }
                      : msg
                  )
                }));
                // 一旦开始流式响应，就隐藏输入指示器
                if (streamContent.length > 0) {
                  set({ isTyping: false });
                }
              }
            );

            // 检查是否创建了新的会话
            let currentSessionId = state.currentSession.session_id;
            if (response.metadata?.new_session_id) {
              // 如果创建了新会话，更新当前会话
              currentSessionId = response.metadata.new_session_id;
              const newSession = await aiWorkService.resumeSession(currentSessionId);
              set({
                currentSession: newSession
              });
            }

            // 更新AI响应的最终内容
            const finalAiMessage: ChatMessage = {
              id: tempAiMessage.id,
              session_id: currentSessionId,
              role: 'assistant',
              content: response.message,
              created_at: tempAiMessage.created_at,
              updated_at: new Date().toISOString(),
              metadata: {
                stage: response.stage
              }
            };

            const updatedMessages = [...state.messages, userMessage, finalAiMessage];

            set({
              messages: updatedMessages,
              isTyping: false,
              isProcessing: false,
              currentStage: response.stage || state.currentStage
            });

            // 处理提取的数据
            if (response.extracted_data) {
              get().setExtractedWork(response.extracted_data);
            }

            if (response.motivation_data) {
              get().setMotivationData(response.motivation_data);
            }

            // 自动阶段转换检查
            if (response.stage && response.stage !== state.currentStage) {
              console.log(`Stage transition: ${state.currentStage} -> ${response.stage}`);
            }

          } catch (error) {
            console.error('Failed to send message:', error);
            set({
              error: error instanceof Error ? { code: 'SEND_ERROR', message: error.message, retryable: true, timestamp: new Date() } : { code: 'SEND_ERROR', message: '发送消息失败', retryable: true, timestamp: new Date() },
              isTyping: false,
              isProcessing: false
            });
          }
        },

        setStage: (stage: DialogueStage) => {
          set({
            currentStage: stage
          });
        },

        setExtractedWork: (data: ExtractedWorkData) => {
          set({ extractedWork: data });
        },

        setMotivationData: (data: MotivationData) => {
          set({ motivationData: data });
        },

        updateExtractedWork: (field: string, value: any) => {
          set((state) => ({
            extractedWork: state.extractedWork
              ? { ...state.extractedWork, [field]: value }
              : null
          }));
        },

        updateMotivationData: (data: Partial<MotivationData>) => {
          set((state) => ({
            motivationData: state.motivationData
              ? { ...state.motivationData, ...data }
              : null
          }));
        },

        addMessage: (message: ChatMessage) => {
          set((state) => ({
            messages: [...state.messages, message]
          }));
        },

        setError: (error: string | AIError | null) => {
          set({
            error: typeof error === 'string' ? { code: 'CUSTOM_ERROR', message: error, retryable: true, timestamp: new Date() } : error
          });
        },

        clearSession: () => {
          set({
            currentSession: null,
            messages: [],
            isTyping: false,
            isProcessing: false,
            currentStage: 'greeting',
            extractedWork: null,
            motivationData: null,
            error: null
          });
        },

        retryLastAction: async () => {
          const state = get();
          if (state.messages.length === 0) {
            await get().startSession();
          } else {
            const lastUserMessage = state.messages
              .filter(m => m.role === 'user')
              .pop();

            if (lastUserMessage) {
              await get().sendMessage(lastUserMessage.content);
            }
          }
        }
      }),
      {
        name: 'ai-work-store',
        partialize: (state) => ({
          currentSession: state.currentSession,
          messages: state.messages,
          currentStage: state.currentStage,
          extractedWork: state.extractedWork,
          motivationData: state.motivationData
        }),
        version: 1
      }
    ),
    {
      name: 'AI Work Store'
    }
  )
);

// 导出便捷的选择器
export const selectAIWorkState = (state: AIWorkStore) => ({
  currentSession: state.currentSession,
  messages: state.messages,
  isTyping: state.isTyping,
  isProcessing: state.isProcessing,
  currentStage: state.currentStage,
  extractedWork: state.extractedWork,
  motivationData: state.motivationData,
  error: state.error
});

export const selectAIWorkActions = (state: AIWorkStore) => ({
  startSession: state.startSession,
  sendMessage: state.sendMessage,
  setStage: state.setStage,
  setExtractedWork: state.setExtractedWork,
  setMotivationData: state.setMotivationData,
  updateExtractedWork: state.updateExtractedWork,
  updateMotivationData: state.updateMotivationData,
  addMessage: state.addMessage,
  setError: state.setError,
  clearSession: state.clearSession,
  retryLastAction: state.retryLastAction
});

// Hook for stage-specific actions
export function useStageActions() {
  const currentStage = useAIWorkStore((state) => state.currentStage);
  const actions = selectAIWorkActions(useAIWorkStore.getState());

  const transitionToNextStage = async () => {
    const stageOrder: DialogueStage[] = [
      'greeting',
      'discovery',
      'information_gathering',
      'motivation',
      'confirmation',
      'completed'
    ];

    const currentIndex = stageOrder.indexOf(currentStage);
    if (currentIndex < stageOrder.length - 1) {
      const nextStage = stageOrder[currentIndex + 1];
      actions.setStage(nextStage);
    }
  };

  return {
    currentStage,
    transitionToNextStage,
    ...actions
  };
}

// Hook for data validation
export function useDataValidation() {
  const extractedWork = useAIWorkStore((state) => state.extractedWork);
  const motivationData = useAIWorkStore((state) => state.motivationData);

  const validateExtractedData = () => {
    if (!extractedWork) return { isValid: false, errors: ['缺少作品信息'] };

    const errors: string[] = [];

    if (!extractedWork.name || extractedWork.name.trim().length < 1) {
      errors.push('作品名称不能为空');
    }

    if (extractedWork.name && extractedWork.name.length > 100) {
      errors.push('作品名称不能超过100个字符');
    }

    if (extractedWork.target_hours < 0.5 || extractedWork.target_hours > 1000) {
      errors.push('目标时间应在0.5-1000小时之间');
    }


    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const validateMotivationData = () => {
    if (!motivationData) return { isValid: false, errors: ['缺少动机策略'] };

    const errors: string[] = [];
    let hasValidStrategy = false;

    if (motivationData.woop) {
      const { wish, outcome, obstacle, plan } = motivationData.woop;
      if (wish && outcome && obstacle && plan) {
        hasValidStrategy = true;
      } else {
        errors.push('WOOP方法不完整');
      }
    }

    if (motivationData.implementation_intentions && motivationData.implementation_intentions.length > 0) {
      hasValidStrategy = true;
    }

    if (motivationData.commitments) {
      hasValidStrategy = true;
    }

    if (!hasValidStrategy) {
      errors.push('缺少有效的动机策略');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    validateExtractedData,
    validateMotivationData,
    isComplete: extractedWork && motivationData && validateExtractedData().isValid && validateMotivationData().isValid
  };
}