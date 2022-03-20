import Axios from "axios";
import { SERVER_URL } from "../config";
import { getBrowserId } from "./util";

const axios = Axios.create({
  params: {
    browserId: getBrowserId(),
  },
  baseURL: SERVER_URL,
  withCredentials: true,
});

export default axios;
