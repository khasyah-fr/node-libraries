import { workerData, parentPort } from "worker_threads";
import fs from 'fs'

fs.readFile(workerData.filePath, 'utf8', (err, data) => {
    if (err) {
        parentPort.postMessage({ error: err.message })
    } else {
        try {
            const parsed = JSON.parse(data)
            parentPort.postMessage({ parsed })
        } catch (error) {
            parentPort.postMessage({ error: error.message })
        }
    }
})