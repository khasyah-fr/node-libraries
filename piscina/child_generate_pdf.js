import puppeteer from 'puppeteer'

process.on('message', async (msg) => {
    try {
        const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] })
        const page = await browser.newPage()
        await page.setContent(msg.html, { waitUntil: 'load' })
        await page.pdf({ path: 'output.pdf', format: 'A4' })
        await browser.close()
        process.send({ success: true })
    } catch (error) {
        process.send({ error: error.message })
    } finally {
        process.exit(0)
    }
})