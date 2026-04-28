const { randomEmail } = require("../utils/generator");
const delay = require("../utils/delay");
const logger = require("../utils/logger");
const { getXpaths } = require("../config/configLoader");

async function useremailtype(page) {
    const xpaths = getXpaths();
    await page.waitForSelector(xpaths.auth.email_input, { visible: true });
    const email = randomEmail();
    logger.data("Email", email);
    await page.type(xpaths.auth.email_input, email, { delay: 50 });
    
    // ===== STEP 4: REGISTER =====
    if ((process.env.PROJECT_TYPE || 'icpr').toLowerCase() === 'tracelo') {
        await delay(process.env.COMMON_DELAY_ONCLICKS);
    }
    
    await page.click(xpaths.auth.register_btn);


    return email;
}

module.exports = { useremailtype };