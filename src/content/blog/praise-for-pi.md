---
title: "Praise for Pi"
description: "The little agent harness that could"
date: 2026-04-22
tags: ["ai", "agents", "extensibility", "open source"]
---

For months I've been a die-hard Claude Code user.
It was the first agent harness I used, and it was always good enough for me to get things done.
But lately it's felt more and more bloated as Anthropic crams feature after feature into it.
It's a lot of stuff I don't use and don't need.
(Seriously, I don't want a gotcha game-style virtual buddy in my coding tool I use every day.)

But hark my friends! I have a new love!
Behold: [Pi](https://pi.dev/), the little agent harness that could.
As a neovim user I feel seen. Pi is barebones:

> Pi is aggressively extensible so it doesn't have to dictate your workflow. Features that other tools bake in can be built with extensions, skills, or installed from third-party pi packages. This keeps the core minimal while letting you shape pi to fit how you work.
>
> No MCP. Build CLI tools with READMEs (see Skills), or build an extension that adds MCP support. Why?
>
> No sub-agents. There's many ways to do this. Spawn pi instances via tmux, or build your own with extensions, or install a package that does it your way.
>
> No permission popups. Run in a container, or build your own confirmation flow with extensions inline with your environment and security requirements.
>
> No plan mode. Write plans to files, or build it with extensions, or install a package.
>
> No built-in to-dos. Use a TODO.md file, or build your own with extensions.
>
> No background bash. Use tmux. Full observability, direct interaction.

And because Pi ships with documentation on how to extend it, you can just ask _it_ to build what you want it to do.
In my first hour with the harness I built and shipped a Pi extension:

1. I couldn't see a way to use OpenCode Zen/Go as my model provider (I discovered [and facepalmed] later that this is possible out of the box)
2. I asked Pi to build a way for me to do that
3. Pi created the extension and bundled it as an npm package to publish ([pi-opencode](https://www.npmjs.com/package/pi-opencode))

It was a lot of fun.
That's just the surface of what you build for it: [https://pi.dev/packages](https://pi.dev/packages).
(Of course, it runs [Doom](https://www.npmjs.com/package/pi-doom).)
The vision for computing as a highly personal, custom system of expression feels real.
It feels like the delightful chaos of MySpace, but bigger and built faster.
I still spend most of my days oscillating wildly between hype-pilled and full of existential dread over the future of software.
But Pi is making the ride a lot more enjoyable.
