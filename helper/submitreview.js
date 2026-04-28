const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { getXpaths } = require("../config/configLoader");

async function submitreview(page) {
    const xpaths = getXpaths();
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();

    // submit review default 4 star
    if (projectType === 'tracelo') await delay(3000);
    
    await page.waitForSelector(xpaths.review.star, { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(xpaths.review.star);

    logger.success("review submit success");

    //  close review modal
    await page.waitForSelector(xpaths.review.close_btn, { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(xpaths.review.close_btn);

    logger.success("review close button click success");

    if (projectType === 'icpr') {
        // close report modal - using close_btn as close_btn_x was removed in the CSS conversion
        await page.waitForSelector(xpaths.review.close_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(xpaths.review.close_btn);
        logger.success("report close button click success");
    } else {

        // close modal
        await delay(2000);
        await page.keyboard.press('Escape');
        await delay(process.env.COMMON_DELAY_ONCLICKS);
    }
}

module.exports = { submitreview };