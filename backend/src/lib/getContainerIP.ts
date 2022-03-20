import { Container } from "dockerode";

export default async function getContainerIP(container: Container) {
  const inspect = await container.inspect();
  const networkSettings = inspect.NetworkSettings;
  const ip = networkSettings.IPAddress;
  return ip;
}
