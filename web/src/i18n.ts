import type { ChapterConfig, PartConfig } from './book.config';
import { chaptersByLang, partsByLang } from './book.config';

export const languages = ['en', 'zh-CN'] as const;
export type Lang = (typeof languages)[number];

export const defaultLang: Lang = 'en';

export const languageLabels: Record<Lang, string> = {
  en: 'English',
  'zh-CN': '简体中文',
};

export function isLang(value: string | undefined): value is Lang {
  return value === 'en' || value === 'zh-CN';
}

export function normalizeLang(value: string | undefined): Lang {
  return isLang(value) ? value : defaultLang;
}

export function localizedPath(lang: Lang, slug?: string): string {
  const prefix = `/${lang}`;
  return slug ? `${prefix}/${slug}/` : `${prefix}/`;
}

export function withBase(base: string, lang: Lang, slug?: string): string {
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  return `${cleanBase}${localizedPath(lang, slug)}`;
}

export function getParts(lang: Lang): PartConfig[] {
  return partsByLang[lang];
}

export function getChapters(lang: Lang): ChapterConfig[] {
  return chaptersByLang[lang];
}

export function stripChapterPrefix(title: string): string {
  return title.replace(/^(Chapter \d+:\s*)?/, '').replace(/^第\s*\d+\s*章[：:]\s*/, '');
}

export const ui = {
  en: {
    lang: 'en',
    siteTitle: 'Claude Code from Source',
    metaTitle: 'Claude Code from Source — Architecture, Patterns & Internals',
    metaDescription: "A technical book analyzing the architecture of Anthropic's AI coding agent. 18 chapters, 400 pages, reverse-engineered from source maps. No source code — only transferable patterns.",
    startReading: 'Start reading',
    whatYouLearn: "What you'll learn",
    exploreArchitecture: 'Explore the architecture',
    exploreDescription: 'Six core abstractions power Claude Code. Drag nodes to rearrange, hover for details, click to read the chapter.',
    whoFor: 'Who this is for',
    tableOfContents: 'Table of contents',
    partLabel: 'Part',
    howMade: 'How this book was made',
    patternsTitle: 'The 10 patterns that make it work',
    patternsLead: 'If you read nothing else, these are the architectural bets that define Claude Code.',
    onThisPage: 'On this page',
    previous: 'Previous',
    next: 'Next',
    chapterAbbr: 'Ch',
    focusMode: 'Focus mode — hide sidebars',
    toggleNavigation: 'Toggle navigation',
    language: 'Language',
    heroTitleHtml: 'How Anthropic built the most widely used<br class="hidden md:inline" /> AI coding agent',
    heroTextPrefix: 'When Claude Code shipped on npm, the source maps came with it. We read every file. This book distills the architecture, design decisions, and transferable patterns into',
    heroTextHighlight: '18 chapters',
    heroTextSuffix: 'you can learn from and apply to your own systems.',
    learnCards: [
      { title: 'The agent loop', text: 'How an async generator drives the entire system — streaming model output, executing tools, recovering from errors, and compressing context across 4 layers.' },
      { title: 'Tool execution at scale', text: 'A 14-step pipeline from model request to tool result. Permission resolution, speculative execution, concurrent batching by safety classification.' },
      { title: 'Multi-agent orchestration', text: 'How sub-agents share prompt cache prefixes to cut costs by 95%. Fork agents, coordinator mode, swarm teams with mailbox messaging.' },
      { title: 'Memory without a database', text: 'File-based memory with an LLM-powered recall system. Four memory types, staleness warnings, and a Sonnet side-query that beats embedding search.' },
      { title: 'Performance engineering', text: 'Startup in 240ms via parallel I/O. Slot reservation saving context in 99% of requests. Bitmap pre-filters for fuzzy search. Every millisecond accounted for.' },
      { title: 'Extensibility and security', text: 'Two-phase skill loading (metadata at startup, content on demand). 27 lifecycle hooks with config snapshots frozen at startup to prevent injection.' },
    ],
    audience: [
      { lead: 'Engineers building agentic systems.', text: 'Every chapter ends with "Apply This" — 5 transferable patterns with concrete adaptation advice. Steal the architecture, skip the mistakes.' },
      { lead: 'Technical leaders evaluating architectures.', text: 'Follow the narrative without reading every code block. Understand why decisions were made, not just what was built.' },
      { lead: 'Anyone curious about how production AI tools work.', text: 'Claude Code is used by hundreds of thousands of developers. This is how it works under the hood.' },
    ],
    madeIntroHtml: 'The source was extracted from npm source maps — the <code>.js.map</code> files that shipped with Claude Code contained a <code>sourcesContent</code> field with the full original TypeScript. Nearly two thousand files comprising the complete architecture.',
    madeAgentsHtml: '<strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">36 AI agents</strong> analyzed and wrote the entire book in four phases:',
    phases: [
      { phase: 'Exploration', detail: '6 parallel agents read every file in the source tree' },
      { phase: 'Analysis', detail: '12 agents wrote 494KB of raw technical documentation' },
      { phase: 'Writing', detail: '15 agents rewrote everything from scratch as narrative chapters' },
      { phase: 'Review & Revision', detail: '3 reviewers produced 900 lines of feedback; 3 agents applied all fixes' },
    ],
    madeOutroHtml: 'The entire process — from source extraction to final revised book — took approximately <strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">6 hours</strong>. A final audit pass ensured no verbatim source code remained — every code block was rewritten as pseudocode with different variable names.',
    patterns: [
      { name: 'AsyncGenerator as agent loop', desc: 'yields Messages, typed Terminal return, natural backpressure and cancellation' },
      { name: 'Speculative tool execution', desc: 'start read-only tools during model streaming, before the response completes' },
      { name: 'Concurrent-safe batching', desc: 'partition tools by safety, run reads in parallel, serialize writes' },
      { name: 'Fork agents for cache sharing', desc: 'parallel children share byte-identical prompt prefixes, saving ~95% input tokens' },
      { name: '4-layer context compression', desc: 'snip, microcompact, collapse, autocompact — each lighter than the next' },
      { name: 'File-based memory with LLM recall', desc: 'Sonnet side-query selects relevant memories, not keyword matching' },
      { name: 'Two-phase skill loading', desc: 'frontmatter only at startup, full content on invocation' },
      { name: 'Sticky latches for cache stability', desc: 'once a beta header is sent, never unset mid-session' },
      { name: 'Slot reservation', desc: '8K default output cap, escalate to 64K on hit (saves context in 99% of requests)' },
      { name: 'Hook config snapshot', desc: 'freeze at startup to prevent runtime injection attacks' },
    ],
    disclaimerHtml: '<strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">Purely educational.</strong> This book contains no source code from Claude Code — every code block is original pseudocode written to illustrate architectural patterns. The goal is to help engineers understand how production AI agents are built, not to reproduce proprietary software. The "NO\'REILLY" cover is a parody/meme for illustrative purposes only — no affiliation with O\'Reilly Media.',
    footer: 'An independent educational analysis. Not affiliated with, endorsed by, or sponsored by',
  },
  'zh-CN': {
    lang: 'zh-CN',
    siteTitle: 'Claude Code from Source',
    metaTitle: 'Claude Code from Source（简体中文版）— 架构、模式与内部原理',
    metaDescription: '一本解析 Anthropic AI 编程智能体 Claude Code 架构的技术书。18 章，约 400 页，基于 source map 反向分析。不包含源码，只提炼可迁移模式。',
    startReading: '开始阅读',
    whatYouLearn: '你将学到什么',
    exploreArchitecture: '探索架构',
    exploreDescription: '六个核心抽象支撑 Claude Code。拖动节点重新排列，悬停查看细节，点击阅读对应章节。',
    whoFor: '本书适合谁',
    tableOfContents: '目录',
    partLabel: '第',
    howMade: '本书是如何完成的',
    patternsTitle: '让它成立的 10 个模式',
    patternsLead: '如果你只读一部分，读这里：这些是定义 Claude Code 的架构押注。',
    onThisPage: '本页目录',
    previous: '上一章',
    next: '下一章',
    chapterAbbr: '第',
    focusMode: '专注模式——隐藏侧边栏',
    toggleNavigation: '切换导航',
    language: '语言',
    heroTitleHtml: 'Anthropic 如何构建最广泛使用的<br class="hidden md:inline" /> AI 编程智能体',
    heroTextPrefix: '当 Claude Code 通过 npm 发布时，source map 也随之公开。我们读完了每个文件。本书把其中的架构、设计决策和可迁移模式提炼为',
    heroTextHighlight: '18 章',
    heroTextSuffix: '供你学习，并应用到自己的系统中。',
    learnCards: [
      { title: '智能体循环', text: '异步生成器如何驱动整个系统：流式生成模型输出、执行工具、错误恢复，并通过 4 层机制压缩上下文。' },
      { title: '大规模工具执行', text: '从模型请求到工具结果的 14 步流水线：权限解析、推测执行，以及按安全性分类的并发批处理。' },
      { title: '多智能体编排', text: '子智能体如何共享提示缓存前缀，把成本降低约 95%。分叉智能体、协调器模式，以及带邮箱消息的智能体集群。' },
      { title: '没有数据库的记忆', text: '基于文件的记忆与 LLM 驱动的召回系统：四类记忆、陈旧性警告，以及优于 embedding 搜索的 Sonnet 旁路查询。' },
      { title: '性能工程', text: '通过并行 I/O 实现 240ms 启动；槽位预留在 99% 请求中节省上下文；用 bitmap 预过滤器加速模糊搜索。每一毫秒都有归属。' },
      { title: '可扩展性与安全', text: '两阶段技能加载（启动时只加载元数据，按需加载内容）；27 个生命周期钩子，以及启动时冻结配置快照以防注入。' },
    ],
    audience: [
      { lead: '正在构建智能体系统的工程师。', text: '每章都以“应用到你的系统”收尾，提炼 5 个可迁移模式和具体适配建议。借鉴架构，避开坑。' },
      { lead: '正在评估架构的技术负责人。', text: '即使不阅读每个代码块，也能跟上叙事。理解为什么这样设计，而不只是知道构建了什么。' },
      { lead: '任何好奇生产级 AI 工具如何工作的人。', text: 'Claude Code 被大量开发者使用。本书解释它在底层如何运转。' },
    ],
    madeIntroHtml: '原始材料来自 npm source map——Claude Code 发布包中的 <code>.js.map</code> 文件在 <code>sourcesContent</code> 字段里包含了完整原始 TypeScript。近两千个文件组成了完整架构。',
    madeAgentsHtml: '<strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">36 个 AI 智能体</strong> 分四个阶段完成了分析与写作：',
    phases: [
      { phase: '探索', detail: '6 个并行智能体阅读源码树中的每个文件' },
      { phase: '分析', detail: '12 个智能体写出 494KB 的原始技术文档' },
      { phase: '写作', detail: '15 个智能体从头重写为叙事章节' },
      { phase: '审阅与修订', detail: '3 个审阅者产出 900 行反馈；3 个修订智能体应用所有修正' },
    ],
    madeOutroHtml: '从源码提取到最终修订成书，整个过程大约耗时 <strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">6 小时</strong>。最后一轮审计确保没有保留任何逐字源码——所有代码块都被重写为使用不同变量名的伪代码。',
    patterns: [
      { name: '把 AsyncGenerator 作为智能体循环', desc: '产出 Messages，返回带类型的 Terminal，天然支持背压和取消' },
      { name: '推测式工具执行', desc: '在模型流式生成期间、响应完成之前，启动只读工具' },
      { name: '并发安全批处理', desc: '按安全性划分工具；读操作并行运行，写操作串行运行' },
      { name: '用分叉智能体共享缓存', desc: '并行子智能体共享字节完全相同的提示前缀，节省约 95% 输入 token' },
      { name: '4 层上下文压缩', desc: 'snip、microcompact、collapse、autocompact；从轻到重逐层加码' },
      { name: '基于文件的记忆与 LLM 回忆', desc: '由 Sonnet 旁路查询选择相关记忆，而不是靠关键词匹配' },
      { name: '两阶段技能加载', desc: '启动时只加载 frontmatter，调用时再加载完整内容' },
      { name: '用粘性锁存器稳定缓存', desc: '一旦发送某个 beta header，就不要在会话中途取消设置' },
      { name: '槽位预留', desc: '默认输出上限 8K，命中上限后提升到 64K（在 99% 的请求中节省上下文）' },
      { name: '钩子配置快照', desc: '启动时冻结配置，防止运行时注入攻击' },
    ],
    disclaimerHtml: '<strong class="text-[var(--color-charcoal)] dark:text-[var(--color-cream)]">仅用于教育目的。</strong> 本书不包含 Claude Code 的任何源码——所有代码块都是用于说明架构模式的原创伪代码。目标是帮助工程师理解生产级 AI 智能体如何构建，而不是复现专有软件。“NO\'REILLY” 封面只是用于说明的戏仿/meme，与 O\'Reilly Media 无关。',
    footer: '独立教育分析项目。不隶属于、不代表、也不由以下机构赞助：',
  },
} as const;
