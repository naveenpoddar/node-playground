import Docker from "dockerode";

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
  return container;
}
