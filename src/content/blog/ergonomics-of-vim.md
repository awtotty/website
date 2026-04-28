---
title: "The Subtle Ergonomics of Vim"
description: "A few things I love about Vim motions"
date: 2026-04-23
tags: ["vim", "ux", "design"]
---

It feels a bit odd to be talking about Vim with the break-neck speed of AI agent evolution making text editors increasingly unnecessary for writing software.
But I still use Vim a lot (I'm using it to write this very post).

Years of using Vim motions is usually realized through unconscious muscle memory, but a conversation with my wife about why I love Vim led me to a realization about a subtle beauty of Vim's UX.

Some background for non-Vim users: Vim has different modes for navigating and editing, and you use the keyboard for both.
Insert mode (for editing) will feel like most other text editors when handling input: type keys and characters are inserted in the document.
In normal mode (for navigating) keyboard input is treated as commands for moving your cursor around the document.
The keys `h`, `j`, `k`, and `l` work like &larr;, &darr;, &uarr;, and &rarr;.
There are many, many other key inputs that map to useful navigation in normal mode, but this home-row set has a subtle ergnomic that I want to focus on.

In insert mode with hands on home row (QWERTY), the right index finger is on the `j` key.
On most keyboards this key has a little nubbin so that you can _feel_ your hand is in the correct position without looking.
In normal mode, the right hand will naturally shift to the left one key so the four navigation keys are under your four fingers.
This moves the tactile feedback of the `j` key nubbin to your middle finger.
When you switch back to insert mode your right hand naturally shifts back to the right.

The beautiful part of this hand shift as you change modes is this: your mental model for what your keyboard inputs should do shifts too.
The tactile feedback of the nubbin signals the current mode, and you get a clear segmentation between the modes in your muscle memory.

It's an ingenius way of segmenting two namespaces with very different input schemas that is reinforced by touch.
For UX design, this is an great example of how to leverage multiple senses to differentiate surfaces in complex interfaces.

If you want to try it out, check out [vim-adventures.com](https://vim-adventures.com/) or type `h`, `j`, `k`, or `l` right here in this page.
Text editors may be less necessary now with the growth of multi-modal input interfaces for computers, but I'm still learning a lot from Vim about clever design solutions.
