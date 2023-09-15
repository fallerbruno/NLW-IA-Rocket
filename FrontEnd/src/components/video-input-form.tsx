import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status =
  | "waiting"
  | "converting"
  | "uploading"
  | "generating"
  | "finished";

const statusMessage = {
  waiting: "Enviar vídeo",
  converting: "Convertendo vídeo...",
  generating: "Gerando transcrição...",
  uploading: "Enviando vídeo para o servidor...",
  finished: "Vídeo enviado com sucesso!",
};

interface VideoInputFormProps {
  onVideoUploaded: (videoId: string) => void;
}

export function VideoInputForm({ onVideoUploaded }: VideoInputFormProps) {
  const [videoFile, setVideoFile] = useState<File | null>(null);

  const promptInputRef = useRef<HTMLTextAreaElement>(null);

  const [status, setStatus] = useState<Status>("waiting");
  function handleFileSelected(event: React.ChangeEvent<HTMLInputElement>) {
    const { files } = event.currentTarget;

    if (!files) {
      return;
    }

    const selectedFile = files[0];
    setVideoFile(selectedFile);
  }

  async function convertVideoToAudio(video: File) {
    setStatus("converting");

    const ffmpeg = await getFFmpeg();

    await ffmpeg.writeFile("input.mp4", await fetchFile(video));

    // ffmpeg.on("log", (log) => {
    //   console.log(log);
    // });

    ffmpeg.on("progress", (progress) => {
      console.log("Convert progress: " + Math.round(progress.progress * 100));
    });

    await ffmpeg.exec([
      "-i",
      "input.mp4",
      "-map",
      "0:a",
      "-b:a",
      "20k",
      "-acodec",
      "libmp3lame",
      "output.mp3",
    ]);

    const data = await ffmpeg.readFile("output.mp3");

    const audioFileBlob = new Blob([data], { type: "audio/mp3" });
    const audioFile = new File([audioFileBlob], "output.mp3", {
      type: "audio/mpeg",
    });

    console.log("Convert finished.");

    return audioFile;
  }

  async function handleUploadVideo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = promptInputRef.current?.value;

    if (!videoFile || !prompt) {
      return;
    }

    const audioFile = await convertVideoToAudio(videoFile);

    const data = new FormData();
    data.append("file", audioFile);

    setStatus("uploading");

    const response = await api.post("/videos", data);

    const videoId = response.data.payload.id;

    setStatus("generating");

    await api.post(`/videos/${videoId}/transcription`, {
      prompt,
    });
    onVideoUploaded(videoId);
    setStatus("finished");
  }

  const previewURL = useMemo(() => {
    if (!videoFile) {
      return "";
    }

    return URL.createObjectURL(videoFile);
  }, [videoFile]);

  return (
    <form className="space-y-6" onSubmit={handleUploadVideo}>
      <label
        htmlFor="video"
        className="border relative flex rounded-md aspect-video items-center justify-center cursor-pointer border-dashed text-sm flex-col gap-2 text-muted-foreground :hover bg-primary/5"
      >
        {videoFile ? (
          <video
            src={previewURL}
            controls={false}
            className="pointer-events-none absolute top-0 left-0 w-full h-full rounded-md"
          />
        ) : (
          <>
            <FileVideo className="w-4 h-4" />
            Selecione um Vídeo
          </>
        )}
      </label>

      <input
        type="file"
        name="video"
        id="video"
        className="sr-only"
        accept="video/mp4"
        onChange={handleFileSelected}
      />

      <Separator />

      <div className="space-y-2">
        <Label htmlFor="promptTranscription">Prompt de Transcrição</Label>
        <Textarea
          disabled={status != "waiting"}
          id="promptTranscription"
          className="h-20 leading-relaxed resize-none"
          placeholder="Inclua Palavras mencionadas no video separadas por virgula."
          ref={promptInputRef}
        />
      </div>

      <Button
        data-success={status === "finished"}
        type="submit"
        className="flex items-center justify-center w-full data-[finished=true]:bg-blue-400"
        disabled={status != "waiting"}
      >
        {status === "waiting" ? (
          <>
            Enviar Vídeo
            <Upload className="w-4 h-4 ml-2" />
          </>
        ) : (
          statusMessage[status]
        )}
      </Button>
    </form>
  );
}
