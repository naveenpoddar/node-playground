import express from "express";
import Docker from "dockerode";
import http from "http";
import cors from "cors";
import { CORS_ORIGINS, SERVER_PORT } from "./config";
import connect from "./lib/connect";
import { v4 as uuid } from "uuid";
import initilizeWebSocket from "./routes/socket";
import Browser from "./models/Browser.model";
import Playground from "./models/Playground.model";

const app = express();
const server = new http.Server(app);

const docker = new Docker();

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

app.get("/", async (req, res) => {
  let browserId = req.query.browserId as string;

  if (!browserId) {
    browserId = uuid();
    await Browser.create({ id: browserId });
  }

  return res.send(browserId);
});

app.get("/create-playground", async (req, res) => {
  const browserId = req.query.browserId as string;
  const browser = await Browser.findOne({ id: browserId });
  const templateId = req.query.templateId as string;

  if (!browser) return res.status(404).send("Browser not found");

  const playground = await Playground.create({
    templateId,
  });

  browser.playgrounds.push(playground._id);
  await browser.save();

  return res.send(playground.playgroundId);
});

server.listen(SERVER_PORT, async () => {
  console.log("Server is listening on port 4000");
  await connect();
  initilizeWebSocket(server);
});

// When the server is closed all the containers which are running will be killed and removed
process.on("exit", async () => {
  const containers = await docker.listContainers();

  containers.forEach(async (containerInfo) => {
    const container = docker.getContainer(containerInfo.Id);
    await container.kill();
    await container.remove({ force: true });
  });
});
