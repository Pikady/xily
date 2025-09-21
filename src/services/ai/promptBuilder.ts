import { DialogueStage, ChatMessage, ExtractedWorkData, MotivationData } from '@/types/ai-work';
import { DeepSeekMessage } from './config';

export interface PromptContext {
  stage: DialogueStage;
  messages: ChatMessage[];
  extractedData?: ExtractedWorkData;
  motivationData?: MotivationData;
  userPreferences?: {
    name?: string;
    style?: 'formal' | 'casual' | 'encouraging';
  };
}

export class PromptBuilder {
  // 系统角色定义
  private static readonly SYSTEM_ROLE = `你是一位专业的创意教练和动机心理学专家，擅长帮助用户明确创作目标并增强完成动力。

你的核心能力：
1. 创意引导：帮助用户发掘和明确创作想法
2. 动机增强：应用WOOP方法和执行意图策略增强动力
3. 信息提取：从对话中准确提取关键信息
4. 个性化支持：根据用户特点提供定制化建议

对话原则：
- 保持温暖友好的语气
- 提供具体、可行的建议
- 适时鼓励和肯定用户
- 引导用户深度思考
- 避免过于抽象或笼统的表达

重要提醒：
- 始终用中文回复
- 保持回复简洁明了，重点突出
- 根据对话阶段调整回复风格和内容`;

  // 阶段特定的系统提示词
  private static readonly STAGE_SYSTEM_PROMPTS: Record<DialogueStage, string> = {
    greeting: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：初次问候和创意引导
任务目标：
1. 热情问候并建立信任关系
2. 了解用户的大致创作方向
3. 激发用户的创作兴趣和灵感
4. 引导用户开始思考具体的创作项目

回复风格：温暖、友好、充满好奇心
关键策略：通过开放式问题了解用户，展现好奇心，给予积极反馈`,

    discovery: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：创意探索和目标明确
任务目标：
1. 深入探索用户的创作想法
2. 帮助用户明确具体的创作目标和内容
3. 了解创作的动机和意义
4. 预期达到的效果和影响

关键技能：
- 深度倾听和理解
- 提出有启发性的问题
- 帮助用户梳理思路
- 发现潜在的机会和挑战

回复策略：开放式提问，深入挖掘，连接用户经验`,

    information_gathering: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：信息收集和结构化
任务目标：
1. 从对话中收集并结构化作品的具体信息
2. 提取准确完整的作品信息
3. 提供智能建议和优化方案

需要提取的信息：
- 作品名称：简洁、准确、有吸引力的名称
- 作品描述：清晰描述作品的内容和目标
- 目标时间：用户计划投入的时间
- 颜色偏好：适合作品风格的色彩选择

工作方式：
- 信息提取要准确完整
- 保持对用户原意的尊重
- 提供有价值的建议和优化
- 确保信息符合用户实际需求`,

    motivation: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：动机增强和计划制定
任务目标：
1. 应用动机心理学策略帮助用户增强完成作品的动力
2. 使用科学方法提升用户的执行意愿和坚持度

重点方法：

1. WOOP方法：
   - Wish（愿望）：明确用户的核心愿望
   - Outcome（结果）：描述成功的具体结果
   - Obstacle（障碍）：预见可能的障碍
   - Plan（计划）：制定应对计划

2. 执行意图：
   - 制定"如果...那么..."的具体计划
   - 设置明确的触发条件和执行动作
   - 帮助用户建立自动化行为模式

3. 承诺机制：
   - 引导用户做出明确的承诺
   - 建立责任感和内在动力
   - 设定具体的检查点和里程碑

策略要点：
- 具体化：避免抽象，提供具体可行的建议
- 可操作性：确保用户能够实际执行
- 情感连接：帮助用户建立情感投入
- 阶段性：分解大目标为小步骤`,

    confirmation: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：信息确认和最终调整
任务目标：
1. 总结和确认所有收集的信息
2. 让用户对即将创建的作品进行最终确认
3. 确保用户充分理解并准备好开始创作

需要展示：
1. 完整的作品信息预览
2. 动机策略总结
3. 创作计划的可行性评估
4. 下一步行动指南

确认原则：
- 信息完整准确
- 用户充分理解
- 动机策略可行
- 用户有信心开始`,

    completed: `${PromptBuilder.SYSTEM_ROLE}

当前阶段：完成和后续支持
任务目标：
1. 祝贺用户完成创作规划
2. 提供后续行动建议
3. 建立长期支持关系

工作重点：
- 给予积极的肯定和鼓励
- 提供实用的开始建议
- 建立持续的支持机制
- 为未来的深入合作打下基础`
  };

  // 构建系统提示词
  static buildSystemPrompt(context: PromptContext): string {
    const basePrompt = this.STAGE_SYSTEM_PROMPTS[context.stage] || this.SYSTEM_ROLE;

    // 添加用户偏好信息
    const userPreference = context.userPreferences ? `
用户偏好：
- 姓名：${context.userPreferences.name || '未提供'}
- 交流风格：${this.getUserStyleDescription(context.userPreferences.style)}
` : '';

    // 添加已有信息上下文
    const contextInfo = this.buildContextInfo(context);

    return `${basePrompt}${userPreference}${contextInfo}

请严格按照当前阶段的任务目标进行回复，确保回复内容符合用户需求和当前对话进度。`;
  }

  // 构建消息列表
  static buildMessages(context: PromptContext): DeepSeekMessage[] {
    const messages: DeepSeekMessage[] = [];

    // 添加系统提示词
    messages.push({
      role: 'system',
      content: this.buildSystemPrompt(context)
    });

    // 添加对话历史（限制最近20条消息，避免上下文过长）
    const recentMessages = context.messages.slice(-20);

    for (const message of recentMessages) {
      // 跳过系统消息，避免重复
      if (message.role === 'system') continue;

      messages.push({
        role: message.role,
        content: message.content
      });
    }

    return messages;
  }

  // 构建结构化数据提取提示词
  static buildDataExtractionPrompt(
    context: PromptContext,
    extractionType: 'work' | 'motivation'
  ): string {
    if (extractionType === 'work') {
      return `
请基于以下对话内容，提取并结构化作品信息：

对话历史：
${this.formatConversationHistory(context.messages)}

请提取以下信息并以JSON格式返回：
{
  "name": "简洁准确的作品名称",
  "description": "清晰的作品描述（50-200字）",
  "target_hours": 预计投入时间（小时，0.5-1000）,
  "color": "适合作品的推荐颜色（十六进制格式）",
  "suggestions": {
    "name_alternatives": ["备选名称1", "备选名称2"],
    "color_recommendations": ["#颜色1", "#颜色2"]
  }
}

要求：
- 名称要简洁、有吸引力、符合作品内容
- 描述要清晰、具体、体现作品价值
- 时间要合理、符合项目复杂度
- 颜色要与作品主题和情感相符
- 如果信息不足，请基于对话合理推断`;
    }

    if (extractionType === 'motivation') {
      return `
请基于以下作品信息和对话内容，应用动机心理学策略生成动机增强方案：

作品信息：
${JSON.stringify(context.extractedData, null, 2)}

对话历史：
${this.formatConversationHistory(context.messages)}

请使用以下方法生成动机策略并以JSON格式返回：

1. WOOP方法：
{
  "wish": "用户的核心愿望",
  "outcome": "具体的成功结果描述",
  "obstacle": "可能面临的障碍",
  "plan": "具体的应对计划"
}

2. 执行意图（3-5个）：
[
  {
    "if": "触发条件",
    "then": "执行动作",
    "priority": 优先级1-5
  }
]

3. 承诺机制：
{
  "statement": "有力的承诺声明",
  "type": "public|private"
}

完整JSON格式：
{
  "woop": {...},
  "implementation_intentions": [...],
  "commitments": {...}
}

要求：
- 策略要具体可行，避免空泛
- 语言要激励人心，增强动力
- 要基于用户实际情况制定
- 确保计划的可执行性`;
    }

    return '';
  }

  // 构建阶段转换建议
  static buildStageTransitionPrompt(
    currentStage: DialogueStage,
    context: PromptContext
  ): string {
    const transitions = {
      greeting_to_discovery: `用户已表达初步创作兴趣，请引导用户深入探索具体想法，提出开放性问题了解创作细节。`,
      discovery_to_information: `用户已提供足够信息，请开始提取具体的作品信息，包括名称、描述、时间等。`,
      information_to_motivation: `作品信息已明确，请开始使用动机心理学策略帮助用户增强完成动力。`,
      motivation_to_confirmation: `动机策略已制定，请总结所有信息，让用户确认并准备开始创作。`,
      confirmation_to_completed: `用户已确认所有信息，请祝贺用户并提供后续行动建议。`
    };

    return transitions[`${currentStage}_to_${this.getNextStage(currentStage)}` as keyof typeof transitions] || '';
  }

  // 辅助方法：构建上下文信息
  private static buildContextInfo(context: PromptContext): string {
    const contextParts: string[] = [];

    if (context.extractedData) {
      contextParts.push(`
已有作品信息：
- 名称：${context.extractedData.name}
- 描述：${context.extractedData.description || '待补充'}
- 目标时间：${context.extractedData.target_hours}小时
- 颜色：${context.extractedData.color || '待选择'}`);
    }

    if (context.motivationData) {
      contextParts.push(`
已有动机策略：
- WOOP方法：${context.motivationData.woop ? '已制定' : '待制定'}
- 执行意图：${context.motivationData.implementation_intentions?.length || 0}条
- 承诺机制：${context.motivationData.commitments ? '已制定' : '待制定'}`);
    }

    return contextParts.length ? `\n\n当前上下文：${contextParts.join('\n')}` : '';
  }

  // 辅助方法：格式化对话历史
  private static formatConversationHistory(messages: ChatMessage[]): string {
    return messages
      .filter(msg => msg.role !== 'system')
      .map(msg => `${msg.role === 'user' ? '用户' : 'AI'}：${msg.content}`)
      .join('\n');
  }

  // 辅助方法：获取用户风格描述
  private static getUserStyleDescription(style?: string): string {
    const styles = {
      formal: '正式、专业',
      casual: '轻松、随意',
      encouraging: '鼓励、支持'
    };
    return styles[style as keyof typeof styles] || '默认';
  }

  // 辅助方法：获取下一阶段
  private static getNextStage(currentStage: DialogueStage): DialogueStage {
    const stages: DialogueStage[] = [
      'greeting', 'discovery', 'information_gathering',
      'motivation', 'confirmation', 'completed'
    ];
    const currentIndex = stages.indexOf(currentStage);
    return currentIndex < stages.length - 1 ? stages[currentIndex + 1] : currentStage;
  }

  // 构建快捷回复建议
  static buildQuickReplySuggestions(
    stage: DialogueStage,
    lastMessage?: string
  ): string[] {
    const suggestions: Record<DialogueStage, string[]> = {
      greeting: [
        '我想写一本书',
        '我想开发一个应用',
        '我想学习新技能',
        '我还不太确定'
      ],
      discovery: [
        '详细说说你的想法',
        '是什么激发了你的灵感？',
        '你希望达到什么目标？',
        '这对你很重要吗？'
      ],
      information_gathering: [
        '我想调整一下',
        '看起来不错',
        '继续动机分析'
      ],
      motivation: [
        '这个计划很好',
        '我想修改承诺',
        '确认创建'
      ],
      confirmation: [
        '确认创建作品',
        '调整信息',
        '重新开始'
      ],
      completed: []
    };

    // 根据最后一条消息内容动态调整建议
    if (lastMessage) {
      if (lastMessage.includes('书') || lastMessage.includes('写')) {
        return ['我想写一本小说', '我想写一本技术书籍', '我想写一本自助书籍'];
      }
      if (lastMessage.includes('应用') || lastMessage.includes('开发')) {
        return ['这是一个移动应用', '这是一个Web应用', '这是一个桌面应用'];
      }
      if (lastMessage.includes('学习') || lastMessage.includes('技能')) {
        return ['我想学习编程', '我想学习设计', '我想学习语言'];
      }
    }

    return suggestions[stage] || [];
  }
}