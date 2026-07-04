# 简体中文术语表

本术语表用于统一《Claude Code from Source》简体中文译稿。翻译正文时，以本表为准；确有上下文差异时，在“备注”中补充。

## 核心术语

| English | 简体中文 | 备注 |
|---|---|---|
| agent | 智能体 | 不译为“代理”。作为软件实体时使用“智能体”。 |
| AI agent | AI 智能体 | 首次出现可保留英文：AI 智能体（AI agent）。 |
| agentic system | 智能体系统 | 指由 LLM 决策并执行动作的系统。 |
| agentic CLI | 智能体式 CLI | 保留 CLI。 |
| query loop | 查询循环 | 全书固定译法。 |
| agent loop | 智能体循环 | 与 query loop 相关但不完全等同。 |
| tool system | 工具系统 |  |
| tool call | 工具调用 |  |
| tool result | 工具结果 |  |
| sub-agent | 子智能体 |  |
| fork agent | 分叉智能体 | 与进程 fork 类比。 |
| task | 任务 | 指后台工作单元时译为“任务”。 |
| orchestration | 编排 |  |
| swarm | 智能体集群 | 不译为“蜂群”，除非强调比喻。 |
| coordinator mode | 协调器模式 |  |

## LLM 与上下文

| English | 简体中文 | 备注 |
|---|---|---|
| language model | 语言模型 |  |
| model response | 模型响应 |  |
| transcript | 对话记录 | 指对话历史/会话记录；权限分类器语境下译为“对话记录”。 |
| system prompt | 系统提示 |  |
| prompt cache | 提示缓存 |  |
| byte-identical prefix | 字节完全相同的前缀 |  |
| context window | 上下文窗口 |  |
| context compression | 上下文压缩 |  |
| token budget | token 预算 | 保留 token。 |
| output cap | 输出上限 |  |
| autocompact | 自动压缩 | 作为机制名时可保留 `autocompact`。 |
| microcompact | 微压缩 | 作为机制名时可保留 `microcompact`。 |

## 架构与状态

| English | 简体中文 | 备注 |
|---|---|---|
| abstraction | 抽象 |  |
| data flow | 数据流 |  |
| control flow | 控制流 |  |
| state layer | 状态层 |  |
| bootstrap | 引导 / 启动 | 名词或流程偏“引导”；动词或性能语境偏“启动”。 |
| singleton | 单例 |  |
| reactive store | 响应式存储 |  |
| sticky latch | 粘性锁存器 | 首次出现可加英文。 |
| memoization | 记忆化 | 指缓存函数调用结果，使重复调用返回同一结果。 |
| terminal state | 终止状态 | 不译为“终端状态”，避免与 terminal UI 混淆。 |
| discriminated union | 判别联合 | TypeScript 语境。 |
| lifecycle event | 生命周期事件 |  |
| hook | 钩子 |  |
| snapshot | 快照 |  |

## 并发与执行

| English | 简体中文 | 备注 |
|---|---|---|
| async generator | 异步生成器 |  |
| backpressure | 背压 |  |
| cancellation | 取消机制 |  |
| streaming | 流式传输 / 流式生成 | API 语境偏“流式传输”；模型输出语境偏“流式生成”。 |
| streaming executor | 流式执行器 |  |
| speculative execution | 推测执行 |  |
| concurrent-safe | 并发安全 |  |
| batching | 批处理 |  |
| partition algorithm | 分区算法 |  |
| serial | 串行 |  |
| parallel | 并行 |  |

## 权限与安全

| English | 简体中文 | 备注 |
|---|---|---|
| permission system | 权限系统 |  |
| permission mode | 权限模式 |  |
| bypassPermissions | `bypassPermissions` | 枚举值不翻译。 |
| dontAsk | `dontAsk` | 枚举值不翻译。 |
| acceptEdits | `acceptEdits` | 枚举值不翻译。 |
| bubble | `bubble` | 模式名保留英文，说明可译为“向上冒泡”。 |
| trust boundary | 信任边界 |  |
| runtime injection | 运行时注入 |  |
| block | 阻止 | 权限上下文。 |
| allow / deny | 允许 / 拒绝 |  |

## UI 与工程

| English | 简体中文 | 备注 |
|---|---|---|
| Terminal UI | 终端 UI |  |
| renderer | 渲染器 |  |
| rendering pipeline | 渲染管线 |  |
| double buffer | 双缓冲 |  |
| keybinding | 快捷键 |  |
| chord | 组合键 |  |
| vim mode | vim 模式 | 保留 vim 小写。 |
| cost tracking | 成本跟踪 |  |
| telemetry | 遥测 |  |

## 保持英文的名称

以下名称通常不翻译：Claude Code、Anthropic、TypeScript、JavaScript、Bun、npm、SDK、API、REPL、CLI、MCP、OAuth、AWS Bedrock、Google Vertex AI、Azure Foundry、Mermaid、Zustand、Ink、React、GitHub。

## 标识符规则

以下内容保持原文：

- 文件名和路径：`query.ts`、`services/tools/`
- 函数名、类名、类型名：`getAnthropicClient()`、`Tool<I,O,P>`
- 枚举值和配置项：`plan`、`default`、`PreToolUse`
- 命令行与终端输入
- JSON/YAML key
- npm 包名
