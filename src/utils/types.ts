interface IReadFile {
  name: string;
  percentage: number;
  raw: File;
  size: number;
  status: string;
  uid: number;
}

interface IDataInput<T> {
  id: string;
  filename: string;
  data: T
}

export type {
  IReadFile,
  IDataInput,
}