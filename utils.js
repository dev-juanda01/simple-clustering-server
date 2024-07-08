const busboy = require("busboy");

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

function requestListenerServer(req, res) {
    if (req.method === "POST") {
        const bb = busboy({ headers: req.headers });

        bb.on("file", (name, file, info) => {
            file.on("error", (err) => {
                console.error("File error", err);
                // Manejar el error del archivo
            });

            file.on("end", () => {
                console.log("File upload complete");
            });

            file.pipe(/* destino del archivo */);
        });

        bb.on("error", (err) => {
            console.error("Busboy error", err);
            res.statusCode = 500;
            res.end("Error while processing the form");
        });

        bb.on("finish", () => {
            res.writeHead(200, { Connection: "close" });
            res.end("That's all folks!");
        });

        return req.pipe(bb);
    }

    res.writeHead(404);
    res.end();
}

module.exports = {
    delay,
    requestListenerServer
};
