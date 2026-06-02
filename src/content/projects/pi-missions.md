---
title: "Pi Missions"
description: "Long-running tasks with validation for Pi coding agent"
date: 2026-05-22
github: "https://github.com/awtotty/pi-missions"
url: "https://www.npmjs.com/package/@awtotty/pi-missions"
tags: ["AI Agents", "Goals", "Software Factory"]
---

## Pi Missions

Pi Missions is an extension for [Pi coding agent](https://pi.dev) inspired by [Missions by Factory](https://factory.ai/product/missions).
Define, run, and monitor very long-running, milestone-based coding tasks.

## Comparison to `/goal`

The `/goal` command is a recent and popular addition to Codex, Claude Code, and other coding agent harnesses.
It implements a Ralph Loop with a bit more structure for validation of task completion.
Some implementations use a different model for validation to reduce bias from the implementing model.
Some allow the implementing agent to validate itself.
These havea a similar target outcome as Missions: set it and forget it, long-running agentic tasks with self validation.

Pi Missions is inspired by Factory's take on this problem.
It features enough deterministic state-machine management to ensure that validation runs effectively while keeping as much implementation as possible defined in agent skills.
That means that when a better inference model comes out, Pi Missions gets better for free; no changes needed to the core loop.
The skills include guidance for agents about how missions are structured.
In practice this means that users very rarely need to use the provided commands to manage a mission.
Instead, just ask the agent to do it for you.
This is great when recovering an interrupted mission, jumping in mid-run to modify something, or asking for status updates on a mission running in the background while you work on other things.

## Learnings

- Reduce and simplify: don't over-engineer a solution when a skill will suffice. Agent are increasingly able to tackle complex work on their own. Pi-missions has a lot of functionality that is useful for tracking state and validating results. But it would probably work as well (and weigh a lot less) to just give an agent access to subagents and provide a very clearly prompt/skill.
- Don't trust agents too much: the push back to the point above. E.g. the `/goal` extension works better when the validation is handled by a different agent with a clean slate (preferrable a different model). Letting the implementing agent decide for itself when it's done is a recipe for poor quality and inconsistent results.
- The middle way is likely the best: keep extensions as light as possible, but lean on non-agentic tooling for high-stakes processes (e.g. evaluation, validation, etc.)
