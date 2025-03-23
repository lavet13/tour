export interface PonyfillFile {
  blobParts: Buffer; // The actual blob data parts
  _size: null | number;      // Size of the file, null in this case
  type: string;              // MIME type of the file
  encoding: string;          // Character encoding
  name: string;              // Filename
  webkitRelativePath: string; // Relative path (empty in this case)
  lastModified: number;      // Timestamp of last modification
}
