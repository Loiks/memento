const fs = require('fs');
const yaml = require('js-yaml');

const config = require('./config.js');
const utils = require('./lib/utils.js');

async function extraLink(listFilePath) {
    const list = yaml.safeLoad(fs.readFileSync(listFilePath, 'utf8'));

    for (const articleType in list) {
        const firstLevelDir = `${config.WEBPAGES_BACKUP}/${articleType}`;
        if (!fs.existsSync(firstLevelDir)){
            fs.mkdirSync(firstLevelDir);
        }

        for (const publisher in list[articleType]) {
            const secondLevelDir = `${firstLevelDir}/${publisher}`;
            if (!fs.existsSync(secondLevelDir)) {
                fs.mkdirSync(secondLevelDir);
            }

            const articles = list[articleType][publisher]
            for (var i = 0, len = articles.length; i < len; ++i) {
                const value = articles[i];
                if (value.downloaded === false) {
                    const res = await utils.DownloadWebpagesWithRetry(
                        value.link,
                        secondLevelDir,
                        `${value.time}-${value.title}.mhtml`
                    );
                    list[articleType][publisher][i].downloaded = res.downloaded;
                }
            }
        }
    }

    const listYAML = yaml.dump(list);
    fs.writeFileSync(listFilePath, listYAML);
}

if (!fs.existsSync(config.WEBPAGES_BACKUP)){
    fs.mkdirSync(config.WEBPAGES_BACKUP);
}

extraLink('./webpage-list.yaml');
