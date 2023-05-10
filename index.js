const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

let prevContract = null;

async function getContract() {
  const url = `https://bscscan.com/address-events?m=normal&a=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73&v=0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url);
  const link = await page.$$eval("#demo1 a", (elements) => {
    return elements.map((el) => el.innerText.trim());
  });

  await browser.close();

  return link[0];
}

async function scrapeContent(url) {
  const fullUrl = `https://bscscan.com/address/${url}#codes`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(fullUrl);

  const content = await page.$$eval(".ace_line_group", (elements) => elements.map((element) => element.innerText.trim()));
  const title = await page.$eval("#ContentPlaceHolder1_tr_tokeninfo a", (element) => element.innerText.trim());
  await browser.close();

  const filtered = content.filter((str) => str.includes("https://t.me/"));
  if (filtered.length > 0) {
    return { title, filtered };
  } else {
    console.log("tidak ada group tele");
    return { title };
  }
}

async function getSupply(url) {
  const fullUrl = `https://bscscan.com/token/${url}`;
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(fullUrl);
  const supply = await page.$eval("#ContentPlaceHolder1_hdnTotalSupply", (el) => el.value);
  const holders = await page.$$eval("#ContentPlaceHolder1_tr_tokenHolders div.row:nth-child(2) div:first-child", (elements) => {
    return elements.map((element) => element.textContent.trim());
  });
  return {
    supply,
    holders: holders[1],
  };
}

async function main() {
  setInterval(async () => {
    const contract = await getContract();
    if (prevContract !== contract) {
      prevContract = contract;
      const content = await scrapeContent(contract);
      const supply = await getSupply(contract);
      console.log(`Content of ${contract} :`);
      console.log(`Title: ${content.title}`);
      console.log(`Supply: ${supply.supply}`);
      console.log(`Holders: ${supply.holders}`);
      console.log(`Contract Adress: ${contract}`);
      console.log(`Telegram Group:${content.filtered}`);
      console.log("====================================");
    } else {
    }
  }, 20000);
}

main();
