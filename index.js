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

function textLength(obj, propName) {
    if (obj.hasOwnProperty(propName)) {
        const val = obj[propName];
        if (typeof val === "string") {
            return val.length;
        }
        return val.toString().length;
    }
}

function maxLength(dataset) {
    let res = {};
    for(let entry of dataset) {
        for(let key in entry) {
            if (entry.hasOwnProperty(key)) {
                if (res.hasOwnProperty(key)) {
                    let max = Math.max(res[key], textLength(entry, key));
                    res[key] = max;
                } else {
                    res[key] = textLength(entry, key);
                }
            }
        }
    }
    return res;
}

function pad(obj, prop, len) {
    const val = obj[prop];
    if (typeof val === "string") {
        return val.padEnd(len[prop]);
    }
    return val.toFixed(2).padStart(len[prop] + 2);
}

async function computePrice(computer) {
    let sum = 0.0;
    let data = [];
    await iterate(computer, async (part, prodId) => {
        const descr = await getProductDetails(prodId);
        const price = getPrice(descr);
        const prodName = getProductName(descr);
        data.push({
            "type": part,
            "name": prodName,
            "price": price
        });
        sum = sum + price;
    });
    const lengths = maxLength(data);
    for(let entry of data) {
        console.log(`${pad(entry, "type", lengths)} ${pad(entry, "name", lengths)} ${pad(entry, "price", lengths)} Euro`);
    }
    console.log('');
    console.log(`TOTAL SUM: ${sum.toFixed(2)} Euro`);
}

computePrice(computer);