export interface File {
  name: string;
  isDirectory: boolean;
  files?: File[];
  path: string;
}
