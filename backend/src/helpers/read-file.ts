import { createReadStream } from "fs";
import { GraphQLError } from "graphql";
import { Writable } from "stream";
import { pipeline } from "stream/promises";

export const readFile = async (filePath: string): Promise<Buffer> => {
  const readStream = createReadStream(filePath);
  const chunks: Buffer[] = [];

  const collectChunks = new Writable({
    write(chunk, enc, cb) {
      chunks.push(chunk);
      cb();
    },
  });

  try {
    await pipeline(readStream, collectChunks);
    return Buffer.concat(chunks);
  } catch (error: any) {
    console.error(`Error reading file: ${error.message}`);
    throw new GraphQLError(`Error reading file at path: ${filePath}`);
  }
};
