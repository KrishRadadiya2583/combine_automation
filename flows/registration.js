
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
const { fetchPassword } = require("../flows/yopmailpasswordfetcher");
const { cloudAccess } = require("../helper/cloud_access");
const { generateHTML } = require("../flows/htmlgenerator");

const users = [];
async function registerusers(page) {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();

    // mobil number search & submit
    const mobile = await searchmobileno(page);
    logger.data("Mobile typed successfully", mobile)

    await delay(process.env.COMMON_DELAY_ONCLICKS)

    // email type & submit
    const email = await useremailtype(page);
    await delay(process.env.COMMON_DELAY_ONCLICKS)

    logger.data("Email typed successfully", email);

    // project specific helper calls
    if (projectType === 'icpr' && process.env.ENABLE_FREE_PLATFORM_ACCESS === "true") {
        logger.process("Granting free platform access... of icpr project");
        await delay(4000)
        await free_platform_access(page);
        logger.success("Free platform access successful for icpr project");
        await delay(4000)
    }

    logger.process("Waiting for payment page...");
   

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


if(projectType === 'icpr' ){
     if (process.env.HTML_PAGE_CREATION_FOR_USER_DETAILS === "true") {
        logger.step("Fetching password for " + email + " STARTED");

        await delay(process.env.COMMON_DELAY_ONCLICKS); // wait for file write
        const result = await fetchPassword(page, email);

        await delay(process.env.COMMON_DELAY_ONCLICKS);

        logger.step("Fetching password for " + email + " COMPLETED");
        logger.data("Result", result);

        users.push({ email: email, password: result });

        await delay(1000)


        if (users.length == parseInt(process.env.USER_REGISTRATION_COUNT)) {
            logger.process("Generating HTML report for all users...");
            logger.data("Users to include in report", users.length);
            const htmlFilePath = await generateHTML(users);

            if (process.env.OPEN_HTML_PAGES === "true") {
                logger.process("Opening HTML page...");
                try {

                    await page.goto(`file://${htmlFilePath}`, {
                        waitUntil: 'load',
                    });

                    await page.waitForSelector("#fetch-token", { visible: true, timeout: 10000 });
                    await page.click("#fetch-token");


                      
                    await page.waitForSelector("#login-btn", { visible: true, timeout: 10000 });
                    const loginUrl = await page.$eval("#login-btn a", el => el.href);
                    console.log(loginUrl)
                    
                    const newPage = await page.browser().newPage();

                    await cloudAccess(newPage);
                    await newPage.goto(loginUrl);
                    
                    await delay(2000)

                } catch (err) {
                    logger.error("Failed to open HTML page", err);
                }
            }
        }

    }
   
}
  logger.success("User register successful");
    appendUser(email);
    
    return page;
}

module.exports = { registerusers };


