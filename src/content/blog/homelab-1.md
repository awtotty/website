---
title: "Adventures in Homelab: Episode 1"
description: "Getting started with a proper homelab setup"
date: 2026-06-08
tags: ["homelab", "proxmox", "linux", "systems"]
---

I have been dreaming of a new homelab setup for a bit now.
I have an older desktop that I used to use for games and development, but it doesn't get a lot of attention these days.
It's ready for new life, and I'm ready for a proper at-home cloud computer, with custom VMs for remote development, media server, local LLM server, etc.

When I found Proxmox I was hopeful that the setup would be pretty easy.
I've installed a Linux distro more times than I can count, and Proxmox has Debian as a base.
How hard could it be?

The next 24 hours would be full of trials.

To start, download the Proxmox VE iso and burn it to a drive.
Balena Etcher refused the first downloaded iso, so you downloaded a fresh one, which worked.
You're not sure what what wrong with the first one, but no worries.

Now restart and boot from the flashed drive to get to the Proxmox installer.
The default options don't work (both GUI and TUI options).
After a few lines of boot logs the screen goes to a garble of nonsense.
The issue: the install wizard was blocked by missing graphics card drivers (this isn't the last we'll hear of the old RTX 3080).
The fix: edit the installer script by pressing `e` in the menu and add `nomodeset` to the linux command.

No more garble, but the GUI option still doesn't work; it hangs after a few logs.
Try the TUI option.
Good news!
The install wizard loads.
Bad news!
It doesn't fit on the screen.
You can make out the very bottom fo the TUI window, enough to see the "I Agree" text for the terms of service, but the remaining options in the wizard are completely invisible.
Try setting `video=1024x768`.
Try setting `vga=768`.
Try a few more resolutions.
Read forum posts from five (FIVE!) years ago from users with the same issue.
Apparently it's an issue with the UEFI boot.
Try legacy boot.
No change.

Give up and reboot the old Ubuntu install to create an `answers.toml` file.
This is actually pretty nice: you can provide all of the config answers up front and bundle it with the iso.
The wizard detects the bundled file and defaults to an automated install.
No more TUI wizard to blindly navigate.
Give it a shot.
You forgot to edit the boot command to include `nomodeset`.
Try again and it seems to be working.
Wait, is it stuck?
No new logs for a few minutes.
Restart the machine?
Well, the old Ubuntu boot partition is gone, so it must be doing something.
Try again, don't forget `nomodeset`.

Hey! There it is!
System reboots automatically into a new grub menu and Proxmox VE is the default option.
It boots on its own, things are looking good.
Wait, is it stuck again?
You've learned your lesson: wait a few minutes.
OK it's been 20 minutes, surely an OS can boot faster than that in 2026.
Learn how to boot systemd in emergency mode.
Everything looks good there so the kernel is booting fine.
Start a normal boot from there with `systemctl isolate multi-user.target`.
Bingo: it hangs at

`NovaCore 000:07:00.0: NVIDIA (Chipset: GA102, Architecture: Ampere, Revision: a.1)`

There's your old friend, the RTX 3080, and boot is trying its hardest to install drivers for it.
Normally this driver auto install is wonderfully convenient, but Proxmox doesn't like it.
So reboot and edit the boot command in grub with `e` again to add a one-time blacklist to the GPU driver sources: append

`modprobe.blacklist=nouveau,nova_core,nova_drm,nvidiafb`

to the linux command.
Tada! Proxmox VE boots and you see the local address to access the control center: `https://192.168.100.2:8006/`.

You're nearly there, I promise.
Control center times out.
Dig around for a while until you realize your LAN is on a different subnet.
Tweak `/etc/network/interfaces` to use the correct one.

And there it is. Proxmox web control center loads.
Don't forget to edit your grub setup so you don't try to install drivers on reboot.
Edit `/etc/default/grub` to have

`GRUB_CMDLINE_LINUX_DEFAULT="nomodeset modprobe.blacklist=nouveau,nova_core,nova_drm,nvidiafb"`

then run `update-grub`.
You'll also want to disable the enterprise repos and add the no-subscription one.
Check the Proxmox docs.

It's over. You've done it. Now you can start.
