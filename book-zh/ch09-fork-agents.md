# 第 9 章：分叉智能体与提示缓存

## 95% 的洞察

当父智能体并行派生五个子智能体时，每个子级 API 请求中的绝大部分内容都是相同的。系统提示相同。工具定义相同。对话历史相同。触发派生的 assistant message 相同。唯一不同的是最后的指令：“你处理数据库迁移”，“你写测试”，“你更新文档”。

在一次带有热对话的典型 fork 中，共享前缀可能有 80,000 token。每个子级自己的指令可能只有 200 token。这是 99.75% 的重叠。Anthropic 的提示缓存会对 cached input tokens 给出 90% 折扣。如果能让子级 2 到 5 的这 80,000 token 命中缓存，你就把这四个请求的输入成本削减了 90%。对父级来说，这就是同一次并行派发花 4 美元，还是花 0.50 美元的区别。

问题在于，提示缓存是字节精确的。不是“足够相似”。不是“语义等价”。从系统提示的第一个字节，到每个子级内容开始分叉前的最后一个字节，必须逐字符完全匹配。多一个空格、工具定义重排、某个过期 feature flag 改变了系统提示片段——缓存就会未命中。整个前缀会以全价重新处理。

Fork agents 是 Claude Code 对这个约束的回答。它们不只是“带上下文派生子级”的便利功能——它们是伪装成编排功能的提示缓存利用机制。fork 系统中的每个设计决策都追溯到同一个问题：如何保证并行 children 之间的前缀字节完全相同？

---

## Fork Child 继承什么

Fork agent 从父级继承四样东西，而且是通过引用或字节精确拷贝继承，不是重新计算。

**1. 系统提示。** 不是重新生成，而是穿透传递。父级已经渲染好的系统提示字节会通过 `override.systemPrompt` 传入，来源是 `toolUseContext.renderedSystemPrompt`。这是父级最近一次 API 调用中发送的精确字符串。

**2. 工具定义。** fork agent definition 声明 `tools: ['*']`，但由于 `useExactTools` flag 设为 true，子级会直接接收父级已经组装好的工具数组。没有过滤，没有重排，没有重新序列化。

**3. 对话历史。** 父级与 API 交换过的每条 message——user turns、assistant turns、tool calls、tool results——都会通过 `forkContextMessages` 克隆到子级上下文中。

**4. Thinking 配置和模型。** fork definition 指定 `model: 'inherit'`，会解析为父级的精确模型。相同模型意味着相同 tokenizer、相同 context window、相同缓存命名空间。

fork agent definition 本身是极简的——几乎是 no-op：

fork agent definition 被刻意设计得极简——它从父级继承一切。它指定所有工具（`'*'`），继承父级模型，使用 bubble mode 处理权限（让提示浮到父级终端），并提供一个永远不会真正调用的 no-op system prompt 函数——真正的 prompt 会通过 override channel 传入，已经渲染好且字节稳定。

---

## 字节完全相同的前缀技巧

发给 Claude 的 API 请求有特定结构：先是系统提示，然后是工具，然后是 messages。要命中提示缓存，从请求开头到某个前缀边界的每个字节都必须在多个请求之间完全相同。

Fork agents 通过冻结三层来实现这一点：

**第 1 层：通过穿透传递系统提示，而不是重新计算。**

当父智能体为最近一次 API 调用渲染系统提示时，结果被捕获在 `toolUseContext.renderedSystemPrompt` 中。这是所有动态插值之后的字符串——GrowthBook feature flags、环境细节、MCP server descriptions、skill content、CLAUDE.md files。fork child 会收到这个精确字符串。

为什么不直接再次调用 `getSystemPrompt()`？因为系统提示生成不是纯函数。GrowthBook flags 会随着 SDK 获取远程配置，从 cold 状态过渡到 warm 状态。某个在父级第一轮返回 `false` 的 flag，到 fork child 启动时可能返回 `true`。如果系统提示包含受该 flag gate 的条件块，重新渲染的 prompt 即使只差一个字符，也会让缓存失效。80,000 token 全价重处理，再乘以五个 children。

传递已经渲染好的字节，可以消除这一整类发散。

**第 2 层：通过精确透传工具定义。**

普通子智能体会经过 `resolveAgentTools()`，根据 agent definition 的 `tools` 和 `disallowedTools` 数组过滤工具池，应用权限模式差异，并可能重排工具。最终序列化出来的工具数组会与父级不同——不同子集、不同顺序、不同权限注解。

Fork agents 完全跳过这个过程：

```typescript
const resolvedTools = useExactTools
  ? availableTools  // parent's exact array
  : resolveAgentTools(agentDefinition, availableTools, isAsync).resolvedTools
```

`useExactTools` flag 只在 fork 路径上设为 true。子级原样获得父级工具池。相同工具，相同顺序，相同序列化。这包括把 Agent 工具本身保留在子级工具池中，尽管子级被禁止使用它——移除它会改变工具数组并击穿缓存。

**第 3 层：Message array 构造。**

这里是 `buildForkedMessages()` 精细工作的地方。这个函数会构造位于共享历史和每个子级指令之间的最后两条 messages：

`buildForkedMessages()` 函数构造位于共享历史和每个子级指令之间的最后两条 messages。算法如下：

1. 克隆父级的 assistant message（保留所有 `tool_use` blocks 及其原始 ID）。
2. 对每个 `tool_use` block，创建一个带常量 placeholder 字符串的 `tool_result`（所有 children 完全相同）。
3. 构建一条 user message，包含所有 placeholder results，后面跟包在 boilerplate tag 中的 per-child directive。
4. 返回 `[clonedAssistantMessage, userMessageWithPlaceholdersAndDirective]`。

```typescript
// Pseudocode — illustrates the message construction
function buildChildMessages(directive, parentAssistant) {
  const cloned = cloneMessage(parentAssistant)
  const placeholders = parentAssistant.toolUseBlocks.map(b =>
    toolResult(b.id, CONSTANT_PLACEHOLDER)  // Byte-identical across children
  )
  const userMsg = createUserMessage([...placeholders, wrapDirective(directive)])
  return [cloned, userMsg]
}
```

每个 child 的最终 message array 看起来像这样：

```
[...shared_history, assistant(all_tool_uses), user(placeholder_results..., directive)]
```

directive 之前的每个元素都在 children 之间完全相同。`FORK_PLACEHOLDER_RESULT`——常量字符串 `'Fork started -- processing in background'`——确保连 tool result blocks 都字节完全相同。`tool_use_id` 值相同，因为它们引用同一条 assistant message。只有包含 per-child directive 的最终 text block 会变化。

缓存边界正好落在这个最终 text block 之前。它上面的所有内容——可能是数万 token 的系统提示、工具定义、对话历史和 placeholder results——都会在第一个 child 之后以 90% 折扣命中缓存。

---

## Fork Boilerplate Tag

每个 child 的 directive 都会包在一个 boilerplate XML tag 中，这个 tag 有两个目的：指示 child 如何行动，并充当递归 fork 检测标记。

boilerplate 包含大约 10 条规则。关键规则包括：

- **覆盖父级的 forking 指令。** 父级系统提示说“默认 fork”——boilerplate 明确告诉 child：“那条指令是给父级的。你就是 fork。不要派生子智能体。”
- **静默执行，只报告一次。** 工具调用之间不输出对话文本。直接使用工具，然后产出结构化 summary。
- **保持范围。** child 不得超出自己的 directive。
- **结构化输出格式。** 响应必须遵循 Scope/Result/Key files/Files changed/Issues 模板，让多个 children 同时回报时父级更容易解析结果。

规则 1 尤其有趣。父级系统提示——fork child 为缓存原因逐字继承——包含类似“当有并行工作时默认 fork”的指令。如果 child 遵循那条指令，它会尝试 fork 自己的 children，创造无限递归的 agents。boilerplate 明确覆盖：“那条指令是给父级的。你就是 fork。”

结构化输出格式（Scope/Result/Key files/Files changed/Issues）不是装饰。它把 child 的输出约束为事实报告，这让五个 children 同时回报时，父级更容易解析和聚合结果。

---

## 防止递归 Fork

fork child 会保留工具池中的 Agent 工具。它必须这样做——移除它会改变序列化后的工具数组并击穿提示缓存。但如果 child 真的在不带 `subagent_type` 的情况下调用 Agent 工具，fork 路径就会再次触发，创建一个孙级 fork。这个孙级会继承更大的上下文（父级 + 子级对话），派生自己的 forks，如此循环。

两个 guard 防止这种情况：

**主 guard：querySource 检查。** 当 fork child 被派生时，它的 `context.options.querySource` 会设为 `'agent:builtin:fork'`。`call()` 方法在允许 fork 路径前会检查它：

```typescript
// In AgentTool.call():
if (effectiveType === undefined) {
  // Fork path -- but are we already in a fork?
  if (querySource === 'agent:builtin:fork') {
    // Reject: already a fork child
  }
}
```

这是快速路径。它只检查 options 对象中的一个字符串。

**Fallback guard：message scanning。** fork prevention 使用两个 guard：派生时设置的 `querySource` tag（快速路径——单次字符串比较），以及扫描 message history 查找 boilerplate XML tag 的 fallback。fallback 存在是因为 `querySource` 会跨 autocompact 保留，但在没有正确穿透的边缘情况下，message-scanning fallback 可以捕获递归。这是一种腰带加吊带方案：检查成本（扫描 messages）与意外递归 fork 的成本（失控 API 花费）相比微不足道。

为什么需要 fallback？因为 Claude Code 有 autocompact 功能，会在上下文过长时重写 message array。Autocompact 可以重写 message content，但会在 options 中保留 `querySource`。理论上，单靠 `querySource` 就足够。实践中，message-scanning fallback 会捕获 `querySource` 没有正确穿透的边缘情况——这是腰带加吊带方案，检查成本（扫描 messages）与意外递归 fork 的成本（失控 API 花费）相比微不足道。

---

## 从同步到异步的转换

fork child 一开始在前台运行：它的 messages 会流到父级终端，父级阻塞等待完成。但如果 child 耗时过长怎么办？Claude Code 允许执行中途后台化——用户（或自动超时）可以把正在运行的前台 agent 推到后台，而不丢失任何工作。

机制出奇地干净：

1. 当前台 agent 通过 `registerAgentForeground()` 注册时，会创建一个 background signal promise。

2. 父级的 sync loop 会在 agent message stream 和 background signal 之间 race：

```
while (true) {
  const result = await Promise.race([
    iterator.next(),         // next message from agent
    backgroundSignal,        // "move to background" trigger
  ])
  if (result === BACKGROUND_SIGNAL) break
  // ... process message
}
```

3. 当 background signal 触发时，前台 iterator 会通过 `iterator.return()` 优雅终止。这会触发 generator 的 `finally` block，后者负责清理。

4. 使用相同 agent ID 和目前累计的 message history，派生一个新的 `isAsync: true` 的 `runAgent()` 实例。agent 会从离开的地方继续，只是现在在后台运行。

5. 原始同步 `call()` 返回 `{ status: 'async_launched' }`，父级继续自己的对话。

不会丢失工作，因为 message history 就是 agent 的状态。磁盘上的 sidechain transcript 记录了 agent 已经产生的每条 message。新的 async instance 会从这个 transcript replay，并从 sync instance 停止的地方继续。

---

## 自动后台化

当 `CLAUDE_AUTO_BACKGROUND_TASKS` 环境变量或 `tengu_auto_background_agents` GrowthBook flag 启用时，前台 agents 会在 120 秒后自动后台化：

通过环境变量或 feature flag 启用时，前台 agents 会在 120 秒后自动后台化。禁用时，该函数返回 0（不自动后台化）。

这是一个带成本含义的 UX 决策。前台 agent 会阻塞父级终端——用户不能输入，不能发出新指令，不能派生其他 agents。两分钟足够大多数快速任务同步完成（此时流式输出是有用反馈），又足够短，不至于让长时间任务劫持终端。

在 fork experiment 下，自动后台化问题并不存在：所有 fork spawns 从一开始就被强制 async。`run_in_background` 参数会从 schema 中完全隐藏。每个 fork child 都在后台运行，完成时通过 `<task-notification>` 回报，父级永远不阻塞。

---

## 什么时候不使用 Fork

Fork 是多种编排模式之一，并且在三种情况下被刻意排除：

**Coordinator mode。** Coordinator mode 与 fork mode 互斥。coordinator 有结构化委派模型：它维护 plan，用显式 prompts 给 workers 分配任务，并跟踪进度。Fork 的“继承一切”方法会破坏这一点。forked coordinator 会继承父级 coordinator 的系统提示（它说“你是 coordinator，委派工作”），于是 child 会尝试编排而不是执行。`isForkSubagentEnabled()` 函数会先检查 `isCoordinatorMode()`，如果激活则返回 false。

**非交互式会话。** SDK 和 API consumers（`--print` mode、Claude Agent SDK）在没有终端的情况下运行。Fork 的 `permissionMode: 'bubble'` 会把权限提示浮到父级终端——但非交互模式没有终端。与其构建一套单独权限流，fork 路径直接禁用。SDK consumers 会改用显式 `subagent_type` 选择。

**显式 subagent_type。** 当模型指定 `subagent_type`（例如 `"Explore"`、`"Plan"`、`"general-purpose"`）时，不会触发 fork 路径。Fork 只在省略 `subagent_type` 时触发。这让模型可以在两者之间选择：“我想要一个带自己系统提示和工具集合的专门 agent”（显式类型），或者“我想要一个继承我上下文的克隆来并行处理这件事”（省略类型）。

---

## 经济学

看一个具体场景。开发者让 Claude Code 重构一个模块。父智能体分析代码库、形成计划，并并行派发五个 fork children：一个更新数据库 schema，一个重写 service layer，一个更新 router，一个修复 tests，一个更新 types。

此时对话中的共享上下文已经很可观：
- 系统提示：约 4,000 token
- 工具定义（40+ tools）：约 12,000 token
- 对话历史（分析 + 计划）：约 30,000 token
- 带五个 tool_use blocks 的 assistant message：约 2,000 token
- Placeholder tool results：约 500 token

共享前缀总计：约 48,500 token。每个 child 的 directive：约 200 token。

没有 fork（五个独立 agents，每个都有新上下文和自己的系统提示）：
- 每个 child 处理自己的系统提示 + 工具 + 任务 prompt
- 没有缓存共享（不同系统提示、不同工具集合）
- 成本：5 x 完整输入处理

使用 fork（字节完全相同的前缀）：
- Child 1：48,700 token 全价（第一个请求缓存未命中）
- Children 2-5：48,500 token 按 10% 价格（缓存命中）+ 每个 200 token 全价
- Children 2-5 的有效成本：每个约 4,850 + 200 = 约 5,050 token 等价

节省会随上下文大小和 child 数量放大。对于一个带 100K token 历史、派生 8 个并行 forks 的热会话，缓存节省可能超过没有共享时输入 token 成本的 90%。

这就是为什么 fork 系统中的每个设计决策——传递而非重新计算、精确工具透传、placeholder results，甚至在 child 工具池中保留被禁止使用的 Agent 工具——都为同一件事优化：字节完全相同的前缀。每个决策都用少量优雅性或安全性，换取可测量的 API 成本降低。

---

## 设计张力

fork 系统做出了值得理解的显式取舍：

**隔离 vs. 缓存效率。** Fork children 继承一切，包括可能与其任务无关的对话历史。一个重写 tests 的 child 不需要父级讨论数据库 schema 设计的 15 条 messages。但包含这些 messages 才能让前缀相同。剥离无关历史会节省 context window 空间，但代价是击穿缓存。设计押注是：缓存节省大于上下文开销。

**安全 vs. 缓存效率。** Agent 工具会留在 fork child 的工具池中，尽管 child 不得使用它。移除它会更安全（child 甚至不能尝试 fork），但会改变工具数组序列化。boilerplate tag 和递归 fork guards 是补偿控制——用运行时防护代替静态移除。

**简单性 vs. 缓存效率。** Placeholder tool results 是一种谎言。无论父级 assistant message 中那些 tool_use blocks 实际做了什么，child 都会看到每个 tool_use block 的结果是 `'Fork started -- processing in background'`。这没问题，因为 child 的 directive 告诉它该做什么——它不需要父级派发 turn 的准确工具结果。但这意味着 child 的对话历史在技术上不连贯。placeholder 的选择是为了简短和统一，而不是准确。

这些取舍都体现了同一个优先级：当你在规模化地按 token 为 API 调用付费时，字节完全相同的前缀值得让架构围绕它扭曲。

---

## 应用到你的系统：为提示缓存效率而设计

fork agent 模式可以推广到 Claude Code 之外。任何从同一上下文发起多个并行 LLM 调用的系统，都可以从 cache-aware request construction 中受益。原则如下：

**1. 传递渲染后的 prompts，不要重新计算。** 如果你的系统提示包含任何动态内容——feature flags、timestamps、user preferences、A/B test variants——捕获渲染结果，并按值传给 children。重新计算有发散风险。

**2. 冻结工具数组。** 如果 children 需要不同工具集合，你就在放弃 tools block 上的缓存共享。考虑保留完整工具集合，并用运行时 guards（例如 fork boilerplate 的“不要使用 Agent”）代替编译期移除。

**3. 最大化共享前缀，最小化每个 child 的后缀。** 构造 message array 时，让所有共享内容先出现，per-child 内容追加在末尾。交错 shared 和 per-child content 会碎片化缓存边界。

**4. 对变量内容使用常量 placeholders。** 当 message 结构要求对之前 tool calls 给出响应时，在所有 children 中使用相同 placeholder 字符串，而不是实际（会发散的）结果。

**5. 测量盈亏平衡点。** 缓存共享有开销：每个 child 更大的 context window（携带无关历史）、运行时 guards 代替静态安全、架构复杂度。计算你的并行模式（多少 children、共享前缀多大）在计入额外上下文 token 后是否真的省钱。

fork agent 系统本质上是一个提示缓存利用引擎。它回答了每个多智能体系统构建者最终都会面对的问题：当缓存对重复前缀给出 90% 折扣时，你愿意为了拿到这个折扣，在多大程度上重构架构？Claude Code 的答案是：很大程度。
