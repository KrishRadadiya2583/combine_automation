
const logger = require("../utils/logger");
const { handlePayment } = require("./payment");
const { appendUser } = require("../services/fileService");
const delay = require("../utils/delay");
const { searchmobileno } = require("../helper/searchmobileno");
const { useremailtype } = require("../helper/useremailtype");
const { free_platform_access } = require("../helper/free_platform_access");
const { reportEmailFetcher } = require("./reportemailfetcher");
const { fillBillingInfo } = require("../helper/fillbillinginfo");
const { submitreview } = require("../helper/submitreview");


const users = [];
async function registerusers(page) {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();

    // mobil number search & submit
    const mobile = await searchmobileno(page);
    logger.data("Mobile typed", mobile)

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    // email type & submit
    const email = await useremailtype(page);
    await delay(process.env.COMMON_DELAY_ONCLICKS)

    // project specific helper calls
    if (projectType === 'icpr' && process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        await delay(4000)
        await free_platform_access(page);
        logger.success("Free platform access successful");
        await delay(4000)
    }

    logger.process("Waiting for payment page...");
    logger.success("User register successful");

    if (projectType === 'icpr' && process.env.ENABLE_PAID_PLATFORM === "true") {
        await delay(10000)
        page = await reportEmailFetcher(page, email) || page;
        logger.success("report email fetch success & open report")
        await delay(5000)
        logger.process("looking for 'See Now' button")
    }

    // Unified Payment Flow
    if (projectType === 'tracelo' || process.env.ENABLE_PAID_PLATFORM != "true") {
        await handlePayment(page);
        await delay(process.env.COMMON_DELAY_ONCLICKS);
    }

    // Tracelo Specific Post-Payment Steps
    if (projectType === 'tracelo') {
        await fillBillingInfo(page, logger);
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        
        await submitreview(page);
        await delay(process.env.COMMON_DELAY_ONCLICKS);
    }

    appendUser(email);
    return page;
}

module.exports = { registerusers };


