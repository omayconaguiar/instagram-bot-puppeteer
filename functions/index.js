const puppeteer = require('puppeteer')
const functions = require('firebase-functions');
const cors = require('cors')({origin: true});
require('dotenv/config');

const scrapeImages = async (username) => {
    const browser = await puppeteer.launch( { headless: true } );
    const page = await browser.newPage();
 
    await page.goto('https://www.instagram.com/accounts/login/');

    await page.screenshot({ path: '1.png' });

    await page.waitForSelector('input[name="username"]');

    await page.type('input[name="username"]', process.env.USER);

    await page.type('input[name="password"]', process.env.PASSWORD);

    await page.screenshot({ path: '2.png'});

    await page.click('button[type="submit"]');
 
    await page.waitFor(5000);
 
    await page.goto(`https://www.instagram.com/${username}`);

    await page.waitForSelector('img', {
        visible: true,
    })
 
    await page.screenshot({ path: '3.png'});
 
    const data = await page.evaluate(()=>{
        const images = document.querySelectorAll('img');
 
        const urls = Array.from(images).map(v => v.src);
 
        return urls
    });

    await browser.close();

    console.log(data);
 
    return data;
}

exports.scraper = functions.https.onRequest((request, response) => {
   cors(request, response, async()=>{
       const body = JSON.stringify(request.body);

       const bodyParse = JSON.parse(body);

       const data = await scrapeImages(bodyParse.text);

       response.send(data);
   })
})