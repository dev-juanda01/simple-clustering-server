const numCPUs = require("os").cpus().length;
const cluster = require("cluster");
const http = require("http");
const { setupMaster, setupWorker } = require("@socket.io/sticky");
const { createAdapter, setupPrimary } = require("@socket.io/cluster-adapter");
const { Domain } = require("./domain_server");
const { UserDomainRedis } = require("./user_redis");

class DomainCluster extends Domain {
    constructor() {
        super();
        this.userDomain = new UserDomainRedis();
        this.celery.setUserDomain(this.userDomain);
    }

    async exec() {
        if (cluster.isMaster) {
            console.log(`Master ${process.pid} is running`);

            let usersConnect = {};

            const broadcast = () => {
                for (var i in cluster.workers) {
                    let worker = cluster.workers[i];
                    worker.send({ users: usersConnect, type: "USERS" });
                }
            };

            const httpServer = http.createServer();

            // setup sticky sessions
            setupMaster(httpServer, {
                loadBalancingMethod: "least-connection",
            });

            // setup connections between the workers
            setupPrimary();

            // needed for packets containing buffers (you can ignore it if you only send plaintext objects)
            // Node.js < 16.0.0
            // cluster.setupMaster({
            //     serialization: "advanced",
            // });
            // Node.js > 16.0.0
            cluster.setupPrimary({
                serialization: "json",
            });

            httpServer.listen(this.port);

            for (let i = 0; i < numCPUs; i++) {
                const worker = cluster.fork();

                // worker.on("message", (msg) => {
                //     switch (msg.type) {
                //         case "DATA_SOCKET":
                //             usersConnect[msg.data._id] = msg.data;
                //             console.log(usersConnect);
                //             broadcast();
                //             break;
                //         case "ALL_USERS":
                //             worker.send({ users: usersConnect, type: "USERS" });
                //             break;
                //         default:
                //             break;
                //     }
                // });
            }

            cluster.on("exit", (worker) => {
                console.log(`Worker ${worker.process.pid} died`);
                cluster.fork();
            });
        } else {
            console.log(`Worker ${process.pid} started`);

            await this.userDomain.connect();

            // use the cluster adapter
            this.io.adapter(createAdapter());

            // user redis adapter
            this.io.adapter(this.userDomain.redisAdapter());

            // setup connection with the primary process
            setupWorker(this.io);

            // start inherit
            this.start();
        }
    }
}

new DomainCluster().exec();
