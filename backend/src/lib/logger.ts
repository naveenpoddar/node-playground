import pinoLogger from "pino";
import dayjs from "dayjs";

const logger = pinoLogger({
  customLevels: {
    INCOMING_REQUEST: 25,
    INCOMING_REQUEST_ERROR: 26,
  },
  transport: {
    target: "pino-pretty",
  },
  base: {
    pid: false,
  },
  timestamp: () => `,"time":"${dayjs().format("DD MMM hh:mm:ss A")}"`,
});

logger;

export default logger;
