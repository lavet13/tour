export interface PonyfillFile {
  blobParts: Buffer | Buffer[];
  _size: null | number; // Size of the file, null in this case
  type: string; // MIME type of the file
  encoding: string; // Character encoding
  name: string; // Filename
  lastModified: number; // Timestamp of last modification
  [x: string]: any;
}
