class SocketDomain {
    constructor(io, userDomain) {
        this.io = io;
        this.userDomain = userDomain;
    }

    events() {
        this.io.on("connection", async (socket) => {

            await this.userDomain.addUser(socket.id);
            // process.send({
            //     type: "DATA_SOCKET",
            //     msg: "data_socket",
            //     data: {
            //         _id: socket.id,
            //     },
            // });

            // console.log(`Worker ${process.pid}`, usersConnect);

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

                // console.log(users);
            });

            socket.on("all:users", () => {
                const data = this.getData();
                console.log("DATA_USERS", data);
                socket.emit("users", data);
            });

            // setInterval(() => {
            //     socket.emit("hello-socket-response", {
            //         message: "Sending message",
            //         id: socket.id,
            //         hour: new Date().toLocaleTimeString(),
            //     });
            // }, 1000);
        });
    }
}

module.exports = {
    SocketDomain,
};
