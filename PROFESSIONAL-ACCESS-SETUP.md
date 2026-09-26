# DPPTool Professional Access — Operator Guide

## Current model

- Free: users access the public tools directly.
- Professional: €49/year, unlocked with a signed Access Key.
- Enterprise: custom implementation.

Professional V1 does not require a traditional user-account backend.

## Critical security rule

Never upload the Professional private signing key to GitHub, Cloudflare Pages, the website, email templates, or JavaScript.

The website contains only the public verification key.

## Issue a Professional key manually

On a computer with Node.js installed:

```
node scripts/issue-professional-license.mjs CUSTOMER_EMAIL YYYY-MM-DD PATH_TO_PRIVATE_KEY
```

Example:

```
node scripts/issue-professional-license.mjs buyer@example.com 2027-09-26 C:\secure\dpptool-professional-private-key.pem
```

The command prints a key beginning with:

```
DPP1.
```

Send the customer:
1. Their Professional Access Key.
2. Their expiry date.
3. https://dpptool.com/professional-access/

They must enter the same email used when the key was issued.

## Customer access flow

1. Customer pays.
2. Operator confirms payment.
3. Operator issues a signed key.
4. Customer opens /professional-access/.
5. Customer enters payment email + key.
6. Browser verifies signature and expiry.
7. Professional access is stored in localStorage for that browser.

The same key can be entered again on another browser.

## What this avoids

- No password database.
- No user table.
- No login server.
- No shared Professional password in JavaScript.

## Limitation

A signed browser-side license is suitable for gating static Professional pages and browser tools, but it cannot securely protect server-side secrets or paid API consumption. If DPPTool later adds paid APIs, hosted private data, or server-side report generation, use a small authenticated serverless layer.

## Future automation

Later the manual payment-confirmation step can be replaced with:

Payment provider → webhook/serverless function → signed key generation → automatic email delivery.

The current static site and Professional keys can remain compatible with that upgrade.
