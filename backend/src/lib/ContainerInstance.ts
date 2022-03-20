import axios from "axios";
import { CONTAINER_PORT } from "../config";

const ContainerInstance = (containerIP: string) => {
  return axios.create({
    baseURL: `http://${containerIP}:${CONTAINER_PORT}`,
    withCredentials: true,
  });
};

export default ContainerInstance;
