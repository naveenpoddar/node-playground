import ContainerInstance from "./ContainerInstance";

export default async function saveFileToContainer(
  containerID: string,
  path: string,
  content: string
) {
  try {
    const containerInstance = ContainerInstance(containerID);

    const { data } = await containerInstance.post(`/save-file`, {
      path,
      content,
    });

    return data;
  } catch (err: any) {
    console.log(err?.response?.data);
    return null;
  }
}
