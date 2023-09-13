import { FileVideo, Github, Upload, Wand2 } from "lucide-react";
import { Button } from "./components/ui/button";
import { Separator } from "./components/ui/separator";
import { Textarea } from "./components/ui/textarea";
import { Label } from "./components/ui/label";

import { Slider } from "./components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

export function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="px-6 py-12 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">Upload ui</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            Desenvolvido por Bruno Faller
          </span>

          <Separator orientation="vertical" className="h-6" />

          <Button variant={"outline"}>
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </div>

      <main className="flex-1 p-6 flex gap-6">
        <div className="flex flex-col flex-1 gap-4 ">
          <div className="grid grid-rows-2 gap-4 flex-1">
            <Textarea
              placeholder="Inclua o prompt para IA..."
              className="resize-none p-5 leading-relaxed"
            />
            <Textarea
              placeholder="Resultado gerado pela IA..."
              className="resize-none p-5 leading-relaxed"
              readOnly
            />
          </div>
          <p className="text-sm text-muted-foreground">
            Lembre-se: você pode utilizar a variável
            <code className="text-green-400">{"{transcription}"}</code> para
            adicionar o conteúdo da transmissão do video selecionado.
          </p>
        </div>

        <aside className="w-80 space-y-6">
          <form className="space-y-6">
            <label
              htmlFor="video"
              className="border flex rounded-md aspect-video items-center justify-center cursor-pointer border-dashed text-sm flex-col gap-2 text-muted-foreground :hover bg-primary/5"
            >
              <FileVideo className="w-4 h-4" />
              Selecione um Vídeo
            </label>

            <input
              type="file"
              name="video"
              id="video"
              className="sr-only"
              accept="video/mp4"
            />

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="promptTranscription">Prompt de Transcrição</Label>
              <Textarea
                id="promptTranscription"
                className="h-20 leading-relaxed resize-none"
                placeholder="Inclua Palavras mencionadas no video separadas por virgula."
              />
            </div>

            <Button
              type="submit"
              className="flex items-center justify-center w-full"
            >
              Carregar Video
              <Upload className="w-4 h-4 ml-2" />
            </Button>
          </form>

          <Separator />

          <form className="space-y-6">
            <div className="space-y-3 flex flex-col w-full">
              <Label htmlFor="select">Prompt</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um Prompt" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Titulo do Youtube</SelectItem>
                  <SelectItem value="2">Descrição do Youtube</SelectItem>
                </SelectContent>
              </Select>
              
            </div>

            <div className="space-y-3 flex flex-col w-full">
              <Label htmlFor="select">Modulo</Label>
              <Select defaultValue="1" disabled>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>
              <span className="block text-muted-foreground text-xs italic">
                Você poderá customizar essa opção em breve
              </span>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label htmlFor="temperatura">Temperatura</Label>

              <Slider min={0} max={1} step={0.1} />

              <span className="block text-muted-foreground text-xs leading-relaxed">
                Valores mais altos tendem a deixar o resultado mais criativo e
                com possíveis erros.
              </span>
            </div>

            <Separator />

            <Button type="submit" className="w-full">
              <Wand2 className="w-4 h-4 mr-2" />
              Executar
            </Button>
          </form>
        </aside>
      </main>
    </div>
  );
}
