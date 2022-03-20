import http from "http";
import { Server } from "socket.io";
import IPlayground from "../IPlayground";

export default function initilizeWebSocket(server: http.Server) {
  const io = new Server(server);

  io.on("connection", async (socket) => {
    let intervalId: NodeJS.Timer | null = null;
    try {
      const playgroundId: string = socket.handshake.query
        .playgroundId as string;
      const browserId: string = socket.handshake.query.browserId as string;

      const playground = new IPlayground(playgroundId, browserId, socket);
      await playground.fetchPlaygroundObj();

      if (playground.isNew()) {
        await playground.initilizePlaygroundWithTemplate(
          playground.playgroundObj.templateId
        );
      } else {
        await playground.initilizeEmptyPlayground();
        await playground.loadFilesToPlayground();
      }

      await playground.syncPlaygroundWithDB();
      await playground.startPlaygroundOnClient();

      intervalId = setInterval(async () => {
        await playground.refreshFileContents();
      }, 10000);
    } catch (e) {
      logger.error("Something went wrong: " + e);
      intervalId && clearInterval(intervalId);
    }
  });
}
