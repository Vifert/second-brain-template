---
title: Allotment Soil Sensor
summary: An ESP32 and a capacitive moisture probe on solar power, reporting into Postgres every half hour, so watering the allotment stops being a guess. Budget £40.
aliases: [soil sensor, soil moisture sensor, the allotment sensor, moisture sensor, ESP32 sensor, when to water, watering sensor, capacitive probe, the £40 sensor]
topic: ideas
kind: idea
status: seed
tags: [tech/esp32, tech/postgres, domain/gardening, subject/allotment, activity/personal-project]
created: 2026-04-21
updated: 2026-09-23
---

## Key Takeaways

- **The allotment soil sensor is an ESP32 with a capacitive soil-moisture probe on a small solar panel**, taking a reading every 30 minutes over Wi-Fi into a Postgres table, with a chart of moisture over the week.
- **The budget is £40**, which the parts list uses exactly, with nothing to spare.
- **Capacitive, not resistive**: resistive probes corrode within a season in wet soil, and capacitive ones have no exposed metal.
- **The open question is Wi-Fi range** — whether the allotment's signal reaches the far bed.
- **[[sam-whitlock|Sam Whitlock]]'s knuckle test is the calibration reference**: water when it says dry, and see what the sensor reads then.
- **The idea started on 26 March 2026**, the day [[sam-whitlock|Sam Whitlock]] laughed at it, and was written up on 21 April 2026.

## The Idea

Stop guessing when to water the allotment.

- An **ESP32** with a capacitive soil-moisture sensor, powered by a small solar
  panel.
- A reading **every 30 minutes**, sent over Wi-Fi into a Postgres table.
- A tiny chart of moisture over the week.
- Budget: **£40** for the board, the sensor and the panel.

Open question: whether the allotment's Wi-Fi reaches the far bed.

## Why It Matters

Watering the allotment is currently a guess, and the reference method belongs to
somebody else's hand. [[sam-whitlock|Sam Whitlock]], who has the next plot and
thirty years on it, waters by putting a finger in the soil to the second knuckle
and watering if it is dry there. The sensor is an attempt to make that judgement
legible, and to see a week of it at once rather than one moment.

## Why capacitive

Resistive probes corrode within a season in wet soil. Capacitive ones cost a
little more and have no exposed metal.

## Power

The ESP32 sleeps between readings and wakes for a few seconds, so a small panel
and one 18650 cell should last through a grey fortnight. If the
[[bird-box-camera|bird box camera]] happens, it needs far more power and would want
its own panel.

## Calibration

Read the sensor in dry soil and in soil just watered, and map the two readings to
0% and 100%. Redo it once a season. [[sam-whitlock|Sam Whitlock]]'s knuckle test is
the reference: water when it says dry, and see what the sensor reads then.

## Parts list

| Part | Rough cost |
| --- | --- |
| ESP32 development board | £8 |
| Capacitive soil-moisture sensor | £4 |
| Small solar panel (1 W) and charge board | £14 |
| 18650 cell and holder | £7 |
| Weatherproof box and cable glands | £7 |

That comes to the £40 budget, with nothing to spare. Reuse the old Postgres on the
home server for the readings rather than paying for anything hosted.

## Later, maybe

- A second sensor in the raised bed, where the soil drains faster.
- A message to my phone when the reading drops below the watering line.

## Where it came from

| Date | What |
| --- | --- |
| 2026-03-26 | [[sam-whitlock\|Sam Whitlock]] demonstrated the knuckle test and laughed at the idea of a sensor. Mira Okafor's note: "I'm going to build one anyway." |
| 2026-04-16 | The power problem recognised as shared with the [[bird-box-camera\|bird box camera]] — "maybe one solar panel for both" |
| 2026-04-21 | Written up as its own note |

## Related

- [[bird-box-camera|the bird box camera]] — the other allotment idea, which waits on this one's power setup.
- [[sam-whitlock|Sam Whitlock]] — whose knuckle test is the reference.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entry 26 March, and [[journal-2026-04|journal April 2026]], entries 16 and 21 April.
