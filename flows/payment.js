const logger = require("../utils/logger");
const delay = require("../utils/delay");
const { findPaymentFrame } = require("../core/frameHandler");
const { submitreview } = require("../helper/submitreview");
const { getXpaths } = require("../config/configLoader");

async function handleIcprPayment(page) {
    const xpaths = getXpaths();
    logger.process("Waiting for payment iframe...");
    await page.waitForSelector(xpaths.payment.iframe, { visible: true, timeout: 60000 });

    const frame = await findPaymentFrame(page);

    await page.waitForSelector(xpaths.payment.solid_iframe, { visible: true, timeout: 60000 });

    await delay(3000);

    logger.success("Payment frame found");
    logger.process("card details fill start");

    const cardNumber = (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") 
        ? process.env.PAID_VISA_CARD_NUMBER 
        : (process.env.CARD_NUMBER || "4242424242424242");
    const cardExpiry = process.env.CARD_EXPIRY || "12/34";
    const cardCvv = process.env.CARD_CVV || "123";

    await frame.waitForSelector(xpaths.payment.card_number, { visible: true, timeout: 30000 });
    await frame.click(xpaths.payment.card_number, { clickCount: 3 });
    logger.process("card number typing started.");
    
    if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        await frame.type(xpaths.payment.card_number, cardNumber, { delay: 5 });
        logger.info("using paid visa card")
    } else {
        await frame.type(xpaths.payment.card_number, cardNumber, { delay: 10 });
        logger.info("using normal card")
    }
    logger.process("card number typing completed.");

    // Expiry
    await frame.waitForSelector(xpaths.payment.card_expiry, { visible: true, timeout: 30000 });
    await frame.click(xpaths.payment.card_expiry);
    logger.process("card expiry typing started.");
    await frame.type(xpaths.payment.card_expiry, cardExpiry, { delay: 5 });
    logger.process("card expiry typing completed.");

    // CVV
    await frame.waitForSelector(xpaths.payment.card_cvv, { visible: true, timeout: 30000 });
    await frame.click(xpaths.payment.card_cvv);
    logger.process("card cvv typing started.");
    await frame.type(xpaths.payment.card_cvv, cardCvv, { delay: 5 });
    logger.process("card cvv typing completed.");

    await delay(1000);
    logger.success("Card details filled");

    if (process.env.ENABLE_PAID_PLATFORM_ACCESS === "true") {
        await frame.waitForSelector(xpaths.payment.zip_code, { visible: true, timeout: 30000 });
        await frame.click(xpaths.payment.zip_code);
        logger.process("card zipcode typing started.");
        await frame.type(xpaths.payment.zip_code, "21220", { delay: 5 });
        await delay(process.env.COMMON_DELAY_ONCLICKS);
        logger.process("card zipcode typing completed.");
    }

    // Submit card details
    const submitElement = await frame.$(xpaths.payment.submit_btn);
    if (submitElement) {
        await submitElement.click();
    } else {
        await page.waitForSelector(xpaths.payment.submit_btn, { visible: true });
        await page.click(xpaths.payment.submit_btn);
    }

    // click on continue to open dashboard
    await delay(process.env.COMMON_DELAY_ONCLICKS);

    if (process.env.ENABLE_FREE_PLATFORM_ACCESS != "true" && process.env.ENABLE_PAID_PLATFORM != "true") {
        try {
            await page.waitForSelector(xpaths.payment.continue_btn, { visible: true, timeout: 20000 });
            const continueBtn = await page.$(xpaths.payment.continue_btn);
            if (continueBtn) {
                await continueBtn.click();
                logger.success("Continue button clicked");
            } else {
                logger.warn("Continue button not found by selector, attempting evaluate click");
                await page.evaluate((selector) => {
                    const btn = document.querySelector(selector);
                    if (btn) btn.click();
                }, xpaths.payment.continue_btn);
            }
        } catch (error) {
            logger.error(`Failed to click continue button: ${error.message}`);
        }
    }

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    logger.success("dashboard load successfull");

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    await submitreview(page);

    logger.success("Payment Done");
}

async function handleTraceloPayment(page) {
    const xpaths = getXpaths();
    logger.process("Waiting for payment iframe...");
    
    const frame = await findPaymentFrame(page);

    await delay(3000);
    logger.success("Payment frame found");

    logger.process("card details fill start");

    const cardNumber = "4242424242424242";
    logger.info(`Forcing card number for Tracelo: ${cardNumber}`);


    const cardExpiry = process.env.CARD_EXPIRY || "12/34";
    const cardCvv = process.env.CARD_CVV || "123";

    await frame.waitForSelector(xpaths.payment.card_number, { visible: true, timeout: 30000 });
    await frame.evaluate((selector, value) => {
        const input = document.querySelector(selector);
        if (!input) throw new Error(`Card number input not found: ${selector}`);
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, xpaths.payment.card_number, cardNumber);
    logger.process("card number set.");

    await frame.waitForSelector(xpaths.payment.card_expiry, { visible: true, timeout: 30000 });
    await frame.evaluate((selector, value) => {
        const input = document.querySelector(selector);
        if (!input) throw new Error(`Expiry input not found: ${selector}`);
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, xpaths.payment.card_expiry, cardExpiry);
    logger.process("card expiry set.");

    await frame.waitForSelector(xpaths.payment.card_cvv, { visible: true, timeout: 30000 });
    await frame.evaluate((selector, value) => {
        const input = document.querySelector(selector);
        if (!input) throw new Error(`CVC input not found: ${selector}`);
        input.focus();
        input.value = value;
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    }, xpaths.payment.card_cvv, cardCvv);
    await page.keyboard.press("Tab");
    logger.process("card cvv set.");


    await delay(1000);
    logger.success("Card details filled");

    // Submit card details
    const submitElement = await frame.$(xpaths.payment.submit_btn);
    if (submitElement) {
        await submitElement.click();
    } else {
        await page.waitForSelector(xpaths.payment.submit_btn, { visible: true });
        await page.click(xpaths.payment.submit_btn);
    }

    // click on continue to open dashboard
    await delay(2000);

    try {
        await page.waitForSelector(xpaths.payment.continue_btn, { visible: true, timeout: 20000 });
        const continueBtn = await page.$(xpaths.payment.continue_btn);
        if (continueBtn) {
            await continueBtn.click();
            logger.success("Continue button clicked");
        } else {
            logger.warn("Continue button not found by selector, attempting evaluate click");
            await page.evaluate((selector) => {
                const btn = document.querySelector(selector);
                if (btn) btn.click();
            }, xpaths.payment.continue_btn);
        }
    } catch (error) {
        logger.error(`Failed to click continue button: ${error.message}`);
        // Attempt one last time with a broader selector or just log it
    }

    await delay(process.env.COMMON_DELAY_ONCLICKS || 2000);
    logger.success("dashboard load successfull");

    await delay(process.env.COMMON_DELAY_ONCLICKS);
    
    logger.success("Payment Done");
}


async function handlePayment(page) {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();
    
    if (projectType === 'tracelo') {
        return await handleTraceloPayment(page);
    } else {
        return await handleIcprPayment(page);
    }
}

module.exports = { handlePayment };


