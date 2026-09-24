---
title: Bird Box Camera
summary: A Raspberry Pi Zero 2 W and an infrared camera inside the allotment shed's bird box, sending stills to the home server, so nesting can be seen without opening it. Budget £65.
aliases: [bird box camera, bird box, nest camera, the shed camera, Raspberry Pi camera, Pi Zero camera, infrared camera, the £65 idea, is anything nesting]
topic: ideas
kind: idea
status: seed
tags: [tech/raspberry-pi, domain/gardening, subject/allotment, activity/personal-project]
created: 2026-04-21
updated: 2026-09-23
---

## Key Takeaways

- **The bird box camera is a Raspberry Pi Zero 2 W with the small camera module and an infrared LED**, inside the bird box on the allotment shed, so nesting can be seen without opening the box.
- **The bird box camera would take stills every ten minutes by day and a short clip on motion**, sent to a folder on the home server over Wi-Fi, with no cloud service.
- **The budget is about £65** for the board, the camera, the LED and a bigger solar panel.
- **Power is the hard part**: the Pi draws far more than the soil sensor's ESP32 and cannot sleep the same way, so it needs its own panel and a larger battery, or a cable from the shed's one socket, which is on a timer.
- **The camera has to be fitted in winter, before anything nests.**
- **The [[allotment-soil-sensor|soil sensor]] comes first**; if its power setup works, it gets reused here.

## The Idea

A small camera inside the bird box on the allotment shed, so I can see whether
anything is nesting without opening it.

- A **Raspberry Pi Zero 2 W** with the small camera module and an infrared LED for
  the dark inside the box.
- Stills every ten minutes by day, and a short clip when motion is detected.
- Pictures go to a folder on my home server over Wi-Fi; no cloud service.
- Budget: about **£65** for the board, the camera, the LED and a bigger solar
  panel.

## Why It Matters

Opening a bird box to see whether anything is nesting is the one thing that would
stop anything nesting. A camera answers the question without the disturbance —
which is also why the fitting has to happen out of season.

## Problems to solve first

- **Power.** The Pi draws far more than the soil sensor's ESP32 and cannot sleep
  the same way. It needs a panel of its own and a larger battery, or a cable from
  the shed's one socket, which is on a timer.
- **Wi-Fi.** The same open question as the [[allotment-soil-sensor|soil sensor]]:
  whether the signal reaches the shed at the far end.
- **Not disturbing the birds.** Fit the camera in winter, before anything nests.

## Where it stands

Only an idea. The [[allotment-soil-sensor|soil sensor]] comes first; if its power
setup works, reuse it here.

## Where it came from

Half-formed on the walk home on 16 April 2026 — a camera in the bird box on the
shed, streaming to a phone — with the power problem recognised immediately as the
soil sensor's problem, and the thought "maybe one solar panel for both". Written up
properly on 21 April 2026. The £65 budget and the separate-panel conclusion belong
to the write-up, which replaced the shared-panel guess.

## Related

- [[allotment-soil-sensor|the allotment soil sensor]] — the idea that comes first, and shares the power problem.
- **Day-by-day record**: [[journal-2026-04|journal April 2026]], entries 16 and 21 April.
