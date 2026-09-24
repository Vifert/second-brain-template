# Idea: allotment soil sensor

Status: seed

Stop guessing when to water the allotment.

- An **ESP32** with a capacitive soil-moisture sensor, powered by a small solar
  panel.
- A reading **every 30 minutes**, sent over Wi-Fi into a Postgres table.
- A tiny chart of moisture over the week.
- Budget: **£40** for the board, the sensor and the panel.

Open question: whether the allotment's Wi-Fi reaches the far bed.

## Why capacitive

Resistive probes corrode within a season in wet soil. Capacitive ones cost a
little more and have no exposed metal.

## Power

The ESP32 sleeps between readings and wakes for a few seconds, so a small panel
and one 18650 cell should last through a grey fortnight. If the bird box camera
happens, it needs far more power and would want its own panel.

## Calibration

Read the sensor in dry soil and in soil just watered, and map the two readings
to 0% and 100%. Redo it once a season. Sam Whitlock's knuckle test is the
reference: water when it says dry, and see what the sensor reads then.

## Parts list

| Part | Rough cost |
| --- | --- |
| ESP32 development board | £8 |
| Capacitive soil-moisture sensor | £4 |
| Small solar panel (1 W) and charge board | £14 |
| 18650 cell and holder | £7 |
| Weatherproof box and cable glands | £7 |

That comes to the £40 budget, with nothing to spare. Reuse the old Postgres
on the home server for the readings rather than paying for anything hosted.

## Later, maybe

- A second sensor in the raised bed, where the soil drains faster.
- A message to my phone when the reading drops below the watering line.
