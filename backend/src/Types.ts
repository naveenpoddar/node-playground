import { BrowserClass } from "./models/Browser.model";
import loggerLib from "./lib/logger";

declare global {
  var logger: typeof loggerLib;
}

export interface File {
  name: string;
  isDirectory: boolean;
  files?: File[];
  path: string;
}

export interface RuntimeConfig {
  tabs: string[];
  install: string;
  run: string;
  [key: string]: any;
}

declare module "socket.io" {
  interface Socket {
    browserId: string;
    browser: BrowserClass;
  }
}
