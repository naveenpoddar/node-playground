import Axios from "axios";
import { SERVER_URL } from "../config";

const containerInstance = (IP: string) =>
  Axios.create({
    baseURL: `${SERVER_URL}/containers/${IP}`,
    withCredentials: true,
  });

export default containerInstance;
