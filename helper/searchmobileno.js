const { randomMobile } = require("../utils/generator");
const delay = require("../utils/delay");
const logger = require("../utils/logger");
const { getXpaths } = require("../config/configLoader");

async function searchmobileno(page) {
    const xpaths = getXpaths();
    const mobile = randomMobile();
    logger.data("Mobile", mobile);

    await page.waitForSelector(xpaths.search.phone_input, { visible: true });
    await page.type(xpaths.search.phone_input, mobile, { delay: 50 });

    // ===== STEP 2: SEARCH =====
    if (process.env.ENABLE_DISCOUNTED_FULL_FLOW === "true" || process.env.ENABLE_STANDARD_FLOW === "true") {
        await Promise.all([
            page.waitForNavigation(),
            page.click(xpaths.search.submit_btn)
        ]);
        logger.success("Search submitted");
    }
    else {
        await delay(500)
        await page.waitForSelector(xpaths.search.alternate_submit, { visible: true });
        await delay(500)
        await page.click(xpaths.search.alternate_submit);
        logger.success("Search submitted");
    }


    return mobile;
}

module.exports = { searchmobileno };