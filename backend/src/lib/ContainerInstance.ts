import axios from "axios";
import { SERVER_URL } from "../config";

const ContainerInstance = (containerIP: string) => {
  return axios.create({
    baseURL: `${SERVER_URL}/containers/${containerIP}`,
    withCredentials: true,
  });
};

export default ContainerInstance;
