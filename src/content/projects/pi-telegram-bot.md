---
title: "Pi Telegram Bot"
description: "Chat with your Pi agent from Telegram"
date: 2026-06-30
github: "https://github.com/awtotty/pi-telegram-bot"
tags: ["AI Agents", "Telegram", "Pi", "Openclaw"]
---

## Pi Telegram Bot

Pi Telegram Bot is a simple bridge service that routes messages sent to a Telegram bot to your local Pi coding agent installed on your system.
It runs as a small user service on your machine, receives Telegram messages, sends them to a local Pi agent session, and replies in Telegram.
Chat with your agent on the go!

## How it works

- Telegram long polling receives updates from your bot.
- Only allowlisted Telegram users can send prompts to the agent.
- Each Telegram chat maps to a persistent Pi session.
- Replies are chunked to fit Telegram message limits.
- The service logs polling, message handling, session dispatch, replies, and errors to journald.
