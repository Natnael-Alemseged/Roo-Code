# TRP1 Challenge - Your Step-by-Step Roadmap

## 🎯 The Goal (In Simple Terms)

You're building a "Hook System" that sits between the AI agent and the code it writes. Think of it like a security guard + librarian:

1. **Before the AI writes code**: Check if it has permission (Intent ID)
2. **After the AI writes code**: Log what it did and link it to the "why" (Intent)

---

## 📋 What You Need to Build

### Phase 0: Understand Roo Code (YOU ARE HERE) ✅

**Goal**: Map how Roo Code works internally

**Tasks**:

- [x] Fork Roo Code and get it running
- [x] Create ARCHITECTURE_NOTES.md (started)
- [ ] Find where `write_file` tool is executed
- [ ] Find where `execute_command` tool is executed
- [ ] Find where system prompts are built
- [ ] Document the tool execution flow

**Deliverable**: Complete ARCHITECTURE_NOTES.md

---

### Phase 1: The Handshake (Reasoning Loop)

**Goal**: Force AI to "checkout" an intent before writing code

**What to Build**:

1. Create `.orchestration/active_intents.yaml` file structure
2. Create new tool: `select_active_intent(intent_id: string)`
3. Pre-Hook: Intercept tool calls, check if intent is selected
4. Inject intent context into prompts

**Key Files to Create**:

- `src/hooks/HookEngine.ts` - Main hook system
- `src/hooks/IntentManager.ts` - Manages active intents
- `.orchestration/active_intents.yaml` - Intent storage

---

### Phase 2: Hook Middleware & Security

**Goal**: Block unauthorized actions

**What to Build**:

1. Classify tools as Safe (read) vs Destructive (write)
2. Check if file matches intent's `owned_scope`
3. Show approval dialog for destructive actions
4. Handle rejections gracefully

**Key Features**:

- Scope enforcement (can't edit files outside intent scope)
- Human-in-the-loop approval
- Error handling

---

### Phase 3: AI-Native Git Layer

**Goal**: Track what code was written and why

**What to Build**:

1. Create `agent_trace.jsonl` - append-only log
2. Calculate content hashes (SHA-256) for code blocks
3. Link code changes to Intent IDs
4. Classify changes: REFACTOR vs FEATURE

**Key Files**:

- `src/hooks/TraceLogger.ts` - Logs to agent_trace.jsonl
- `src/hooks/ContentHasher.ts` - Calculates hashes
- `.orchestration/agent_trace.jsonl` - The ledger

---

### Phase 4: Parallel Orchestration

**Goal**: Multiple AI agents working together safely

**What to Build**:

1. Optimistic locking (check file hasn't changed)
2. Shared brain (`CLAUDE.md` or `AGENT.md`)
3. Conflict detection and resolution

---

## 🚀 Quick Start Guide

### Step 1: Complete Phase 0 (This Week)

1. **Find Tool Execution**:

    ```bash
    # Search for where tools are executed
    grep -r "write_file\|write_to_file" src/
    grep -r "execute_command" src/
    ```

2. **Understand the Flow**:

    - Open `src/activate/handleTask.ts`
    - Look for where tools are called
    - Trace the execution path

3. **Document Everything**:
    - Update `ARCHITECTURE_NOTES.md`
    - Draw diagrams if helpful
    - Note where you'll inject hooks

### Step 2: Create Hook Directory Structure

```bash
mkdir -p src/hooks
mkdir -p .orchestration
```

### Step 3: Start Building Phase 1

Begin with the simplest piece: Create the `select_active_intent` tool.

---

## 📁 Directory Structure You'll Create

```
Roo-Code/
├── src/
│   └── hooks/                    # Your hook system
│       ├── HookEngine.ts         # Main middleware
│       ├── IntentManager.ts       # Intent management
│       ├── TraceLogger.ts         # agent_trace.jsonl writer
│       ├── ContentHasher.ts       # SHA-256 hashing
│       └── ScopeEnforcer.ts       # Scope validation
├── .orchestration/               # Machine-managed files
│   ├── active_intents.yaml       # Intent specifications
│   ├── agent_trace.jsonl         # Append-only ledger
│   ├── intent_map.md             # Intent → File mapping
│   └── CLAUDE.md                 # Shared brain
└── ARCHITECTURE_NOTES.md         # Your Phase 0 deliverable
```

---

## 🎓 Key Concepts to Understand

### 1. Intent-Code Traceability

**Problem**: Git tracks WHAT changed, not WHY
**Solution**: Link every code change to a business intent (Intent ID)

### 2. Context Engineering

**Problem**: AI loses context, writes wrong code
**Solution**: Inject only relevant context based on active intent

### 3. Hook Pattern

**Pattern**: Intercept → Validate → Execute → Log

- Pre-Hook: Before execution (validation)
- Post-Hook: After execution (logging)

### 4. Spatial Independence

**Concept**: Use content hashes instead of line numbers
**Why**: Code moves, but hash stays the same

---

## 📝 Example: How It Should Work

### User Request:

```
"Refactor the auth middleware"
```

### AI Agent Flow:

1. **State 1**: Receives request
2. **State 2**: Calls `select_active_intent("INT-001")`
    - Pre-Hook intercepts
    - Loads intent context from `active_intents.yaml`
    - Injects context into prompt
3. **State 3**: Calls `write_file(path="src/auth/middleware.ts", content="...")`
    - Pre-Hook checks scope (is file in intent's owned_scope?)
    - If valid: Execute
    - Post-Hook logs to `agent_trace.jsonl` with:
        - Intent ID: INT-001
        - Content hash: sha256:abc123...
        - Classification: AST_REFACTOR

---

## 🛠️ Tools You'll Need

- **YAML parser**: For `active_intents.yaml` (use `js-yaml`)
- **SHA-256**: For content hashing (use Node.js `crypto`)
- **File watcher**: For detecting parallel changes (use `chokidar` or VS Code API)

---

## ⚠️ Common Pitfalls

1. **Don't modify core Roo Code files directly**

    - Use hooks/middleware pattern
    - Keep your code in `src/hooks/`

2. **Don't block the main thread**

    - Use async/await
    - Don't freeze VS Code UI

3. **Handle errors gracefully**
    - If hook fails, don't crash extension
    - Return clear error messages to AI

---

## 📅 Timeline

- **Wednesday (Interim)**: Phase 0 + Phase 1 started
- **Saturday (Final)**: All phases complete + demo video

---

## 🆘 Need Help?

1. Read the challenge doc again (focus on one phase at a time)
2. Check `ARCHITECTURE_NOTES.md` for your findings
3. Start small - get one hook working first
4. Test incrementally - don't wait until the end

---

**Remember**: You're not building a chatbot. You're building governance and traceability for AI-generated code.

Good luck! 🚀
