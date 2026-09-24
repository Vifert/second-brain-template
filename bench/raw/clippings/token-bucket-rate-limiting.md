# Token bucket rate limiting

*Clipped from https://example.com/token-bucket*

A token bucket limits how fast requests are accepted while still allowing short
bursts.

- The bucket has a **capacity** — the most tokens it can hold.
- Tokens are added at a steady **refill** rate, up to the capacity.
- Each request spends one token. A request that arrives when the bucket is
  empty is rejected, or queued until a token is available.

**Example.** A bucket with a capacity of 100 tokens, refilling 10 per second,
lets a client send a burst of 100 requests at once, and then 10 per second
after that.

Compared with a fixed window, a token bucket has no spike at the window
boundary, and compared with a leaky bucket it allows bursts up to the capacity.

## Implementing it without a timer

A bucket does not need a background task adding tokens. Store two numbers —
the tokens left and the time they were last counted — and top up lazily when a
request arrives:

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

The same two numbers work per client, per API key or per endpoint, so a limiter
for thousands of clients is just a table of pairs.

## Choosing the two numbers

- The **refill rate** is the long-run limit — what you can sustain.
- The **capacity** is how large a burst you tolerate. A capacity of 1 turns the
  bucket into a strict rate with no bursts at all.
- A client that has been idle starts with a full bucket, so the first burst
  after a quiet spell is always the largest.

## Pitfalls

- **Several servers.** Each server keeping its own bucket multiplies the limit
  by the number of servers. Keep the two numbers in a shared store, or divide
  the limit between servers.
- **Clock jumps.** If the clock goes backwards, `elapsed` is negative; clamp it
  at zero.
- **Costly requests.** Not every request costs the same. Spending more than one
  token for an expensive call keeps one limiter fair.

## On the client side

The same algorithm limits your own calls to someone else's API. Pick the
refill rate just under their published limit, and a small capacity, and the
client never sees a rate-limit error.
