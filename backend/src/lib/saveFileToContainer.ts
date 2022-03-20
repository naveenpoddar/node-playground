import ContainerInstance from "./ContainerInstance";

export default async function saveFileToContainer(
  containerIP: string,
  path: string,
  content: string
) {
  try {
    const containerInstance = ContainerInstance(containerIP);

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
