# Idea: bird box camera

Status: seed

A small camera inside the bird box on the allotment shed, so I can see whether
anything is nesting without opening it.

- A **Raspberry Pi Zero 2 W** with the small camera module and an infrared LED
  for the dark inside the box.
- Stills every ten minutes by day, and a short clip when motion is detected.
- Pictures go to a folder on my home server over Wi-Fi; no cloud service.
- Budget: about **£65** for the board, the camera, the LED and a bigger solar
  panel.

## Problems to solve first

- **Power.** The Pi draws far more than the soil sensor's ESP32 and cannot
  sleep the same way. It needs a panel of its own and a larger battery, or a
  cable from the shed's one socket, which is on a timer.
- **Wi-Fi.** The same open question as the soil sensor: whether the signal
  reaches the shed at the far end.
- **Not disturbing the birds.** Fit the camera in winter, before anything
  nests.

## Status

Only an idea. The soil sensor comes first; if its power setup works, reuse it
here.
