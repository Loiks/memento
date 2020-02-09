const puppeteer = require('puppeteer');
const fs = require('fs');
const config = require('./config.js');
const sleep = require('util').promisify(setTimeout);

// https://stackoverflow.com/questions/51529332/puppeteer-scroll-down-until-you-cant-anymore
async function autoScroll(page) {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            var totalHeight = 0;
            var distance = 100;
            var timer = setInterval(() => {
                var scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
}

async function DownloadWebpages(url, location, title) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto(url, {
        waitUntil: 'networkidle2',
    });

    if (title === undefined) {
        title = await page.title();
        title = title.replace(/\//g, '');
    }

    // remove the ui overlay mask on douban.com.
    await page.$eval(
        'html', element => element.setAttribute('class', 'ua-mac ua-webkit')
    );
    await page.$eval(
        '.ui-overlay-mask', element => element.setAttribute('style', 'display:none;')
    ).catch(_ => { });

    // remove reading full article button 
    // and show full article on douban.com/note and douban.com/review.
    await page.$eval(
        '.taboola-hide-container', element => {
            element.removeChild(element.lastChild);
            element.removeChild(element.lastChild);
        }
    ).catch(_ => {});

    // some page use lazy loading, 
    // so scroll the page to the end to finishing loading.
    await autoScroll(page);

    const cdp = await page.target().createCDPSession();
    const { data } = await cdp.send('Page.captureSnapshot', { format: 'mhtml' });
    const now = new Date();
    const nowStr = `${now.getUTCSeconds() + 1}`.padStart(2, '0')
        + `${now.getUTCMinutes() + 1}`.padStart(2, '0')
        + `${now.getUTCHours() + 1}`.padStart(2, '0')
        + `${now.getUTCDate() + 1}`.padStart(2, '0')
        + `${now.getUTCMonth() + 1}`.padStart(2, '0');
    fs.writeFileSync(
        `${location}/${title}-snapshot-${nowStr}.mhtml`,
        data
    );
    console.info(`downloaded ${location}/${title}`);

    await browser.close();
    return title;
}

async function DownloadWebpagesWithRetry(url, location, title) {
    var downloaded = false;

    console.debug(url);

    for (var i = 0; i < config.RETRY_TIMES; ++i) {
        try {
            title = await DownloadWebpages(url, location, title);
            downloaded = true;
            break;
        } catch (err) {
            // some douban neighbors use invalid characters which will make io fail.
            if (err.code === 'EILSEQ') {
                title = '无法识别id';
            }
            console.error(
                `fail to downloaded ${url} because ${err.message}, try ${i + 1} time...`
            );
            await sleep(Math.floor(Math.random() * 1000) + 10);
        }
    }
    await sleep(Math.floor(Math.random() * 1000) + 10);
    return {'url': url, 'title': title, 'downloaded': downloaded};
}


module.exports.DownloadWebpages = DownloadWebpages;
module.exports.DownloadWebpagesWithRetry = DownloadWebpagesWithRetry;