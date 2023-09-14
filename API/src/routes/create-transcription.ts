import { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { z } from "zod";
import { ReadStream, createReadStream } from "node:fs";
import { openai } from "../lib/openia";

export async function createTranscription(app: FastifyInstance) {
  app.post("/videos/:videoId/transcription", async (req) => {
    const paramsSchema = z.object({
      videoId: z.string().uuid(),
    });

    const { videoId } = paramsSchema.parse(req.params);

    const bodySchema = z.object({
      prompt: z.string(),
    });

    const { prompt } = bodySchema.parse(req.body);

    const video = await prisma.video.findUniqueOrThrow({
      where: {
        id: videoId,
      },
    });

    const videoPath = video.path;

    const audioReadStream = createReadStream(videoPath);

    const responde = await openai.audio.transcriptions.create({
      file: audioReadStream,
      model: "whisper-1",
      language: "pt",
      response_format: "json",
      temperature: 0.2,
      prompt,
    });

    responde.text;

    await prisma.video.update({
      where: {
        id: videoId,
      },
      data: {
        transcription: responde.text,
      },
    });
    
    return { transcription: responde.text };
  });
}
