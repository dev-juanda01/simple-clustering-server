const deasync = require("deasync");

class UserDomain {
    constructor() {
        this.users = null;

        process.on("message", (msg) => {
            if (msg.type === "USERS") {
                this.users = msg.users;
            }

            // console.log(`USER_DOMAIN: ${new Date().toLocaleTimeString()}`, this.users);
        });
    }

    getData() {
        console.log("CELERY_USERS", this.users);
        // let users = null;
        // let resolved = false;

        // process.send({
        //     type: "ALL_USERS",
        // });

        // process.on("message", function handler(msg) {
        //     if (msg.type === "USERS") {
        //         users = msg.users;
        //         resolved = true;

        //         process.removeListener("message", handler);
        //     }
        // });

        // // Block the event loop until the message is received
        // while (!resolved) {
        //     deasync.runLoopOnce();
        // }

        return this.users;
    }

    addUser(socket_id) {
        this.users[socket_id] = { socket_id };
    }
}

module.exports = {
    UserDomain,
};
