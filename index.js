const puppeteer = require("puppeteer");

let browser;

const HEADLESS = false;

async function main() {
  browser = await puppeteer.launch({ headless: HEADLESS });

  const page = await browser.newPage();

  const search = "bord";
  const lat = 55.15724;
  const lng = 8.77034;

  const url = `https://www.facebook.com/marketplace/112879158725932/search/?query=${search}&latitude=${lat}&longitude=${lng}4&vertical=C2C&sort=BEST_MATCH`;

  await page.goto(url);

  await page.waitForFunction(
    `document.querySelectorAll("div[data-testid='marketplace_search_feed_content'] > div > div:first-child > div").length >= 24`
  );

  await page.evaluate(() => {
    return new Promise((resolve, reject) => {

      let prev;
      const interval = setInterval(() => {
        const len = document.querySelectorAll(`div[data-testid='marketplace_search_feed_content'] > div > div:first-child > div`).length;

        if((prev && prev === len) || len >= 100) {
          resolve();
          clearInterval(interval);
        }
        window.scrollBy({ left: 0, top: document.documentElement.scrollHeight });

        prev = len;
      }, 1000);
    });
  });

  const items = await page.evaluate(() => {
    const selector = "div[data-testid='marketplace_search_feed_content'] > div > div:first-child > div";
    const products = Array.from(document.querySelectorAll(selector)).map(product => {
      const location = product.querySelector("a > div > div:last-child > div:nth-child(2) span")
        ? product.querySelector("a > div > div:last-child > div:nth-child(2) span").innerText
        : "";
      const price = product.querySelector("a > div > div > div > div") ? product.querySelector("a > div > div > div > div").innerHTML : "0";
      return {
        title: product.querySelector("p") ? product.querySelector("p").innerText : "",
        location,
        price: price.trim().replace(/[A-Za-z.]/g, "")
      };
    });
    return products;
  });
  console.log(items);
}
main();
