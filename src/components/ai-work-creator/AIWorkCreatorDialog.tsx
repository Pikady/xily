import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ChatContainer } from './ChatContainer';
import { WorkPreview } from './WorkPreview';
import { MotivationSummary } from './MotivationSummary';
import { useAIWorkStore, useDataValidation } from '@/stores/aiWorkStore';
import { aiWorkService } from '@/services/aiWorkService';
import { Brain, X, CheckCircle, RefreshCw, AlertCircle } from 'lucide-react';

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
    updateExtractedWork,
    updateMotivationData,
    clearSession,
    retryLastAction
  } = useAIWorkStore();

  const { validateExtractedData, validateMotivationData, isComplete } = useDataValidation();

  const [inputMessage, setInputMessage] = useState('');
  const [isCreating, setIsCreating] = useState(false);
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

  // 重置状态当对话框关闭
  useEffect(() => {
    if (!open) {
      setInputMessage('');
      setIsCreating(false);
    }
  }, [open]);

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

  // 处理作品信息编辑
  const handleWorkEdit = (field: string, value: any) => {
    updateExtractedWork(field, value);
  };

  // 处理动机数据编辑
  const handleMotivationEdit = (data: any) => {
    updateMotivationData(data);
  };

  // 创建作品
  const handleCreateWork = async () => {
    if (!extractedWork || isCreating) return;

    const dataValidation = validateExtractedData();
    const motivationValidation = validateMotivationData();

    if (!dataValidation.isValid) {
      alert('请完善作品信息：\\n' + dataValidation.errors.join('\\n'));
      return;
    }

    if (!motivationValidation.isValid) {
      alert('请完善动机策略：\\n' + motivationValidation.errors.join('\\n'));
      return;
    }

    try {
      setIsCreating(true);

      const work = await aiWorkService.createWorkFromAI({
        extracted_data: extractedWork,
        motivation_data: motivationData || undefined,
        conversation_history: messages,
        session_id: currentSession!.session_id
      });

      onSuccess?.(work);
      onOpenChange(false);
      clearSession();

    } catch (error) {
      console.error('创建作品失败:', error);
      alert('创建作品失败，请重试');
    } finally {
      setIsCreating(false);
    }
  };

  // 重置会话
  const handleReset = () => {
    clearSession();
    startSession();
  };

  // 重试上次操作
  const handleRetry = async () => {
    await retryLastAction();
  };

  // 获取阶段标题
  const getStageTitle = () => {
    const stageTitles = {
      greeting: '👋 欢迎来到AI创意助手',
      discovery: '🔍 创意探索',
      information_gathering: '📝 信息整理',
      motivation: '💪 动机增强',
      confirmation: '✅ 确认信息',
      completed: '🎉 准备创建'
    };
    return stageTitles[currentStage] || 'AI创意助手';
  };

  // 获取阶段进度
  const getStageProgress = () => {
    const stages: Array<keyof typeof stageTitles> = ['greeting', 'discovery', 'information_gathering', 'motivation', 'confirmation', 'completed'];
    const currentIndex = stages.indexOf(currentStage);
    return ((currentIndex + 1) / stages.length) * 100;
  };

  const stageTitles = {
    greeting: '👋 欢迎来到AI创意助手',
    discovery: '🔍 创意探索',
    information_gathering: '📝 信息整理',
    motivation: '💪 动机增强',
    confirmation: '✅ 确认信息',
    completed: '🎉 准备创建'
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-[90vh]">
          {/* 左侧对话区域 */}
          <div className="flex-1 flex flex-col border-r bg-background">
            {/* 头部 */}
            <div className="p-6 pb-4 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <Brain className="h-5 w-5 text-blue-500" />
                    {getStageTitle()}
                  </DialogTitle>
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getStageProgress()}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-1">
                      <Badge variant="outline" className="text-xs">
                        {currentStage}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {messages.length} 条消息
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 对话区域 */}
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
                    disabled={isProcessing || isCreating}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => handleSend(inputMessage)}
                    disabled={!inputMessage.trim() || isProcessing || isCreating}
                  >
                    {isProcessing ? '发送中...' : '发送'}
                  </Button>
                </div>

                {/* 错误提示 */}
                {error && (
                  <div className="mt-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <div className="flex items-center gap-2 text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">错误</span>
                    </div>
                    <p className="text-sm text-destructive mt-1">
                      {typeof error === 'string' ? error : error.message}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleRetry}
                      className="mt-2 h-8 text-xs"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      重试
                    </Button>
                  </div>
                )}

                {/* 帮助提示 */}
                {currentStage === 'greeting' && messages.length === 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      💡 提示：告诉我你的创作想法，我会帮你规划并制定完成计划！
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 右侧信息面板 */}
          <div className="w-96 flex flex-col bg-muted/5">
            {/* 作品预览 */}
            {extractedWork && (
              <div className="flex-1 p-4 overflow-y-auto">
                <WorkPreview
                  data={extractedWork}
                  onEdit={handleWorkEdit}
                  isValid={validateExtractedData().isValid}
                />
              </div>
            )}

            {/* 动机总结 */}
            {motivationData && (
              <div className="p-4 border-t bg-background">
                <MotivationSummary
                  data={motivationData}
                  editable={true}
                  onEdit={handleMotivationEdit}
                />
              </div>
            )}

            {/* 操作按钮 */}
            <div className="p-4 border-t bg-background">
              {currentStage === 'completed' && extractedWork && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    {isComplete ? '所有信息已完善' : '请完善信息后创建'}
                  </div>

                  <Button
                    onClick={handleCreateWork}
                    className="w-full"
                    size="lg"
                    disabled={!isComplete || isCreating}
                  >
                    {isCreating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        创建中...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        创建作品
                      </>
                    )}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={handleReset}
                      className="flex-1"
                      disabled={isCreating}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      重新开始
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => onOpenChange(false)}
                      disabled={isCreating}
                    >
                      取消
                    </Button>
                  </div>
                </div>
              )}

              {currentStage !== 'completed' && extractedWork && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    继续对话以完善作品信息和动机策略
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}