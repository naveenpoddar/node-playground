import express, { Request, Response } from "express";
import Docker from "dockerode";
import http from "http";
import cors from "cors";
import {
  CONTAINER_PORT,
  CORS_ORIGINS,
  EXPOSED_PORT,
  SERVER_PORT,
} from "./config";
import connect from "./lib/connect";
import { v4 as uuid } from "uuid";
import initilizeWebSocket from "./routes/socket";
import Browser from "./models/Browser.model";
import Playground from "./models/Playground.model";
import httpProxy from "http-proxy";
import logger from "./lib/logger";

global.logger = logger;

const app = express();
const server = new http.Server(app);

const docker = new Docker();

app.use(cors({ origin: CORS_ORIGINS, credentials: true }));

app.all("/healthcheck", (req, res) => res.sendStatus(200));

app.get("/", async (req, res) => {
  try {
    let browserId = req.query.browserId as string;

    if (!browserId) {
      browserId = uuid();
      await Browser.create({ id: browserId });
    }

    return res.send(browserId);
  } catch (e: any) {
    logger.INCOMING_REQUEST_ERROR(e.message);
    return res.status(500).send(e);
  }
});

app.get("/create-playground", async (req, res) => {
  try {
    const browserId = req.query.browserId as string;
    const browser = await Browser.findOne({ id: browserId });
    const templateId = req.query.templateId as string;

    if (!browser) return res.status(404).send("Browser not found");

    const playground = await Playground.create({
      templateId,
    });

    browser.playgrounds.push(playground._id);
    await browser.save();

    logger.INCOMING_REQUEST(`${browserId.slice(0, 10)}.. Created a playground`);
    return res.send(playground.playgroundId);
  } catch (e: any) {
    logger.INCOMING_REQUEST_ERROR(e.message);
    return res.status(500).send(e);
  }
});

server.listen(SERVER_PORT, async () => {
  console.clear();
  logger.info("Server is listening on port 4000");
  await connect();
  initilizeWebSocket(server);
});

app.all("/containers/:containerId", handleContainerProxy);
app.all("/containers/:containerId/*", handleContainerProxy);

app.all("/:viewId", handleViewProxy);
app.all("/:viewId/*", handleViewProxy);

async function handleViewProxy(req: Request, res: Response) {
  try {
    const viewId = req.params.viewId;
    const playground = await Playground.findOne({ viewId });
    if (!playground) return res.status(404).send("Playground not found");

    const ip = playground.containerIP;
    if (!ip) return res.status(404).send("Playground is not active");

    handleProxy(req, res, `http://${ip}:${EXPOSED_PORT}`, `/${viewId}`);
  } catch (e) {}
}

async function handleContainerProxy(req: Request, res: Response) {
  try {
    const containerId = req.params.containerId;
    const playground = await Playground.findOne({ containerId });
    if (!playground) return res.status(404).send("Container not found");

    const ip = playground.containerIP;
    if (!ip) return res.status(404).send("Container is not active");

    handleProxy(
      req,
      res,
      `http://${ip}:${CONTAINER_PORT}`,
      `/containers/${containerId}`
    );
  } catch (e) {}
}

function handleProxy(
  req: Request,
  res: Response,
  url: string,
  replacer: string
) {
  const apiProxy = httpProxy.createProxyServer({});
  req.url = req.originalUrl.replace(replacer, "");

  return apiProxy.web(req, res, { target: url }, (err) => {
    return res.status(500).send(err);
  });
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
