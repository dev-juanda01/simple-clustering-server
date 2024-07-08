const celery = require("celery-node");

class CeleryDomain {
    constructor(io, userDomain) {
        this.io = io;
        this.userDomain = userDomain;

        // celery test
        this.worker = celery.createWorker(
            "redis://localhost:6379/5",
            "redis://localhost:6379/5"
        );

        this.client = celery.createClient(
            "redis://localhost:6379/5",
            "redis://localhost:6379/5"
        );

        this.worker2 = celery.createWorker(
            "redis://localhost:6379/6",
            "redis://localhost:6379/6"
        );

        this.client2 = celery.createClient(
            "redis://localhost:6379/6",
            "redis://localhost:6379/6"
        );

        // singleton pattern
        if (CeleryDomain.instance === "object") {
            return CeleryDomain.instance;
        }

        CeleryDomain.instance = this;
        return this;
    }

    setUserDomain(newUserDomain) {
        this.userDomain = newUserDomain;
    }

    async send(data = {}) {
        const task = this.client.createTask("init.task");
        const exec_task = task.applyAsync([
            {
                msg: "celery ok!!!",
                hour: new Date().toLocaleTimeString(),
                data,
            },
        ]);

        await exec_task.get();
    }

    async send2() {
        const task = client2.createTask("init.task2");
        const exec_task = task.applyAsync([
            {
                msg: "celery ok!!!",
                hour: new Date().toLocaleTimeString(),
            },
        ]);

        await exec_task.get();
    }

    run() {
        this.worker.register("init.task", async (value) => {
            // console.log(
            //     `Execution time: ${new Date().toLocaleTimeString()} ms`,
            //     value
            // );
            const users = await this.userDomain.getUsers();

            this.io?.emit("ok", {
                msg: `Execution time: ${new Date().toLocaleTimeString()} ms`,
                value,
                users,
            });

            return true;
        });

        this.worker.start();

        this.worker2.register("init.task2", async (value) => {
            // console.log(value);
            console.log(
                `Execution time: ${new Date().toLocaleTimeString()} ms`
            );

            return true;
        });

        this.worker2.start();
    }
}

module.exports = {
    CeleryDomain,
};
