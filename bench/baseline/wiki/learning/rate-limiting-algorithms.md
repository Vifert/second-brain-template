---
title: Rate Limiting Algorithms
summary: The five common ways to limit a request rate and when each fits — fixed and sliding windows, the leaky bucket and the token bucket Mira used on the carrier API.
aliases: [rate limiting, rate limits, how to rate limit, fixed window, sliding window, sliding window log, sliding window counter, leaky bucket, boundary spike, which rate limiter should I use, throttling, rate limit errors]
topic: learning
kind: hub
tags: [field/data-engineering, method/rate-limiting, method/token-bucket, method/leaky-bucket, form/reference, activity/study]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **Five algorithms cover almost every rate limit**: fixed window, sliding window log, sliding window counter, leaky bucket and token bucket — and the choice is really about bursts.
- **A fixed window is the cheapest and has one flaw, the boundary**: with a limit of 60 a minute, a client can send 60 at 12:00:59 and 60 more at 12:01:00, so 120 pass in two seconds.
- **A sliding window log is exact but its memory grows with the limit** — a limit of 10,000 an hour means up to 10,000 timestamps per client.
- **A sliding window counter costs two counters per client** and weights the previous window by how much of it still overlaps, which is close enough to exact for most APIs.
- **A leaky bucket makes the output perfectly smooth by making bursts wait**, which suits a downstream system that cannot take bursts at all; the cost is latency, not rejection.
- **A token bucket allows a burst up to its capacity and then a steady rate**, which is what Mira Okafor used on Tidewater's carrier loader.
- **Both clippings behind this node were saved during Tidewater's first build week**, when the carrier API's undocumented limit was found by being blocked.

## Why this is here

On 16 March 2026 the Tidewater carrier loader was sleeping between pages to stay
under a rate limit that the carrier's API does not document — about 40 calls a
minute, found by being blocked. A sleep is not a limiter, so two clippings were
saved to read: one on token buckets, one on the other window algorithms. Four days
later the loader ran on a token bucket.

## The five, and when each fits

| Need | Use |
| --- | --- |
| Cheapest possible, boundary spikes acceptable | Fixed window |
| Exact limit, small limits | Sliding window log |
| Near-exact, any limit, cheap | Sliding window counter |
| Smooth output, bursts must wait | Leaky bucket |
| Allow bursts up to a size, then a steady rate | Token bucket |

### Fixed window

Count requests in each calendar window — each minute, say — and reject once the
count reaches the limit. One counter per client, and trivially cheap.

The flaw is the boundary. With a limit of 60 requests a minute, a client can send
60 at 12:00:59 and 60 more at 12:01:00: 120 requests in two seconds, all allowed.

### Sliding window log

Keep the timestamp of every accepted request and count how many fall in the last
minute. Exact, with no boundary spike, but the memory grows with the limit: a
limit of 10,000 an hour means storing up to 10,000 timestamps per client.

### Sliding window counter

Keep the fixed-window counts for this minute and the last, and weight the last by
how much of it still overlaps the sliding minute. At 12:01:15, a quarter of the way
into the minute, the estimate is this minute's count plus three quarters of the
previous minute's. Two counters per client, and close enough to exact for most
APIs.

### Leaky bucket

Requests join a queue that drains at a fixed rate; when the queue is full, new
requests are dropped. The output is perfectly smooth, which suits a downstream
system that cannot take bursts at all — a payment provider, an old mainframe. The
cost is latency: a burst is not rejected, it waits.

### Token bucket

A capacity of tokens, refilled at a steady rate, one token spent per request. It
has no boundary spike like a fixed window, and unlike a leaky bucket it allows
bursts up to the capacity. The full mechanics, the implementation without a timer
and the pitfalls are in
[[rate-limiting-token-bucket|the token bucket]].

## Where the two clippings came from

| Clipping | Source |
| --- | --- |
| Token bucket rate limiting | `https://example.com/token-bucket` |
| Fixed windows, sliding windows and leaky buckets | `https://example.com/rate-limit-windows` |

## Related

- [[rate-limiting-token-bucket|the token bucket]] — the deep reference, and the settings Tidewater runs.
- [[tidewater-data-model|the Tidewater data model]] — the carrier loader this was read for.
- [[tidewater-dashboard|Tidewater]] — the project that needed a limiter.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 16 and 20 March.
