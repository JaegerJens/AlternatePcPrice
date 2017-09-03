const cheerio = require('cheerio');
const fetch = require('node-fetch');

const computer = require('./computer.json');

async function getProductDetails(prodId) {
    const url = `https://m.alternate.de/mobile/details.xhtml?p=${prodId}`;
    const resp = await fetch(url);
    const html = await resp.text();
    const $ = cheerio.load(html);
    return $;
}

function parsePrice(text) {
    const re = /^\D*(\d+),(\d{2})[\s\S]*/;
    let val = text.replace(re, "$1.$2");
    return new Number(val);
}

function getPrice($) {
    const elem = $('.price');
    const priceText = elem.text();
    const price = parsePrice(priceText);
    return price;
}

function getProductName($) {
    const elem = $('.productheadline');
    const name = elem.text();
    return name.replace(/\s\s+/g, ' ');
}

async function iterate(obj, action) {
    for(let key in obj) {
        if (obj.hasOwnProperty(key)) {
            await action(key, obj[key]);
        }
    }
}

async function computePrice(computer) {
    let sum = 0.0;
    await iterate(computer, async (part, prodId) => {
        const descr = await getProductDetails(prodId);
        const price = getPrice(descr);
        const prodName = getProductName(descr);
        console.log(`[${part}] ${prodName}: ${price} Euro`);
        sum = sum + price;
    });
    console.log(`Total Sum: ${sum} Euro`);
}

computePrice(computer);