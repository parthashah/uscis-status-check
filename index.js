const puppeteer = require('puppeteer')
require('dotenv').config()

const url = `https://egov.uscis.gov/casestatus/landing.do`
const formatYmd = date => date.toISOString().slice(0, 10)
function removeTags(str) {
    if ((str===null) || (str===''))
    return false
    else  {
        return str.replace('+','').trim().replace(/\r?\n|\r/g, " ").replace( /(<([^>]+)>)/ig, '')
    }
    
 }
async function run () {
    const today = formatYmd(new Date()) 
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    console.log("going to URL")
    await page.goto(url)
    await page.$eval('#receipt_number', (el,receipt) => el.value = `${receipt}`, process.env.RECEIPT_NUMBER)
    await page.click('input[type="submit"]')
    console.log("waiting for submission to be completed.")
    await page.waitForSelector('div.current-status-sec').catch(t => console.log("Not able to load status screen"))
    const status = removeTags(await page.$eval('.current-status-sec', el => el.innerText))
    console.log(`${today}: ${status}`)
    await page.screenshot({path: `./screenshot/${today}_screenshot.png`})
    browser.close()
}
run()