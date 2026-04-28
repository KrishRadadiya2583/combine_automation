# Unified Automation Framework

A centralized browser automation engine designed for **ICPR** and **Tracelo** platforms. Built with Node.js and Puppeteer, this framework handles complex user registration, payment processing, and reporting workflows with intelligent retry logic and dynamic XPath configuration.

## Features

- **Dual-Project Support** -- Seamlessly switch between ICPR and Tracelo automation.
- **Dynamic XPath Injection** -- Selectors are decoupled from logic and loaded dynamically based on project type.
- **Advanced Retry Engine** -- Automatically recovers from failures with configurable retry limits and browser session resets.
- **Modular Architecture** -- Clean separation of flows, helpers, and configuration.
- **Payment Integration** -- Robust handling of iframe-based payment fields across different UI layouts.
- **Evidence & Reporting** -- Automated screen recording, report generation, and PDF downloads.
- **Hybrid Dashboard** -- Execute via a premium Web UI or a fully interactive CLI.

## Prerequisites

- **Node.js** 18 or higher
- **pnpm** (or npm/yarn)
- ~500MB disk space for Chromium (managed by Puppeteer)

## Quick Start

1. **Clone and Install**
   ```bash
   git clone <repo-url>
   cd combined-automation
   pnpm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   *Note: You can also configure everything directly via the Web Dashboard or CLI.*

3. **Launch Automation**
   - **Interactive CLI**: `pnpm start`

## Project Selection

The framework uses a `PROJECT_TYPE` variable (`icpr` or `tracelo`) to determine which configuration and XPaths to load.

- **ICPR**: Focuses on deep reporting, PDF downloads, and credential page generation.
- **Tracelo**: Focuses on streamlined registration with billing info entry and user reviews.

## Configuration Matrix

| Variable | Description | Default |
|----------|-------------|---------|
| `PROJECT_TYPE` | `icpr` or `tracelo` | `icpr` |
| `WEBSITE_URL` | Target environment URL | *(Project Dependent)* |
| `CARD_NUMBER` | 16-digit payment card | *(required)* |
| `PUPPETEER_HEADLESS`| Run in background | `false` |
| `MAX_RETRIES` | Max attempts per user | `3` |

## Architecture Overview

```
combined_automation/
├── config/
│   ├── icpr_xpaths.json      # ICPR Selectors
│   ├── tracelo_xpaths.json   # Tracelo Selectors
│   ├── configLoader.js       # Dynamic Selector Loader
│   └── puppeteer.js          # Browser Configuration
├── core/
│   └── automation.js         # Main Execution Engine
├── flows/
│   ├── registration.js       # Unified Registration Logic
│   ├── payment.js            # Unified Payment Logic
│   └── navigation.js         # Project-Agnostic Routing
├── helper/
│   ├── searchmobileno.js     # Unified Mobile Input
│   ├── fillbillinginfo.js    # Tracelo-Specific Billing
│   └── recording.js          # Screen Recording Service
├── public/                   # Dashboard & Result Pages
├── utils/                    # Shared Utilities (Logger, Generator)
├── cli.js                    # Interactive CLI Entry
└── index.js                  # Web Dashboard Entry
```

## Development

Run in development mode with auto-reload:
```bash
npm run dev
```

### Adding New Selectors
To update a selector, simply modify the corresponding JSON in the `config/` directory. No code changes required!

## Troubleshooting

- **Selector Issues**: Check `config/*_xpaths.json` to ensure XPaths match the latest site UI.
- **Connection Failures**: Ensure your `WEBSITE_URL` is accessible and Cloudflare headers are set if needed.
- **Payment Failures**: Tracelo uses an `evaluate` approach for payment fields; ensure `COMMON_DELAY_ONCLICKS` allows enough time for iframes to load.

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm start` | Launch the web dashboard and start the automation UI |
| `pnpm run cli` | Run automation directly from the CLI without the dashboard |
| `pnpm dev` | Run with auto-reload (nodemon) |
| `pnpm install` | Install dependencies + download Chromium |
