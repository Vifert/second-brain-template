---
title: The Token Bucket
summary: How a token bucket works, how to implement one with two numbers and no timer, how to choose its capacity and refill rate, and the settings Tidewater's carrier loader runs.
aliases: [token bucket, token buckets, capacity and refill, refill rate, lazy top up, bucket capacity, how does a token bucket work, client side rate limiting, clock jump, costly requests]
topic: learning
kind: detail
tags: [field/data-engineering, method/rate-limiting, method/token-bucket, form/reference, activity/study]
created: 2026-09-23
updated: 2026-09-23
---

## Key Takeaways

- **A token bucket has a capacity and a refill rate**; each request spends one token, and a request arriving at an empty bucket is rejected or waits for a token.
- **The refill rate is the long-run limit and the capacity is the burst you tolerate** — a capacity of 1 turns the bucket into a strict rate with no bursts at all.
- **A token bucket needs no background timer**: store the tokens left and the time they were last counted, and top up lazily when a request arrives.
- **The same two numbers work per client, per API key or per endpoint**, so a limiter for thousands of clients is just a table of pairs.
- **The three pitfalls are several servers, clock jumps and costly requests**: each server with its own bucket multiplies the limit, a backwards clock makes elapsed time negative, and not every request should cost one token.
- **A client that has been idle starts with a full bucket**, so the first burst after a quiet spell is always the largest.
- **Tidewater's carrier loader uses a capacity of 5 refilling at 0.6 a second**, which turned an eight-minute full-day load into nine minutes with no rate-limit errors.

## How it works

A token bucket limits how fast requests are accepted while still allowing short
bursts.

- The bucket has a **capacity** — the most tokens it can hold.
- Tokens are added at a steady **refill** rate, up to the capacity.
- Each request spends one token. A request that arrives when the bucket is empty
  is rejected, or queued until a token is available.

**The clipping's example.** A bucket with a capacity of 100 tokens, refilling 10
per second, lets a client send a burst of 100 requests at once, and then 10 per
second after that.

Compared with a fixed window, a token bucket has no spike at the window boundary,
and compared with a leaky bucket it allows bursts up to the capacity.

## Implementing it without a timer

A bucket does not need a background task adding tokens. Store two numbers — the
tokens left and the time they were last counted — and top up lazily when a request
arrives:

```
elapsed = now - last
tokens  = min(capacity, tokens + elapsed * refill_rate)
last    = now
if tokens >= 1:
    tokens -= 1
    accept
else:
    reject, or wait (1 - tokens) / refill_rate seconds
```

The same two numbers work per client, per API key or per endpoint, so a limiter for
thousands of clients is just a table of pairs.

## Choosing the two numbers

- The **refill rate** is the long-run limit — what you can sustain.
- The **capacity** is how large a burst you tolerate. A capacity of 1 turns the
  bucket into a strict rate with no bursts at all.
- A client that has been idle starts with a full bucket, so the first burst after a
  quiet spell is always the largest.

## Pitfalls

| Pitfall | What goes wrong | What to do |
| --- | --- | --- |
| Several servers | Each server keeping its own bucket multiplies the limit by the number of servers | Keep the two numbers in a shared store, or divide the limit between servers |
| Clock jumps | If the clock goes backwards, `elapsed` is negative | Clamp it at zero |
| Costly requests | Not every request costs the same | Spend more than one token for an expensive call, which keeps one limiter fair |

## On the client side

The same algorithm limits your own calls to someone else's API. Pick the refill
rate just under their published limit, and a small capacity, and the client never
sees a rate-limit error.

## What Tidewater actually runs

| Setting | Value |
| --- | --- |
| Capacity | 5 |
| Refill rate | 0.6 tokens a second |
| The limit it stays under | About 40 calls a minute, undocumented, found by being blocked |
| Effect | Bursts a little, then settles just under the limit |
| Cost | The eight-minute full-day load became nine minutes, with no errors |

The carrier's limit is not documented and was found by being blocked, so the
figure to stay under is an observed one: 0.6 tokens a second is 36 calls a minute,
against the roughly 40 a minute that triggered a minute of errors. The runbook's
third step turns on this — if the carrier API is refusing calls, the limiter has
probably been set too high.

## Source

Clipped from `https://example.com/token-bucket`, saved on 16 March 2026 and
implemented on 20 March 2026.

## Related

- [[rate-limiting-algorithms|rate limiting algorithms]] — the hub, and the four alternatives.
- [[tidewater-data-model|the Tidewater data model]] — the loader that runs this, and the runbook.
- **Day-by-day record**: [[journal-2026-03|journal March 2026]], entries 16 and 20 March.
