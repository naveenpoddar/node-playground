import axios from "axios";
import Docker from "dockerode";
import { CONTAINER_PORT } from "../config";
import getContainerIP from "./getContainerIP";

const docker = new Docker();

type Prop = {
  template: string;
};

export default async function initilizeContainer({ template }: Prop) {
  const image = await docker.getImage(`${template}:latest`);
  if (!image) throw Error(`Image ${template} not found`);

  const container = await docker.createContainer({
    Image: `${template}:latest`,
    AttachStdin: false,
    AttachStdout: true,
    AttachStderr: true,
    Tty: true,
    Cmd: ["/bin/bash", "-c", "cd /tmp/server && npm start"],
    OpenStdin: false,
    StdinOnce: false,
  });
  await container.start();
  let active = false;
  const ip = await getContainerIP(container);
  const endpoint = `http://${ip}:${CONTAINER_PORT}/files`;

  async function pingContainer() {
    try {
      await axios.get(endpoint);
      active = true;
    } catch (e) {
      return;
    }
  }

  do {
    await pingContainer();
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (!active);

  return container;
}
