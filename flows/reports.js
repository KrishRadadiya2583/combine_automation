const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { randomMobile } = require("../utils/generator");
const { getXpaths } = require("../config/configLoader");

async function generateReportsAndUnlock(page) {
    const xpaths = getXpaths();
    const reportsXpath = xpaths.reports;

    if (!reportsXpath) {
        logger.warn("Reports XPaths not found in configuration, skipping generation");
        return;
    }

    for (let i = 1; i <= process.env.REPORT_COUNT; i++) {
        if (process.env.ENABLE_CREATE_REPORT != "true") {
            logger.warn("report generation skipped");
            break;
        }
        else {
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector(reportsXpath.search_other_btn, { visible: true, timeout: 30000 });
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.click(reportsXpath.search_other_btn);

            logger.process("generate new report button click success");

            // input number for new report
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector(reportsXpath.number_input, { visible: true });
            await delay(process.env.COMMON_DELAY_ONCLICKS);

            await page.type(reportsXpath.number_input, randomMobile(), { delay: 50 });

            logger.process("number enter success");

            // click on submit
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.waitForSelector(reportsXpath.submit_btn, { visible: true });
            await delay(process.env.COMMON_DELAY_ONCLICKS);
            await page.click(reportsXpath.submit_btn);

            logger.process("submit button click success");

            await page.waitForSelector(reportsXpath.search_other_btn, { visible: true, timeout: 60000 });
            logger.success("report " + i + " generate  successfull");
            await delay(500);
        }
    }

    if (process.env.UNLOCK_REPORT == "true") {
        // unlock latest report 
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.waitForSelector(reportsXpath.unlock_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(reportsXpath.unlock_btn);

        // again click on unlock report
        await page.waitForSelector(reportsXpath.confirm_unlock_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(reportsXpath.confirm_unlock_btn);

        // Play sound for unlock
        process.stdout.write('\x07');

        logger.success("unlock latest report success");

        // Always open the report
        logger.success("report open successfull");

        // close info page
        await page.waitForSelector(reportsXpath.close_info_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(reportsXpath.close_info_btn);

        logger.process("info page close success");

        // view report
        await page.waitForSelector(reportsXpath.view_report_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(reportsXpath.view_report_btn);

        logger.success("view report success");

    }
}

module.exports = { generateReportsAndUnlock };
