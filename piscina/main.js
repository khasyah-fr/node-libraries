import fs from 'fs'
import path from 'path'
import { Piscina } from 'piscina'
import { Worker } from 'worker_threads'
import { fork } from 'child_process'

const __dirname = path.resolve()
const staticData = [
    { stockName: 'AAPL', stockPurchased: 10, stockBuyOrSell: 'BUY', customerName: 'Alice', transactionAmount: 1500 },
  { stockName: 'AAPL', stockPurchased: 10, stockBuyOrSell: 'SELL', customerName: 'Alice', transactionAmount: 1550 },
  { stockName: 'TSLA', stockPurchased: 5, stockBuyOrSell: 'BUY', customerName: 'Bob', transactionAmount: 2000 },
  { stockName: 'TSLA', stockPurchased: 5, stockBuyOrSell: 'SELL', customerName: 'Bob', transactionAmount: 2100 },
  { stockName: 'GOOG', stockPurchased: 8, stockBuyOrSell: 'BUY', customerName: 'Carol', transactionAmount: 4000 },
  { stockName: 'GOOG', stockPurchased: 8, stockBuyOrSell: 'SELL', customerName: 'Carol', transactionAmount: 4200 },
  { stockName: 'MSFT', stockPurchased: 12, stockBuyOrSell: 'BUY', customerName: 'Dave', transactionAmount: 1800 },
  { stockName: 'MSFT', stockPurchased: 12, stockBuyOrSell: 'SELL', customerName: 'Dave', transactionAmount: 1850 },
  { stockName: 'NFLX', stockPurchased: 3, stockBuyOrSell: 'BUY', customerName: 'Eve', transactionAmount: 900 },
  { stockName: 'NFLX', stockPurchased: 3, stockBuyOrSell: 'SELL', customerName: 'Eve', transactionAmount: 950 }
]

// 1. Parse JSON via worker
function parseJSON() {
    return new Promise((resolve, reject) => {
        const worker = new Worker('./worker_parse_json.js', {
            workerData: { filePath: path.join(__dirname, 'netted_transactions.json')}
        })

        worker.once('message', (msg) => {
            if (msg.error) {
                reject(new Error(msg.error))
            } else {
                resolve(msg.parsed)
            } 
        })

        worker.once('error', reject)
        worker.once('exit', (code) => {
            if (code !== 0) reject (new Error(`JSON worker stopped with exit code ${code}`))
        })
    })
}

// 2. Match using Piscina worker
const piscina = new Piscina({
    filename: path.resolve('./worker_matching.js')
})

// 3. Generate PDF via child process
function generatePDF(html) {
    return new Promise((resolve, reject) => {
        const child = fork('./child_generate_pdf.js')
        child.send({ html })
        child.on('message', (msg) => {
            if (msg.success) {
                resolve()
            } else {
                reject(new Error(msg.error))
            }
        })

        child.on('exit', (code) => {
            if (code !== 0) {
                reject(new Error(`PDF child process exited with code ${code}`))
            }
        })
    })
}

// Main execution
(async () => {
    try {
        const parsedJSON = await parseJSON()
        const matchedResult = await piscina.run({ staticData, nettedData: parseJSON})

        const html = `
            <html>
                <head><title>Transaction Match</title></head>
                <body>
                <table border="1" cellpadding="5">
                    <tr><th>Customer</th><th>Expected Total</th><th>Actual Netted</th><th>Matched?</th></tr>
                    ${matchedResult.map(row =>
                    `<tr>
                        <td>${row.customerName}</td>
                        <td>${row.expected}</td>
                        <td>${row.actual}</td>
                        <td>${row.match ? 'true' : 'false'}</td>
                    </tr>`
                    ).join('')}
                </table>
                </body>
            </html>`;

        await generatePDF(html)
        console.log('PDF generated as output')
    } catch (error) {
        console.error(`Error: ${error}`)
    }
})()