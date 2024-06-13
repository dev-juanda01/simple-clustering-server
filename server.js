const cluster = require('node:cluster');
const os = require('node:os');
const express = require('express');

const app = express();

/**
 * Stopped node to duration defined
 * @param {number} duration time duration blocking node
 */
function delay(duration) {
    const startTime = Date.now();

    while (Date.now() - startTime < duration) {
        // event-loop is blocked
    }
}

app.get('/', (req, res) => {
    res.send('Performance example');
})

app.get('/timer', (req, res) => {
    delay(9000);
    res.send(`Ding dong! - ${process.pid}`);
})

// cluster is master
if(cluster.isPrimary) {
    console.log('Master has been started...');

    // total numbers of logical CPU cores
    const NUM_WORKERS = os.cpus().length;
    console.log('Total logical CPU cores:', NUM_WORKERS);

    // total number of worker process = total number logical CPU cores
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }
} else {
    console.log('Worker process started...');
    app.listen(3000)
}
