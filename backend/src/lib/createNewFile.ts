import ContainerInstance from "./ContainerInstance";

export default async function createNewFile(containerIP: string, path: string) {
  try {
    const containerInstance = ContainerInstance(containerIP);

    await containerInstance.post(`/create-file?path=${path}`);
  } catch (e: any) {
    console.log(e?.response?.data);
  }
}
