import Axios from "axios";
import { getBrowserId } from "./util";

const axios = Axios.create({
  params: {
    browserId: getBrowserId(),
  },
  baseURL: "http://localhost:4000",
  withCredentials: true,
});

export default axios;
