require('dotenv').config();
const logger = require('./utils/logger');
const open = require('open').default;

const isCliMode = process.env.ENABLE_CLI_MODE === 'true';

if (isCliMode) {
    // ── CLI Mode ─────────────────────────────────────────────────────────────
    logger.header('Running in CLI Mode (ENABLE_CLI_MODE=true)');
    const { startInteractiveCli } = require('./cli');
    startInteractiveCli().catch(err => {
        logger.error('CLI Error', err.message);
        process.exit(1);
    });

} else {
    // ── UI Mode ──────────────────────────────────────────────────────────────
    logger.header('Running in UI Mode (ENABLE_CLI_MODE=false)');
    require('./server');

    // Auto-open browser after a short delay to let the server bind
    setTimeout(() => {
    
        const port = process.env.UI_PORT || 3000;
        open(`http://localhost:${port}`).catch(() => {
            logger.warn('Could not auto-open browser. Navigate to http://localhost:' + port);
        });
    }, 1200);
}