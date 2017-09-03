const cheerio = require('cheerio');
const fetch = require('node-fetch');

const computer = require('./computer.json');

function parsePrice(text) {
    const re = /\d+,\d{2}/;
    return re.exec(text);
}


async function getPrice(prodId) {
    const url = `https://m.alternate.de/mobile/details.xhtml?p=${prodId}`;
    const resp = await fetch(url);
    const html = await resp.text();
    const $ = cheerio.load(html);
    const elem = $('.price');
    const priceText = elem.text();
    const price = parsePrice(priceText);
    return price[0];
}


function iterate(obj, action) {
    for(let key in obj) {
        if (obj.hasOwnProperty(key)) {
            action(key, obj[key]);
        }
    }
}

async function computePrice(computer) {
    iterate(computer, (part, prodId) => {
        getPrice(prodId).then(price => {
            console.log(`${part}: ${price}`);
        })
    });
}

computePrice(computer);