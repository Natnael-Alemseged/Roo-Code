# Roo Code Architecture Notes — The AI-Native IDE Reference

**TRP1 Challenge: Architecting Intent-Code Traceability**

This document serves as the technical reference for the Roo Code extension's internals, focusing on the instrumentation of the hook system and governance layers.

---

## 1. Extension Structure & Privilege Separation

Roo Code is designed with strict boundaries between presentation, logic, and system access.

- **Webview UI (Restricted Layer):** A React-based frontend running in a sandboxed environment. It communicates exclusively via `postMessage` with the Extension Host. It has NO direct access to the file system or terminal.
- **Extension Host (Logic Controller):** The `ClineProvider` acts as the primary orchestrator. It manages task state, API configurations, and the lifecycle of "Silicon Workers" (Task instances).
- **Core Agent (`Task.ts`):** The engine of the IDE. A single `Task` instance manages the conversation history, prompt construction, and recursive API polling.
- **Hook Engine (Middleware Boundary):** Injected between the Tool Dispatcher and the Native Tools to enforce the **Intent Protocol** and **Scope Governance**.

---

## 2. Detailed Data Flow & Task Lifecycle

The extension operates on a deterministic reasoning loop.

### 2.1 The Request Lifecycle

1.  **Ingestion:** User prompt arrives at `ClineProvider.ts` via `postMessage`.
2.  **Creation:** `ClineProvider.createTask()` instantiates a new `Task` object.
3.  **Bootstrapping:** The `Task` generates the `SYSTEM_PROMPT` (from `system.ts`) which defines the agent's identity, tools, and the **TRP1 Intent Protocol**.
4.  **Inference:** The `Task` polls the LLM provider (Anthropic, OpenAI, etc.).
5.  **Streaming & Parsing:** The `assistant-message` layer parses the raw stream in real-time.
6.  **Tool Dispatch (`presentAssistantMessage.ts`):**
    - Identifies `tool_use` blocks.
    - **Pre-Hook Interception:** The Hook Engine verifies the `activeIntentId` (Handshake Phase).
    - **Dispatch:** Routes to specific `NativeTool` (e.g., `WriteToFileTool`).
7.  **HITL (Human-in-the-Loop):** Tools call `askApproval`, which sends an `ask` message back to the Webview, pausing the execution promise.
8.  **Execution:** Upon user approval, the tool performs the mutation (FS write or Terminal execution).
9.  **Post-Hook Resolution:** The Hook Engine logs the trace (Content Hash + Intent ID) to the ledger.
10. **Feedback:** The tool result is appended to the conversation history, and the loop continues.

---

## 3. The Hook System Architecture

The hook system is architected as an asynchronous middleware wrapper around the `BaseTool` class.

### 3.1 Pre-Hook (Governance Gatekeeper)

- **Intent Check:** Blocks all destructive tools if `task.activeIntentId` is undefined.
- **Scope Verification:** Compares target file paths against the `owned_scope` defined in `.orchestration/active_intents.yaml`.
- **Command Classification:** Prevents execution of restricted bash commands.

### 3.2 Post-Hook (Traceability Ledger)

- **Spatial Independence:** Calculates SHA-256 content hashes of code snippets to ensure the trace remains valid even if file content shifts.
- **Intent Evolution:** Updates the `intent_map.md` to reflect which business intents are physically manifested in which files/functions.

---

## 4. Key Components & Implementation Points

| Component                    | Responsibility                  | Hook Injection Point                         |
| :--------------------------- | :------------------------------ | :------------------------------------------- |
| `ClineProvider.ts`           | Webview management & Task Stack | Task creation interception                   |
| `Task.ts`                    | State machine & LLM loop        | Custom property injection (`activeIntentId`) |
| `presentAssistantMessage.ts` | Context-aware dispatcher        | Central Hook middleware invocation           |
| `BaseTool.ts`                | Abstract tool lifecycle         | `preHandle` and `postHandle` triggers        |
| `system.ts`                  | Prompt assembly                 | "Intent Protocol" instruction injection      |

---

## 5. Metadata & Data Model Schemas

### 5.1 .orchestration/active_intents.yaml

The source of truth for "Why" we are coding. Defines the **Owned Scope** and **Architectural Constraints**.

### 5.2 .orchestration/agent_trace.jsonl

An append-only immutable ledger.

- **Key Field:** `content_hash` -> Ensures we track the _semantic change_ not just line numbers.
- **Key Field:** `related` -> Links the action back to the **Intent ID**.

---

## 6. Recommendations for Future Instrumentation

- **Optimistic Concurrency:** Use the `content_hash` from the Post-Hook to detect stale reads when multiple agents (Architect/Builder/Tester) are active.
- **Lesson Recording:** Automate the population of `CLAUDE.md` by intercepting failed lints/tests in the Hook Engine and summarizing the "Lesson Learned".
