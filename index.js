require('dotenv').config();
const { startInteractiveCli } = require("./cli");
const logger = require("./utils/logger");


// Main execution logic
startInteractiveCli().catch(err => {
    logger.error('CLI Error', err);
    process.exit(1);
});
