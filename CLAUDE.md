# CLAUDE.md — AI Orchestration Brain

## Project Context

This is a governed fork of Roo Code. The primary innovation is a **Deterministic Hook System** for Intent-Code Traceability.

## Operational Constraints

- **Handshake Protocol**: Always call `select_active_intent` before any mutating tool.
- **Traceability**: All writes must be classified (`AST_REFACTOR` vs `INTENT_EVOLUTION`).
- **Safety**: Do not modify core VS Code API interaction logic without an explicit Architectural Intent.

## Lessons Learned

### [Automated Lesson] - 2026-02-21

- **Context:** Tool failure in task `final-refinement-task`
- **Issue:** Redundant variable declarations in HookEngine.ts causing lint errors.
- **Resolution:** Consolidate `content` and `hash` variables after calculating the heuristic.

### [Automated Lesson] - 2026-02-18

- **Context:** Initial hook wiring
- **Issue:** Missing `nativeArgs` mapping prevented pre-hooks from reading `path` parameter.
- **Resolution:** Added `mutation_class` to `NativeToolArgs` and updated the `tool_use` switch in `presentAssistantMessage.ts`.
