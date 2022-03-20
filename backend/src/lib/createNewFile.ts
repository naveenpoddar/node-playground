import ContainerInstance from "./ContainerInstance";

export default async function createNewFile(containerID: string, path: string) {
  try {
    const containerInstance = ContainerInstance(containerID);

    await containerInstance.post(`/create-file?path=${path}`);
  } catch (e: any) {
    console.log(e?.response?.data);
  }
}
