import express, { Request, Response } from "express";
import Docker from "dockerode";
import http from "http";
import cors from "cors";
import { CORS_ORIGINS, EXPOSED_PORT, SERVER_PORT } from "./config";
import connect from "./lib/connect";
import { v4 as uuid } from "uuid";
import initilizeWebSocket from "./routes/socket";
import Browser from "./models/Browser.model";
import Playground from "./models/Playground.model";
import httpProxy from "http-proxy";

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

app.all("/view-app/:playgroundId", handleProxy);
app.all("/view-app/:playgroundId/*", handleProxy);

async function handleProxy(req: Request, res: Response) {
  try {
    const playgroundId = req.params.playgroundId;
    const playground = await Playground.findOne({ playgroundId });
    if (!playground) return res.status(404).send("Playground not found");
    const url = playground.url;
    if (!url) return res.status(404).send("Playground not found");
    const apiProxy = httpProxy.createProxyServer({});
    req.url = req.originalUrl.replace(`/view-app/${playgroundId}`, "");
    apiProxy.web(req, res, { target: url }, (err) => {
      res.status(500).send(err);
      console.log("LOL");
    });
  } catch (e) {}
}

// When the server is closed all the containers which are running will be killed and removed
process.on("exit", async () => {
  const containers = await docker.listContainers();

  containers.forEach(async (containerInfo) => {
    const container = docker.getContainer(containerInfo.Id);
    await container.kill();
    await container.remove({ force: true });
  });
});
