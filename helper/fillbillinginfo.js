const delay = require("../utils/delay");
const { getXpaths } = require("../config/configLoader");

function randomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function fillBillingInfo(page, logger) {
    const xpaths = getXpaths();
    if (!xpaths.billing) return; // Only for Tracelo usually

    const firstName = randomFromArray(['Amit', 'Rahul', 'John', 'David']);
    const lastName  = randomFromArray(['Patel', 'Sharma', 'Smith', 'Brown']);
    const address   = `${randomNumber(10,999)} Main Street`;
    const city      = randomFromArray(['Mumbai', 'Delhi', 'Ahmedabad']);
    const zipcode   = randomNumber(100000, 999999).toString();

      logger.info("Filling billing information with random data: "+ JSON.stringify({firstName, lastName, address, city, zipcode}))
    // FIRST NAME
    await page.waitForSelector(xpaths.billing.first_name, { visible: true });
  
    await page.type(xpaths.billing.first_name, firstName, { delay: 50 });

    // LAST NAME
    await page.waitForSelector(xpaths.billing.last_name, { visible: true });

    await page.type(xpaths.billing.last_name, lastName, { delay: 50 });

    // ADDRESS
    await page.waitForSelector(xpaths.billing.address, { visible: true });
    await page.type(xpaths.billing.address, address, { delay: 50 });

    // CITY
    await page.waitForSelector(xpaths.billing.city, { visible: true });
    await page.type(xpaths.billing.city, city, { delay: 50 });

    // ZIPCODE
    await page.waitForSelector(xpaths.billing.zipcode, { visible: true });
    await page.type(xpaths.billing.zipcode, zipcode, { delay: 50 });

    // SAVE BUTTON
    await page.waitForSelector(xpaths.billing.save_btn, { visible: true });
    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await page.click(xpaths.billing.save_btn);
    await delay(process.env.COMMON_DELAY_ONCLICKS);


    logger?.info("Billing form filled SUCCESSFULLY with random data");
}

module.exports = { fillBillingInfo };
