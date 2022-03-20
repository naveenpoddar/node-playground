import Axios from "axios";

const containerInstance = (IP: string) =>
  Axios.create({
    baseURL: `http://${IP}:7777`,
    withCredentials: true,
  });

export default containerInstance;
