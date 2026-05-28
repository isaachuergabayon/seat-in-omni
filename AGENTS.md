# AGENTS.md

> Operational instructions for AI coding agents working on `seat-in-omni`. For project context, see `README.md`.

---

## Context Management

Context is your most important resource. Proactively use subagents (if supported) to keep exploration, research, and verbose operations out of the main conversation.

**Default to spawning agents for:**
- Codebase exploration (reading 3+ files to answer a question)
- Research tasks (web searches, doc lookups, investigating how something works)
- Any investigation where only the summary matters

**Stay in main context for:**
- Direct file edits the user requested
- Short, targeted reads (1-2 files)
- Conversations requiring back-and-forth

---

## Skills

> **MANDATORY**: Before starting ANY task, inspect your loaded skills and execute every skill that matches. Skills override your general knowledge — they are the primary source of truth for framework conventions.

| Skill | When & Why |
|-------|------------|
| `agents-md` | Invoke when asked to create or update AGENTS.md to follow the canonical generation workflow. |
| `conventional-commits` | Invoke before writing any commit message to enforce Conventional Commits format. |

If a required skill is not loaded, inform the user before proceeding.

---

## Build & Test

Load before running any build, test, lint, or install command.

> `read_file .aicontext/agent_docs/build-and-test.md`

---

## Codebase Navigation

Load before modifying, navigating, or adding files to understand module boundaries, dependencies, and integrations.

> `read_file .aicontext/agent_docs/codebase-navigation.md`

---

## Security Constraints

Load before touching authentication, secrets, sensitive data, or security-related code paths.

> `read_file .aicontext/agent_docs/security-constraints.md`

---

## Git Workflows

Load before creating branches, writing commits, or opening pull requests.

> `read_file .aicontext/agent_docs/git-workflows.md`

---

## Conventions & Constraints

Load before writing or reviewing any code to apply naming, style, architecture, error-handling, and testing rules.

> `read_file .aicontext/agent_docs/conventions-and-constraints.md`
