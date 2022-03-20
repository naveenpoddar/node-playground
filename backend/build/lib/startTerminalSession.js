"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function startTerminalSession(container, socket) {
    const exec = await container.exec({
        Cmd: ["bash"],
        AttachStderr: true,
        AttachStdout: true,
        AttachStdin: true,
        Tty: true,
    });
    const stream = await exec.start({ stdin: true });
    let isFirstStream = false;
    stream.on("data", (data) => {
        /** Runs when the container terminal has some text */
        if (!isFirstStream) {
            isFirstStream = true;
            socket.emit("start-webserver", 5858);
        }
        socket.emit("terminal:data", data.toString());
    });
    socket.on("terminal:data-write", (data) => {
        /** Runs when the client runs a command in the terminal */
        stream.write(data);
    });
    stream.on("end", () => socket.emit("terminal:end"));
}
exports.default = startTerminalSession;
