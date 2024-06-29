interface IReadFile {
  name: string;
  percentage: number;
  raw: File;
  size: number;
  status: string;
  uid: number;
}

export type {
  IReadFile,
}