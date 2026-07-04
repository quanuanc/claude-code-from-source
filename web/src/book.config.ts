export interface PartConfig {
  number: number;
  title: string;
  epigraph: string;
  chapters: number[];
}

export interface ChapterConfig {
  number: number;
  slug: string;
  title: string;
  description: string;
}

export type BookLang = 'en' | 'zh-CN';

const partsEn: PartConfig[] = [
  {
    number: 1,
    title: 'Foundations',
    epigraph: 'Before the agent can think, the process must exist.',
    chapters: [1, 2, 3, 4],
  },
  {
    number: 2,
    title: 'The Core Loop',
    epigraph: 'The heartbeat of the agent: stream, act, observe, repeat.',
    chapters: [5, 6, 7],
  },
  {
    number: 3,
    title: 'Multi-Agent Orchestration',
    epigraph: 'One agent is powerful. Many agents working together are transformative.',
    chapters: [8, 9, 10],
  },
  {
    number: 4,
    title: 'Persistence and Intelligence',
    epigraph: 'An agent without memory makes the same mistakes forever.',
    chapters: [11, 12],
  },
  {
    number: 5,
    title: 'The Interface',
    epigraph: 'Everything the user sees passes through this layer.',
    chapters: [13, 14],
  },
  {
    number: 6,
    title: 'Connectivity',
    epigraph: 'The agent reaches beyond localhost.',
    chapters: [15, 16],
  },
  {
    number: 7,
    title: 'Performance Engineering',
    epigraph: 'Making it all fast enough that humans don\'t notice the machinery.',
    chapters: [17, 18],
  },
];

const chaptersEn: ChapterConfig[] = [
  { number: 1, slug: 'ch01-architecture', title: 'The Architecture of an AI Agent', description: 'The 6 key abstractions, data flow, permission system, build system' },
  { number: 2, slug: 'ch02-bootstrap', title: 'Starting Fast — The Bootstrap Pipeline', description: '5-phase init, module-level I/O parallelism, trust boundary' },
  { number: 3, slug: 'ch03-state', title: 'State — The Two-Tier Architecture', description: 'Bootstrap singleton, AppState store, sticky latches, cost tracking' },
  { number: 4, slug: 'ch04-api-layer', title: 'Talking to Claude — The API Layer', description: 'Multi-provider client, prompt cache, streaming, error recovery' },
  { number: 5, slug: 'ch05-agent-loop', title: 'The Agent Loop', description: 'query.ts deep dive, 4-layer compression, error recovery, token budgets' },
  { number: 6, slug: 'ch06-tools', title: 'Tools — From Definition to Execution', description: 'Tool interface, 14-step pipeline, permission system' },
  { number: 7, slug: 'ch07-concurrency', title: 'Concurrent Tool Execution', description: 'Partition algorithm, streaming executor, speculative execution' },
  { number: 8, slug: 'ch08-sub-agents', title: 'Spawning Sub-Agents', description: 'AgentTool, 15-step runAgent lifecycle, built-in agent types' },
  { number: 9, slug: 'ch09-fork-agents', title: 'Fork Agents and the Prompt Cache', description: 'Byte-identical prefix trick, cache sharing, cost optimization' },
  { number: 10, slug: 'ch10-coordination', title: 'Tasks, Coordination, and Swarms', description: 'Task state machine, coordinator mode, swarm messaging' },
  { number: 11, slug: 'ch11-memory', title: 'Memory — Learning Across Conversations', description: 'File-based memory, 4-type taxonomy, LLM recall, staleness' },
  { number: 12, slug: 'ch12-extensibility', title: 'Extensibility — Skills and Hooks', description: 'Two-phase skill loading, lifecycle hooks, snapshot security' },
  { number: 13, slug: 'ch13-terminal-ui', title: 'The Terminal UI', description: 'Custom Ink fork, rendering pipeline, double-buffer, pools' },
  { number: 14, slug: 'ch14-input-interaction', title: 'Input and Interaction', description: 'Key parsing, keybindings, chord support, vim mode' },
  { number: 15, slug: 'ch15-mcp', title: 'MCP — The Universal Tool Protocol', description: '8 transports, OAuth for MCP, tool wrapping' },
  { number: 16, slug: 'ch16-remote', title: 'Remote Control and Cloud Execution', description: 'Bridge v1/v2, CCR, upstream proxy' },
  { number: 17, slug: 'ch17-performance', title: 'Performance — Every Millisecond and Token Counts', description: 'Startup, context window, prompt cache, rendering, search' },
  { number: 18, slug: 'ch18-epilogue', title: 'Epilogue — What We Learned', description: 'The 5 architectural bets, what transfers, where agents are heading' },
];

const partsZh: PartConfig[] = [
  {
    number: 1,
    title: '基础',
    epigraph: '在智能体开始思考之前，进程必须先存在。',
    chapters: [1, 2, 3, 4],
  },
  {
    number: 2,
    title: '核心循环',
    epigraph: '智能体的心跳：流式生成、行动、观察，然后重复。',
    chapters: [5, 6, 7],
  },
  {
    number: 3,
    title: '多智能体编排',
    epigraph: '一个智能体很强大。多个智能体协同工作，则会带来质变。',
    chapters: [8, 9, 10],
  },
  {
    number: 4,
    title: '持久化与智能',
    epigraph: '没有记忆的智能体会永远犯同样的错误。',
    chapters: [11, 12],
  },
  {
    number: 5,
    title: '界面',
    epigraph: '用户看到的一切都会经过这一层。',
    chapters: [13, 14],
  },
  {
    number: 6,
    title: '连接性',
    epigraph: '智能体的触角伸向 localhost 之外。',
    chapters: [15, 16],
  },
  {
    number: 7,
    title: '性能工程',
    epigraph: '让系统足够快，让人类感受不到机器的存在。',
    chapters: [17, 18],
  },
];

const chaptersZh: ChapterConfig[] = [
  { number: 1, slug: 'ch01-architecture', title: 'AI 智能体的架构', description: '6 个关键抽象、数据流、权限系统、构建系统' },
  { number: 2, slug: 'ch02-bootstrap', title: '快速启动——引导流水线', description: '5 阶段初始化、模块级 I/O 并行、信任边界' },
  { number: 3, slug: 'ch03-state', title: '状态——双层架构', description: '引导单例、AppState 存储、粘性锁存器、成本跟踪' },
  { number: 4, slug: 'ch04-api-layer', title: '与 Claude 对话——API 层', description: '多提供商客户端、提示缓存、流式传输、错误恢复' },
  { number: 5, slug: 'ch05-agent-loop', title: '智能体循环', description: '`query.ts` 深入解析、4 层压缩、错误恢复、token 预算' },
  { number: 6, slug: 'ch06-tools', title: '工具——从定义到执行', description: '工具接口、14 步流水线、权限系统' },
  { number: 7, slug: 'ch07-concurrency', title: '并发工具执行', description: '分区算法、流式执行器、推测执行' },
  { number: 8, slug: 'ch08-sub-agents', title: '派生子智能体', description: 'AgentTool、15 步 `runAgent` 生命周期、内置智能体类型' },
  { number: 9, slug: 'ch09-fork-agents', title: '分叉智能体与提示缓存', description: '字节完全相同的前缀技巧、缓存共享、成本优化' },
  { number: 10, slug: 'ch10-coordination', title: '任务、协调与智能体集群', description: '任务状态机、协调器模式、集群消息传递' },
  { number: 11, slug: 'ch11-memory', title: '记忆——跨会话学习', description: '基于文件的记忆、4 类分类、LLM 回忆、陈旧性' },
  { number: 12, slug: 'ch12-extensibility', title: '可扩展性——技能与钩子', description: '两阶段技能加载、生命周期钩子、快照安全' },
  { number: 13, slug: 'ch13-terminal-ui', title: '终端 UI', description: '定制 Ink fork、渲染管线、双缓冲、对象池' },
  { number: 14, slug: 'ch14-input-interaction', title: '输入与交互', description: '按键解析、快捷键、组合键支持、vim 模式' },
  { number: 15, slug: 'ch15-mcp', title: 'MCP——通用工具协议', description: '8 种传输方式、MCP OAuth、工具包装' },
  { number: 16, slug: 'ch16-remote', title: '远程控制与云端执行', description: 'Bridge v1/v2、CCR、上游代理' },
  { number: 17, slug: 'ch17-performance', title: '性能——每一毫秒和每一个 token 都重要', description: '启动、上下文窗口、提示缓存、渲染、搜索' },
  { number: 18, slug: 'ch18-epilogue', title: '尾声——我们学到了什么', description: '5 个架构赌注、可迁移模式、智能体的未来方向' },
];

export const partsByLang: Record<BookLang, PartConfig[]> = {
  en: partsEn,
  'zh-CN': partsZh,
};

export const chaptersByLang: Record<BookLang, ChapterConfig[]> = {
  en: chaptersEn,
  'zh-CN': chaptersZh,
};

export const parts = partsEn;
export const chapters = chaptersEn;

export function getPartForChapter(chapterNumber: number, lang: BookLang = 'en'): PartConfig | undefined {
  return partsByLang[lang].find(p => p.chapters.includes(chapterNumber));
}

export function getChapterNumber(slug: string): number {
  const match = slug.match(/^ch(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getAdjacentChapters(chapterNumber: number, lang: BookLang = 'en') {
  const langChapters = chaptersByLang[lang];
  const idx = langChapters.findIndex(c => c.number === chapterNumber);
  return {
    prev: idx > 0 ? langChapters[idx - 1] : null,
    next: idx < langChapters.length - 1 ? langChapters[idx + 1] : null,
  };
}

export function isFirstChapterOfPart(chapterNumber: number, lang: BookLang = 'en'): boolean {
  return partsByLang[lang].some(p => p.chapters[0] === chapterNumber);
}
