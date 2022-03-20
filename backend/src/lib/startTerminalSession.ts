import { Container } from "dockerode";
import { Socket } from "socket.io";

export default async function startTerminalSession(
  container: Container,
  socket: Socket,
  firstCmdCallback: Function = () => {}
) {
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
      firstCmdCallback();
    }

    socket.emit("terminal:data", data.toString());
  });

  socket.on("terminal:data-write", (data) => {
    /** Runs when the client runs a command in the terminal */
    stream.write(data);
  });

  stream.on("end", () => socket.emit("terminal:end"));
}
