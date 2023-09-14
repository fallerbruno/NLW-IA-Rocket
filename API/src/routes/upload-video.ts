import { FastifyInstance } from "fastify";
import { fastifyMultipart } from "@fastify/multipart";
import { prisma } from "../lib/prisma";
import { pipeline } from "node:stream";
import path from "node:path";
import fs from "node:fs";
import { promisify } from "node:util";

const pump = promisify(pipeline);

export async function uploadVideo(app: FastifyInstance) {
  app.register(fastifyMultipart, {
    limits: {
      fileSize: 1_048_576 * 25, //25mb,
    },
  });

  app.post("/videos", async (req, reply) => {
    const data = await req.file();

    if (data) {
      const extension = path.extname(data?.filename);

      if (extension !== ".mp3") {
        reply.status(400).send({ message: "File must be an mp3" });
      }

      const fileBaseName = path.basename(data.filename, extension);

      const fileUploadName = `${fileBaseName}-${Date.now()}${extension}`;

      const uploadDestination = path.resolve(
        __dirname,
        "../../tmp",
        fileUploadName
      );

      await pump(data.file, fs.createWriteStream(uploadDestination));

      const video = await prisma.video.create({
        data: {
          path: uploadDestination,
          name: fileUploadName,
        },
      });

      return reply
        .status(200)
        .send({ message: "File uploaded", payload: video });
    } else {
      reply.status(400).send({ message: "No file uploaded" });
    }
  });
}
