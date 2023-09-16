import puppeteer, { Browser, Page } from 'puppeteer'

let browser: Browser
let page: Page

beforeAll(async () => {
  browser = await puppeteer.launch()
})

beforeEach(async () => {
  page = await browser.newPage()
})

afterEach(async () => {
  await page.close()
})

afterAll(async () => {
  await browser.close()
})

describe('MainPoint send message', () => {
  
})

describe('MainPoint receive message', () => {

})
