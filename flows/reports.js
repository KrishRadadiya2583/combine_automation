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


logger.process("Waiting for input...");

await page.waitForSelector(reportsXpath.number_input, { visible: true , timeout: 10000 });

await delay(500)
// pick correct input (important if multiple exist)
const input = (await page.$$(reportsXpath.number_input))[2]; // change index if needed


await input.click(); // focus
await input.evaluate(el => el.value = ''); // clear

const mobile = randomMobile();
logger.process("Typing: " + mobile);

await delay(process.env.COMMON_DELAY_ONCLICKS)
// type directly into element (not keyboard)
await input.type(mobile, { delay: 5 });

logger.success("Number entered");

await delay(process.env.COMMON_DELAY_ONCLICKS);

// submit
await page.waitForSelector(reportsXpath.submit_btn, { visible: true });

logger.process("Click submit");
await page.click(reportsXpath.submit_btn);


            await page.waitForSelector(reportsXpath.search_other_btn, { visible: true, timeout: 60000 });
            logger.success("report " + i + " generate  successfull for user ");
            await delay(500);
        }
    }

    if (process.env.UNLOCK_REPORT == "true") {
        // unlock latest report 
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.waitForSelector(reportsXpath.unlock_btn, { visible: true });
            logger.process("clicking on unlock button for latest report");
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        await page.click(reportsXpath.unlock_btn);
        logger.process("unlock button clicked for latest report");

        // again click on unlock report
        await page.waitForSelector(reportsXpath.confirm_unlock_btn, { visible: true });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        logger.process("clicking on confirm unlock button for latest report");
        await page.click(reportsXpath.confirm_unlock_btn);

        // Play sound for unlock
        process.stdout.write('\x07');

        logger.success("unlock latest report success");

        // Always open the report
        logger.success("report open successfull");

        // close info page
        await page.waitForSelector(reportsXpath.close_info_btn, { visible: true });
        logger.process("closing info page");
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
