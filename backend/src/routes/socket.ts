import http from "http";
import { Server } from "socket.io";
import IPlayground from "../IPlayground";

export default function initilizeWebSocket(server: http.Server) {
  const io = new Server(server);

  io.on("connection", async (socket) => {
    try {
      const playgroundId: string = socket.handshake.query
        .playgroundId as string;
      const browserId: string = socket.handshake.query.browserId as string;

      console.log("playground loading");

      const playground = new IPlayground(playgroundId, browserId, socket);
      await playground.fetchPlaygroundObj();

      console.log("got it");

      if (playground.isNew()) {
        await playground.initilizePlaygroundWithTemplate(
          playground.playgroundObj.templateId
        );
      } else {
        await playground.initilizeEmptyPlayground();
        await playground.loadFilesToPlayground();
      }

      console.log("loaded everything");

      await playground.syncPlaygroundWithDB();
      await playground.startPlaygroundOnClient();
    } catch (e) {
      logger.error("Something went wrong: " + getError(e));
    }
  });
}
