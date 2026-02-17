# Roo Code Architecture Notes

## Phase 0: The Archaeological Dig

### Overview

This document maps the "nervous system" of Roo Code - how it executes tools, builds prompts, and communicates between components.

---

## Architecture Layers

### 1. Extension Host Architecture

**Location**: `src/extension.ts` (main entry point)

**Components**:

- **Webview (UI Layer)**: Restricted presentation layer in `webview-ui/` (if exists) or React-based UI
- **Extension Host (Logic Layer)**: Handles API polling, secret management, and tool execution
- **Communication**: Uses `postMessage` API for webview ↔ extension host communication

**Key Files**:

- `src/extension.ts` - Main extension activation
- `packages/vscode-shim/src/api/WindowAPI.ts` - VS Code API shim layer
- `apps/cli/src/agent/extension-host.ts` - Extension host implementation for CLI

---

## 2. Tool Execution Flow

### Tool Registration & Execution

**Tool Definitions Location**:

- Tools are defined as OpenAI-compatible function schemas
- Tool execution happens in the extension host

**Key Execution Points**:

- Tools are passed to LLM via `metadata.tools` in API handlers
- Tool results are processed and sent back to the LLM
- Tool execution is handled by the extension host, not the webview

**Files to Investigate**:

- `src/activate/handleTask.ts` - Task handling logic
- `src/api/index.ts` - API handler builder
- Tool execution handlers (need to locate)

---

## 3. Prompt Building System

### System Prompt Construction

**Location**: `src/core/prompts/` directory

**Key Components**:

- System prompt is built from multiple sections
- Sections include: objective, skills, tool-use guidelines, custom instructions
- Prompt is constructed before each LLM API call

**Key Files**:

- `src/core/prompts/system.ts` - Main system prompt builder
- `src/core/prompts/sections/` - Individual prompt sections
- `src/api/providers/*.ts` - Provider-specific prompt handling

**How It Works**:

1. System prompt is built from sections
2. Passed to API handler via `createMessage(systemPrompt, messages, metadata)`
3. Each provider (Anthropic, OpenAI, etc.) formats it according to their API

---

## 4. Message Flow

### Webview ↔ Extension Host Communication

**Message Types**:

- `WebviewMessage` - Messages from webview to extension
- `ExtensionMessage` - Messages from extension to webview

**Key Files**:

- `packages/types/src/vscode-extension-host.ts` - Type definitions
- `packages/vscode-shim/src/api/WindowAPI.ts` - Message bridge

**Flow**:

1. User types in webview
2. Webview sends `WebviewMessage` via `postMessage`
3. Extension host receives and processes
4. Extension host sends `ExtensionMessage` back
5. Webview updates UI

---

## 5. Tool Loop (Where Tools Are Executed)

### Current Understanding

**Tool Execution Pipeline**:

1. LLM requests tool call (via function calling)
2. Tool call is parsed from LLM response
3. Tool is executed in extension host
4. Tool result is formatted and sent back to LLM
5. LLM continues conversation

**Files to Investigate Further**:

- Tool execution handlers (write_file, execute_command, etc.)
- Tool result formatting
- Error handling for tool execution

---

## Next Steps for Hook Implementation

### Phase 1: The Handshake

**What We Need**:

1. **Tool Interception Point**: Find where tool calls are executed
2. **Pre-Hook Location**: Intercept before tool execution
3. **Post-Hook Location**: Intercept after tool execution
4. **Prompt Modification Point**: Where to inject intent context

**Implementation Strategy**:

- Create `src/hooks/` directory
- Implement middleware pattern for tool execution
- Add `select_active_intent` tool definition
- Modify prompt builder to include intent context

---

## Questions to Resolve

1. **Where exactly are tools like `write_file` and `execute_command` executed?**

    - Need to find the actual implementation files

2. **How can we intercept tool execution?**

    - Need to understand the tool execution pipeline

3. **Where is the best place to inject intent context?**

    - In the prompt builder? In the tool execution handler?

4. **How does the extension handle tool results?**
    - Need to understand the result formatting pipeline

---

## File Structure Discovery

```
src/
├── activate/          # Extension activation & command registration
├── api/               # API handlers for different providers
│   └── providers/     # Provider-specific implementations
├── core/              # Core functionality
│   └── prompts/       # Prompt building system
└── [need to find]     # Tool execution handlers
```

---

## Notes

- The extension uses a provider pattern for different LLM APIs
- Tools are passed as metadata to the API handlers
- The webview is completely separate from tool execution
- All tool execution happens in the extension host process

---

_Last Updated: Phase 0 - Initial Discovery_
_Next: Locate exact tool execution handlers_
