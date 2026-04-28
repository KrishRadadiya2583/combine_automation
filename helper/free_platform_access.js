const delay = require("../utils/delay");
const { getXpaths } = require("../config/configLoader");

async function free_platform_access(page) {
    const xpaths = getXpaths();
    await page.goBack();
    await delay(2000)

    await page.goBack();

    await delay(2000)

    await page.waitForSelector(xpaths.free_access.location_btn, { visible: true, timeout: 60000 })
    await delay(2000)
    await page.click(xpaths.free_access.location_btn, { clickCount: 10 })

}

module.exports = { free_platform_access };