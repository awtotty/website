---
title: "orc"
description: "CLI for orchestrating multiple AI coding agents working on the same project simultaneously"
date: 2026-02-11
github: "https://github.com/awtotty/orc"
tags: ["Python", "CLI", "AI Agents", "Multi-Agent"]
---

orc is a CLI-based orchestration system for managing multi-agent AI coding workflows. It enables developers to coordinate multiple AI agents (powered by Claude Code) working on the same project simultaneously — breaking down complex tasks, delegating to specialized workers, and monitoring progress through an elegant CLI and web dashboard.

**Key features include:**

- Multi-agent architecture with an orchestrator (@main) that delegates work to isolated worker rooms
- Filesystem-based communication through JSON inboxes, status files, and molecule/atom work items
- Git worktree isolation so each worker operates on its own branch without conflicts
- Role-based system prompts that teach agents how to use the orc protocol
- Docker sandbox environment with all development tools pre-installed
- Interactive web dashboard for real-time monitoring of agents, rooms, and statuses
- Tmux integration for live terminal access to each agent session
- Universe system for coordinating work across multiple repositories

**Technologies:**

- Language: Python 3.11+
- CLI Framework: Click + Rich
- Web Dashboard: HTML5 SPA with WebSockets
- Containerization: Docker
- Session Management: tmux
- AI Integration: Claude Code
- Version Control: Git worktrees for parallel branches

**Challenges:**

- Designing a reliable filesystem-based inter-agent communication protocol
- Managing git worktree lifecycle and branch coordination across parallel workers
- Building a real-time web dashboard that monitors distributed agent state
- Keeping agent context focused while orchestrating complex multi-step workflows

The workflow is simple: run `orc start` to provision a sandbox, `orc init` to set up the orchestration structure, then tell the orchestrator what to build. It breaks work into atoms, spins up worker rooms with dedicated git branches, delegates tasks via inbox messages, and monitors progress — all while you watch from the web dashboard or CLI.

orc was built to solve the problem of managing complex, multi-file coding tasks that benefit from parallelism and specialization. Instead of one agent context-switching between concerns, orc lets you have dedicated agents for frontend, backend, testing, and more — each working independently but coordinated through the filesystem.
