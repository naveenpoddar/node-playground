import { BrowserClass } from "./models/Browser.model";

export interface File {
  name: string;
  isDirectory: boolean;
  files?: File[];
  path: string;
}

declare module "socket.io" {
  interface Socket {
    browserId: string;
    browser: BrowserClass;
  }
}
