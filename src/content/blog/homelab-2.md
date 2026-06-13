---
title: "Adventures in Homelab: Episode 2"
description: "Setting up a VPN and the first VMs"
date: 2026-06-13
tags: ["homelab", "proxmox", "tailscale", "dev", "jellyfin", "telegram"]
---

[<Read Episode 1>](https://www.austin-totty.com/blog/homelab-1)

I survived the trials of setting up Proxmox, so my personal cloud homelab is ready for me to build some services. 
My first goal is to get a development machine running and move my daily workflows for SWE work to it.
I've been developing on Linux for a while now, and most of my setup is committed to repos (e.g. my configuration for [neovim](https://github.com/awtotty/nvim), [tmux](https://github.com/awtotty/tmux), [pi](https://github.com/awtotty/pi-setup), etc.). 
I'm expecting most of the VMs in my cloud will be Ubuntu machines, so I start by building an Ubuntu base template VM that I can clone to create new VMs for dedicated purposes. 

The Ubuntu base template is bare bones: it's Ubuntu 24 LTS. 
It includes cloud-init to install basic packages and [Tailscale](https://tailscale.com/) so new machines are easily added to my VPN. 
If you haven't used Tailscale yet, you're missing out. 
It makes connecting all of your machines (virtual or otherwise) dead simple. 
After I create a new VM, I access the console through the Proxmox web dashboard and run `tailscale up`. 
Then any of my other devices can ssh into the new one by device name (e.g. `dev-01`, `jellyfin-01`, etc.).
No need to set stable IP addresses, no need to login to my router admin page to find the correct DHCP lease, and no need to set up port forwarding to expose your network to the internet (a huge win for easy and safe access to a media server from anywhere; more on this in a bit). 
Tailscale just works. 
You should use it. 

## The Dev VM 

With the base template set up, I clone and start setting up the development VM. 
This one gets lots of RAM, lots of cores, and all of the useful software and custom configuration.
My favorite part of this setup is that it's easy to set up a local port forward through ssh on any device to forward to local dev servers running on the VM.
So I forward port 3000, 4321, etc. on my laptop to the same on the dev VM and voila, full access to everything I need over the remote connection. 
I highly recommend using tmux on the dev VM so if you lose connection you can ssh back in and pick up right where you left off. 

All of this was up and running and feeling like home in about an hour.
I've been dancing around a proper cloud development environment for years, and it feels great to have finally landed it.
The only additional piece I added was a native [pi-telegram-bot](https://github.com/awtotty/pi-telegram-bot) bridge so I can chat with an agent in the VM from anywhere. 
Who needs ChatGPT or Claude web chat?
I originally built this bridge for my project [Harbor](https://github.com/awtotty/harbor), but I decided a proper VM approach was better than the container used in Harbor.
Of course the containerization adds a nice layer of safety, should your agent decide to go rogue and wipe your system or something (I've never had this problem, but the paranoia is real).
But Proxmox scheduled backups for all of the VMs makes recovery trivial, so I can sleep at night. 

## The Media Server VM

So the development server is done. 
It's been my daily driver since I've set it up and it's going great. 
On to the next service: a home media server. 
I previously had Jellyfin set up on an old device, and setting it up in a fresh VM was a piece of cake. 
Again, clone the base VM and login to Tailscale. 
This VM setup required an external drive passthrough setup in proxmox so that the VM could mount my media hard drive.
This was pretty easy, and I'm hoping the GPU passthrough will be as simple when I need it for future VMs. 
I don't have any 4k media that needs transcoding, so I skipped the GPU passthrough for the Jellyfin VM for now. 
I install Jellyfin for native Ubuntu. 
Library scan takes a while, but I leave it over night and come back to it fully populated.
Tailscale is great, so I can access my stuff from anywhere at jellyfin-01:8096. 
EZPZ. 
Again, you should be using Tailscale. 

## Up Next

And that's it for now. 
Next I plan on creating a VM for a local LLM server. 
Stay tuned for Episode 3. 
