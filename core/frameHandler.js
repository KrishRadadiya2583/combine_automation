const delay = require("../utils/delay");
const logger = require("../utils/logger");

async function findIcprPaymentFrame(page) {
    const selector = 'iframe#solid-payment-form-iframe, iframe[name="solid-payment-form-iframe"]';
    const start = Date.now();

    while (Date.now() - start < 60000) {
        try {
            const elementHandle = await page.$(selector);
            if (elementHandle) {
                const frame = await elementHandle.contentFrame();
                if (frame) return frame;
            }
        } catch (e) {
            // ignore errors and retry
        }
        await delay(500);
    }
    throw new Error("ICPR Payment iframe not found");
}

async function findTraceloPaymentFrame(page) {
    const start = Date.now();

    while (Date.now() - start < 60000) {
        const frames = page.frames();

        for (const frame of frames) {
            const url = frame.url() || "";
            if (!url) continue;

            if (url.includes('stripe.com') || url.includes('elements-inner') || url.includes('solid-payment-form') || url.includes('payment')) {
                try {
                    if (await frame.$('#payment-numberInput')) {
                        logger.process(`Stripe payment frame found: ${url}`);
                        return frame;
                    }
                } catch (err) {
                    // ignore cross-origin or timing issues
                }
            }
        }

        for (const frame of frames) {
            try {
                if (await frame.$('#payment-numberInput')) {
                    logger.process(`Payment frame found by selector in url: ${frame.url()}`);
                    return frame;
                }
            } catch (err) {
                // ignore
            }
        }

        await delay(500);
    }

    throw new Error("Tracelo Payment frame not found");
}

async function findPaymentFrame(page) {
    const projectType = (process.env.PROJECT_TYPE || 'icpr').toLowerCase();
    
    if (projectType === 'tracelo') {
        return await findTraceloPaymentFrame(page);
    } else {
        return await findIcprPaymentFrame(page);
    }
}

module.exports = { findPaymentFrame };
