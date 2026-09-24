# Fixed windows, sliding windows and leaky buckets

*Clipped from https://example.com/rate-limit-windows*

Three other common ways to limit a request rate, and when each fits.

## Fixed window

Count requests in each calendar window — each minute, say — and reject once the
count reaches the limit. It is one counter per client and trivially cheap.

The flaw is the boundary. With a limit of 60 requests a minute, a client can
send 60 at 12:00:59 and 60 more at 12:01:00: 120 requests in two seconds, all
allowed.

## Sliding window log

Keep the timestamp of every accepted request and count how many fall in the
last minute. Exact, with no boundary spike, but the memory grows with the limit:
a limit of 10,000 an hour means storing up to 10,000 timestamps per client.

## Sliding window counter

Keep the fixed-window counts for this minute and the last, and weight the last
by how much of it still overlaps the sliding minute. At 12:01:15, a quarter of
the way into the minute, the estimate is this minute's count plus three
quarters of the previous minute's. Two counters per client, and close enough
to exact for most APIs.

## Leaky bucket

Requests join a queue that drains at a fixed rate; when the queue is full, new
requests are dropped. The output is perfectly smooth, which suits a downstream
system that cannot take bursts at all — a payment provider, an old mainframe.
The cost is latency: a burst is not rejected, it waits.

## Which to use

| Need | Use |
| --- | --- |
| Cheapest possible, boundary spikes acceptable | Fixed window |
| Exact limit, small limits | Sliding window log |
| Near-exact, any limit, cheap | Sliding window counter |
| Smooth output, bursts must wait | Leaky bucket |
| Allow bursts up to a size, then a steady rate | Token bucket |
