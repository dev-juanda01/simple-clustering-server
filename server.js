const cluster = require("node:cluster");
const os = require("node:os");
const http = require("node:http");
const express = require("express");
const socketIO = require("socket.io");
const clusterAdapter = require("@socket.io/cluster-adapter");

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

app.use(express.static("./public"));

app.get("/", (req, res) => {
    res.send("Performance example");
});

app.get("/timer", (req, res) => {
    delay(9000);
    res.send(`Ding dong! - ${process.pid}`);
});

// cluster is master
if (cluster.isPrimary) {
    console.log("Master has been started...");

    // total numbers of logical CPU cores
    const NUM_WORKERS = os.cpus().length;
    console.log("Total logical CPU cores:", NUM_WORKERS);

    // total number of worker process = total number logical CPU cores
    for (let i = 0; i < NUM_WORKERS; i++) {
        cluster.fork();
    }

    clusterAdapter.setupPrimary();
} else {
    const server = http.createServer(app);

    // define a socket server and server adapter
    const io = new socketIO.Server(server, {
        connectionStateRecovery: {},
        adapter: clusterAdapter.createAdapter(),
    });

    io.on("connection", (socket) => {
        
        socket.on("hello-socket", async (message) => {
            console.log({
                message,
                id: socket.id,
                hour: new Date().toLocaleTimeString(),
            });

            socket.emit("hello-socket-response", {
                message: message,
                id: socket.id,
                hour: new Date().toLocaleTimeString(),
            });
        });

        // setInterval(() => {
        //     socket.emit("hello-socket-response", {
        //         message: "Sending message",
        //         id: socket.id,
        //         hour: new Date().toLocaleTimeString(),
        //     });
        // }, 1000);
    });

    app.get('/socket/:message', (req, res) => {
        const message = req.params;

        io.emit('hello-socket-response', message);

        res.send('Ok!!')
    })

    console.log("Worker process started...");

    server.listen(3000, () => {
        console.log(`server running at http://localhost:${3000}`);
    });
}
