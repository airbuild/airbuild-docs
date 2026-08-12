---
title: Webhooks
description: Receive HTTP callbacks for builds, links, downloads, subscriptions, and team events.
---

# Webhooks

Webhooks let AirBuild notify your server when events happen — such as a build being uploaded, a download starting, or a subscription being canceled. Configure webhook endpoints and AirBuild will send HTTP POST requests with event data.

## What are webhooks?

A webhook is an HTTP callback: AirBuild sends an HTTP POST request to a URL you specify whenever a subscribed event occurs. This lets you integrate AirBuild with Slack, Discord, internal dashboards, or any system that accepts HTTP.

## Configuring webhooks

1. Go to **Settings > Webhooks** in the dashboard.
2. Click **Create Webhook**.
3. Enter the **URL** where AirBuild should send events.
4. Select the **events** you want to subscribe to.
5. Click **Create**.

A **webhook secret** is auto-generated for each webhook (format: `whsec_...`). Use this secret to verify that incoming requests are genuinely from AirBuild.

## Webhook secret

Each webhook has a unique secret prefixed with `whsec_`. You'll find it on the webhook detail page. Use it to verify the signature of incoming requests — see [Signature verification](#signature-verification) below.

> Keep the webhook secret secure. Anyone with the secret can forge valid webhook signatures.

## Supported events

| Event                          | Triggered when…                                  |
| ------------------------------ | ------------------------------------------------ |
| `build.uploaded`               | A new build is uploaded and processed.           |
| `build.deleted`                | A build is deleted.                              |
| `install_link.created`         | A new install link is created.                   |
| `install_link.revoked`         | An install link is revoked.                      |
| `install_link.expired`         | An install link expires.                         |
| `download.started`             | A tester starts downloading a build.             |
| `subscription.activated`       | A subscription is activated or upgraded.         |
| `subscription.canceled`        | A subscription is canceled.                      |
| `subscription.payment_failed`  | A subscription payment fails.                    |
| `invoice.paid`                 | An invoice is paid.                              |
| `member.invited`               | A team member is invited.                        |
| `member.removed`               | A team member is removed.                        |
| `support_ticket.created`       | A support ticket is created.                     |
| `support_ticket.responded`     | A support ticket receives a response.            |

## Payload structure

All webhook payloads are JSON with the following shape:

```json
{
  "event": "build.uploaded",
  "data": {
    "buildId": "clxxxxx",
    "appId": "clyyyyy",
    "version": "1.4.2",
    "buildNumber": "42",
    "platform": "ios"
  },
  "timestamp": 1718000000
}
```

| Field       | Type    | Description                          |
| ----------- | ------- | ------------------------------------ |
| `event`     | string  | The event name (e.g. `build.uploaded`). |
| `data`      | object  | Event-specific payload.              |
| `timestamp` | integer | Unix timestamp (seconds) of the event. |

## Signature verification

AirBuild signs every webhook request with **HMAC-SHA256**. The following headers are included:

| Header               | Description                                  |
| -------------------- | -------------------------------------------- |
| `webhook-id`         | Unique ID for the webhook delivery.          |
| `webhook-timestamp`  | Unix timestamp of the delivery.              |
| `webhook-signature`  | HMAC-SHA256 signature of the payload.        |

To verify the signature, compute the HMAC-SHA256 of the `timestamp + "." + body` string using your webhook secret, and compare it to the `webhook-signature` header.

### Example: Node.js

```javascript
import crypto from 'crypto';

function verifyWebhook(req, secret) {
  const timestamp = req.headers['webhook-timestamp'];
  const signature = req.headers['webhook-signature'];
  const body = req.rawBody; // raw request body as a Buffer/string

  const expected = crypto
    .createHmac('sha256', secret)
    .update(`${timestamp}.${body}`)
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(signature)
    );
  } catch {
    return false;
  }
}
```

### Example: Go

```go
import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

func VerifyWebhook(timestamp, body, signature, secret string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(fmt.Sprintf("%s.%s", timestamp, body)))
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}
```

## Delivery behavior

- **Timeout** — AirBuild waits up to **10 seconds** for a response. If your server doesn't respond in time, the delivery is marked as failed.
- **Response logged** — The HTTP status code and response body (truncated) are logged for each delivery.
- **Expected response** — Your endpoint should return a `2xx` status code to acknowledge receipt.

## Retry behavior

If a webhook delivery fails (non-2xx response or timeout), AirBuild retries with exponential backoff. Retries continue for up to 24 hours. You can view delivery history and manually retry failed deliveries from the webhook detail page.

## Next steps

- [API Reference](./api-reference/) — Manage webhooks via the API.
- [API Keys](./api-keys/) — Authenticate API requests.
- [CLI Tool](./cli/) — Automate uploads from CI/CD.
