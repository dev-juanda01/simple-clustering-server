const http = require("http");
const express = require("express");
const { Server } = require("socket.io");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const { CeleryDomain } = require("./celery");
const routesApp = require("./routes");
const { UserDomain } = require("./user");
const { SocketDomain } = require("./socket");
const { requestListenerServer } = require("./utils");

class Domain {
    constructor() {
        this.port = 3001;
        this.app = express();
        this.httpServer = http.createServer(this.app, requestListenerServer);
        this.io = new Server(this.httpServer);
        this.userDomain = new UserDomain();
        this.celery = new CeleryDomain(this.io, this.userDomain);
    }

    middleware() {
        this.app.use(express.static("./public"));

        //CORS
        this.app.use(cors());

        // Helmet
        this.app.use(
            helmet.contentSecurityPolicy({
                directives: {
                    frameAncestors: ["'self'", "*"],
                    "script-src": [
                        "'self'",
                        "'unsafe-inline'",
                        "'unsafe-eval'",
                        "*",
                    ],
                    "img-src": ["'self'", "data:", "*"],
                    "default-src": ["'self'", "*"],
                    "connect-src": ["'self'", "*"],
                },
            })
        );

        // Logger
        this.app.use(morgan("dev"));

        // Parse data to JSON
        this.app.use(express.json({ limit: "50mb" }));

        this.app.use(
            express.urlencoded({
                extended: false,
            })
        );
    }

    routes() {
        this.app.use("/", routesApp);
    }

    socket() {
        const socketDomain = new SocketDomain(this.io, this.userDomain);
        socketDomain.events();
    }

    celery_events() {
        // celery
        this.celery.run();
    }

    start() {
        this.middleware();

        this.routes();

        this.socket();

        this.celery_events();
    }
}

module.exports = {
    Domain,
};
