import { File } from "../Types";
import ContainerInstance from "./ContainerInstance";

export default async function getFilesList(
  containerIP: string,
  path: string = "/app"
) {
  const containerInstance = ContainerInstance(containerIP);

  const { data } = await containerInstance.get("/files", {
    params: {
      path,
    },
  });
  let files: File[] = [];

  for (let i = 0; i < data.length; i++) {
    const file = data[i];

    if (file.isDirectory) {
      files.push({
        ...file,
        files: await getFilesList(containerIP, `${path}/${file.name}`),
      });
    } else {
      files.push(file);
    }
  }

  // Sorts the files array by name and directories first
  return files.sort((a, b) => {
    if (a.isDirectory && !b.isDirectory) {
      return -1;
    }
    if (!a.isDirectory && b.isDirectory) {
      return 1;
    }
    return a.name.localeCompare(b.name);
  });
}
