require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { updateConfig } = require('./config/configManager');
const { runAutomation } = require('./core/automation');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.UI_PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── GET /api/config ──────────────────────────────────────────────────────────
// Returns current .env values so the UI can pre-populate its fields
app.get('/api/config', (req, res) => {
    res.json({
        PROJECT_TYPE:                         process.env.PROJECT_TYPE || 'icpr',
        WEBSITE_URL:                          process.env.WEBSITE_URL || '',
        PUPPETEER_HEADLESS:                   process.env.PUPPETEER_HEADLESS || 'false',
        PUPPETEER_START_MAXIMIZED:            process.env.PUPPETEER_START_MAXIMIZED || 'true',
        PUPPETEER_DEFAULT_VIEWPORT:           process.env.PUPPETEER_DEFAULT_VIEWPORT || 'null',
        USER_REGISTRATION_COUNT:              process.env.USER_REGISTRATION_COUNT || '1',
        MAX_RETRIES:                          process.env.MAX_RETRIES || '3',
        CARD_NUMBER:                          process.env.CARD_NUMBER || '',
        CARD_EXPIRY:                          process.env.CARD_EXPIRY || '',
        CARD_CVV:                             process.env.CARD_CVV || '',
        ENABLE_DISCOUNTED_FULL_FLOW:          process.env.ENABLE_DISCOUNTED_FULL_FLOW || 'false',
        ENABLE_PRO_ACCESS_FLOW:               process.env.ENABLE_PRO_ACCESS_FLOW || 'false',
        ENABLE_STANDARD_FLOW:                 process.env.ENABLE_STANDARD_FLOW || 'false',
        ENABLE_PAID_PLATFORM_ACCESS:          process.env.ENABLE_PAID_PLATFORM_ACCESS || 'false',
        ENABLE_FREE_PLATFORM_ACCESS:          process.env.ENABLE_FREE_PLATFORM_ACCESS || 'false',
        ENABLE_PAID_PLATFORM:                 process.env.ENABLE_PAID_PLATFORM || 'false',
        ENABLE_CREATE_REPORT:                 process.env.ENABLE_CREATE_REPORT || 'false',
        REPORT_COUNT:                         process.env.REPORT_COUNT || '1',
        UNLOCK_REPORT:                        process.env.UNLOCK_REPORT || 'false',
        DOWNLOAD_PDF:                         process.env.DOWNLOAD_PDF || 'false',
        HTML_PAGE_CREATION_FOR_USER_DETAILS:  process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS || 'false',
        OPEN_HTML_PAGES:                      process.env.OPEN_HTML_PAGES || 'false',
        BROWSER_CLOSE_ON_COMPLETION:          process.env.BROWSER_CLOSE_ON_COMPLETION || 'false',
        ENABLE_RECORDING:                     process.env.ENABLE_RECORDING || 'false',
        RECORDING_SAVE_PATH:                  process.env.RECORDING_SAVE_PATH || '',
        // External project HTML paths (for iframe embedding)
        ICPR_HTML_PATH:    process.env.ICPR_HTML_PATH || 'D:/autometa/public/index.html',
        TRACELO_HTML_PATH: process.env.TRACELO_HTML_PATH || 'D:/tracelo/public/index.html',
    });
});

// ─── POST /api/config-and-run ─────────────────────────────────────────────────
// Applies the submitted config to process.env, then launches automation
let automationRunning = false;

app.post('/api/config-and-run', async (req, res) => {
    if (automationRunning) {
        return res.status(409).json({ error: 'Automation is already running.' });
    }

    const config = req.body;

    // Always reset all flow flags first, then enable only the chosen one
    const allFlows = [
        'ENABLE_DISCOUNTED_FULL_FLOW',
        'ENABLE_PRO_ACCESS_FLOW',
        'ENABLE_STANDARD_FLOW',
        'ENABLE_PAID_PLATFORM_ACCESS',
        'ENABLE_FREE_PLATFORM_ACCESS',
        'ENABLE_PAID_PLATFORM',
    ];
    allFlows.forEach(f => { config[f] = 'false'; });
    if (config.activeFlow) {
        config[config.activeFlow] = 'true';
        delete config.activeFlow;
    }

    updateConfig(config);
    logger.info('Config updated via UI. Starting automation...');

    // Respond immediately so the UI doesn't hang
    res.json({ message: 'Automation started' });

    automationRunning = true;
    runAutomation()
        .then(() => logger.success('Automation completed.'))
        .catch(err => logger.error('Automation error', err.message))
        .finally(() => { automationRunning = false; });
});

// ─── GET /api/status ─────────────────────────────────────────────────────────
app.get('/api/status', (req, res) => {
    res.json({ running: automationRunning });
});

// ─── Serve users.html (generated credential report) ─────────────────────────
app.get('/users.html', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'users.html');
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('No credential report generated yet.');
    }
});

// ─── Start ───────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    logger.success(`UI Server running → http://localhost:${PORT}`);
});
