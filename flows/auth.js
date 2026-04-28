const logger = require("../utils/logger");
const delay = require("../utils/delay");

async function logout(page) {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();
    
    try {
        await page.waitForSelector(".ant-dropdown-trigger", { visible: true, timeout: 15000 });
        await delay(process.env.COMMON_DELAY_ONCLICKS || 1000);
        await page.click(".ant-dropdown-trigger");

        await delay(process.env.COMMON_DELAY_ONCLICKS || 1000);

        if (projectType === 'tracelo') {
            const inputs = await page.$$('.ant-dropdown-menu-title-content');
            if (inputs && inputs[2]) {
                await inputs[2].click();
                logger.success("Tracelo Logout success");
            } else {
                logger.error("Tracelo logout option not found at index 2");
            }
        } else {
            const inputs = await page.$$('.mobile_menu_option');
            if (inputs && inputs[5]) {
                await inputs[5].click();
                logger.success("ICPR Logout success");
            } else {
                logger.error("ICPR logout option not found at index 5");
            }
        }

        await page.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(() => {
            logger.info("Navigation timeout after logout, might be already logged out or redirected.");
        });

    } catch (error) {
        logger.error(`Logout failed: ${error.message}`);
    }
}

module.exports = { logout };
