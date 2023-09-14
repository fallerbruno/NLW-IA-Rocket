import { fastify } from "fastify";
import { getAllPrompts } from "./routes/get-all-prompts";
import { uploadVideo } from "./routes/upload-video";
import { createTranscription } from "./routes/create-transcription";
import { generateAiCompletion } from "./routes/generate-ai-completion";
import { fastifyCors } from "@fastify/cors";

const app = fastify({
  logger: true,
});

app.register(fastifyCors, {
    origin: "*",
})

app.register(getAllPrompts);
app.register(uploadVideo);
app.register(createTranscription);
app.register(generateAiCompletion);

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("Server is running on port 3000");
  });
