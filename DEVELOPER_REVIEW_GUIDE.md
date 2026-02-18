# Developer's Guide to Reviewing the Roo Code Architecture

This guide is designed for developers who are new to AI orchestration and extension development, specifically for reviewing the TRP1 Challenge implementation.

## 1. The Core Dispatcher (The Nervous System)

**File:** `src/core/assistant-message/presentAssistantMessage.ts`

This is the most important file to understand. It intercepts the LLM's streaming response.

- **Review Tip:** Search for `switch (block.name)`. This is where every tool (like `write_to_file`) is dispatched.
- **Challenge Insight:** This is where we will inject the `HookEngine` to pause execution and enforce the Intent Protocol.

## 2. Tool Implementations (The Workers)

**Directory:** `src/core/tools/`

Each tool has its own class here.

- **Review Tip:** Look at `WriteToFileTool.ts` and `ExecuteCommandTool.ts`. See how they use `askApproval` to implement Human-in-the-Loop (HITL).
- **Challenge Insight:** Our new tool `SelectActiveIntentTool.ts` will live here and follow the same pattern.

## 3. Prompt Construction (The Brain's Logic)

**File:** `src/core/prompts/system.ts`

This builds the massive system prompt that tells the LLM "who it is" and "what the rules are."

- **Review Tip:** Look at `generatePrompt()`. It concatenates different sections (Tool Guidelines, Capabilities, Rules).
- **Challenge Insight:** We will add the "Intent Protocol" section here to force the LLM to call `select_active_intent` first.

## 4. The Hook Middleware (The Governor)

**Directory:** `src/hooks/`

This is our custom addition for the TRP1 challenge.

- **HookEngine.ts:** The aggregator that runs Pre-Hooks (Gatekeepers) and Post-Hooks (Ledgers).
- **preHooks.ts:** Logic to block actions if no intent is selected.
- **postHooks.ts:** Logic to record the `agent_trace.jsonl`.

## 5. Formal Definitions

- **Native Tool Args:** `src/shared/tools.ts` — contains the TypeScript types for tool parameters.
- **Tool Names:** `packages/types/src/tool.ts` — the source of truth for all supported tool names.

## How to Verify

Run the extension in Debug Mode (F5). When you talk to the agent in the new window, you can see the logs in the **Debug Console** of the main VS Code window to see how it's processing tool calls.
