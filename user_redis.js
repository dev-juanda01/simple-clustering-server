const redis = require("redis");
const redisAdapter = require("@socket.io/redis-adapter");
const { UserDomain } = require("./user");

class UserDomainRedis extends UserDomain {
    constructor() {
        super();
        process.removeListener("message", () => console.log("off listener"));

        this.pubClient = redis.createClient({
            url: "redis://localhost:6379/1",
        });

        this.subClient = this.pubClient.duplicate();
    }

    redisAdapter() {
        return redisAdapter.createAdapter(this.pubClient, this.subClient);
    }

    async connect() {
        await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    }

    async addUser(socket_id) {
        try {
            let users = await this.pubClient.get("users_socket");
            
            let users_socket = users ? JSON.parse(users) : {};

            users_socket[socket_id] = {
                socket_id,
            };

            await this.pubClient.set(
                "users_socket",
                JSON.stringify(users_socket)
            );
        } catch (error) {
            console.log(error);
        }
    }

    async getUsers() {
        try {
            const users = await this.pubClient.get("users_socket");
            return JSON.parse(users);
        } catch (error) {
            console.log(error);
        }
    }
}

module.exports = {
    UserDomainRedis,
};
