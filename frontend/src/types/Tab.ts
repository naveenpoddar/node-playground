import { File } from "./File";

export interface Tab extends File {
  isActive: boolean;
  code: string;
  hasChanges: boolean;
  scrollTop?: number;
}
