import axios from "axios";
import { CONTAINER_PORT, SERVER_URL } from "../config";

const ContainerInstance = (containerID: string, generic: boolean = false) => {
  if (!containerID) {
    logger.error("Container ID is not valid: " + containerID || "null");
    throw new Error("Container ID is not valid: ");
  }

  if (generic) {
    return axios.create({
      baseURL: `http://${containerID}:${CONTAINER_PORT}`,
      withCredentials: true,
    });
  }

  return axios.create({
    baseURL: `${SERVER_URL}/containers/${containerID}`,
    withCredentials: true,
  });
};

export default ContainerInstance;
