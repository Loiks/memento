const puppeteer = require('puppeteer');
const fs = require('fs');
const yaml = require('js-yaml');
const sleep = require('util').promisify(setTimeout);

const utils = require('./lib/utils.js');
const config = require('./config.js')

async function downloadItemInDoulist(url, dir) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await gotoWithRetry(page, url);

    var totalPageStr = await page.$$eval('.thispage', (elements) => {
        return elements.map((val) => val.getAttribute('data-total-page'));
    });
    page.close();
    console.debug(totalPageStr);
    var totalPage = 0;
    if (totalPageStr.length > 0) {
        totalPage = Number(totalPageStr[0]);
    } else {
        totalPage = 1;
    }
    console.debug(`there are ${totalPage} page(s) in the doulist`);

    for (var i = 0; i < totalPage; ++i) {
        const newPage = await browser.newPage();
        await gotoWithRetry(newPage, `${url}?start=${25 * i}&sort=time&playable=0&sub_type=`);

        const links = await newPage.$$eval('div.doulist-item', (elements) => {
            // an ugly hack, link is always first <a> element in the div.doulist-item
            return elements.map((val) => val.getElementsByTagName('a')[0].href);
        });
        
        for (var j = 0; j < links.length; ++j) {
            const link = links[j];
            if (results[link] !== undefined && results[link]['downloaded']) {
                continue;
            }

            if (link.startsWith('https://www.douban.com/url/')) {
                // we need to redirect to external link from douban.com/url/
                // but douban.com/url/ is not available for headless visiting
                // TODO: login douban.com
                // console.debug(`will redirect to ${link}`);
                // const page2 = await browser.newPage();
                // await page2.goto(link);
                // const [targetLink, ..._] = await page.$$eval(
                //     'a[rel=nofollow]', (elements) => {
                //         return elements.map((val) => val.href);
                //     });
                // console.debug(`get real link: ${targetLink}`);
                // const result = utils.DownloadWebpagesWithRetry(targetLink, location);
                // results.push(result);
            } else {
                const result = await utils.DownloadWebpagesWithRetry(link, dir);
                results[result.url] = {
                    'title': result.title, 'downloaded': result.downloaded
                };
            }
        }
        await sleep(Math.floor(Math.random() * 1000) + 3);
    } 

    const resultsYAML = yaml.dump(results);
    fs.writeFileSync(config.DOULIST_OUTPUT_RESULT, resultsYAML);
    await browser.close();
}

async function gotoWithRetry(page, url) {
    for (var i = 0; i < config.RETRY_TIMES; ++i) {
        try {
            await page.goto(url, {
                waitUntil: 'networkidle2',
            });
            break;
        } catch (err) {
            console.error(
                `fail to open ${url} because ${err.message}, try ${i + 1} time...`
            );
            await sleep(Math.floor(Math.random() * 1000) + 10);
        }
    }
}

process.on('SIGINT', () => {
    // only works on *nix
    // TODO: supports windows
    console.log('Waiting for writing results into disk');

    const resultsYAML = yaml.dump(results);
    fs.writeFileSync(config.DOULIST_OUTPUT_RESULT, resultsYAML); 
    process.exit();
});

(async () => {
    if (!fs.existsSync(config.DOULIST_BACKUP)) {
        fs.mkdirSync(config.DOULIST_BACKUP);
    }
    if (fs.existsSync(config.DOULIST_OUTPUT_RESULT)) {
        results = yaml.safeLoad(fs.readFileSync(config.DOULIST_OUTPUT_RESULT, 'utf8'));
        if (results === undefined) {
            results = {};
        }
    } else {
        results = {};
    }
    if (!fs.existsSync(config.DOULIST_INPUT)) {
        console.error(
            'Cannot find the doulist file! Please create \'doulists.yaml\' and add the doulist links in it.'
        );
        process.exit(1);
    }

    var polling = false;
    if (process.argv.length > 2 && process.argv[2] == 'polling') {
        polling = true;
    } else if (process.argv.length > 2) {
        console.error('Wrong parameters.');
        process.exit(1);
    }

    const doulistURL = yaml.safeLoad(fs.readFileSync(config.DOULIST_INPUT, 'utf8'));
    if (doulistURL === null) {
        console.error('No doulist link in \'doulists.yaml\'.');
        process.exit(1);
    }

    do {
        for (var i = 0; i < doulistURL.length; ++i) {
            console.info(`begin to visit ${doulistURL[i]}`)
            await downloadItemInDoulist(doulistURL[i], config.DOULIST_BACKUP);
        }
        await sleep(Math.floor(Math.random() * 10000) + 1000 * 60 * 10);
    } while (polling);
})();
