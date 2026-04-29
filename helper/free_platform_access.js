const delay = require("../utils/delay");
const { getXpaths } = require("../config/configLoader");
const logger = require("../utils/logger");

async function free_platform_access(page) {
    const xpaths = getXpaths();
    await page.goBack();
    await delay(2000)

    logger.process("navigate back 1st time to trigger free platform access");

    await page.goBack();

    await delay(2000)

    logger.process("waiting for free platform access location button");
    await page.waitForSelector(xpaths.free_access.location_btn, { visible: true, timeout: 60000 })
    await delay(2000)
    await page.click(xpaths.free_access.location_btn, { clickCount: 10 })
    logger.process("clicked on free platform access location button")

}

module.exports = { free_platform_access };
