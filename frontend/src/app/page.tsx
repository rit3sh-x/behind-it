"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { ColorScale } from "@/components/color-scale";
import { FeatureMap } from "@/components/feature-map";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Waveform } from "@/components/waveforms";
import { analyzeAudio, getEmojiForClass, splitLayers } from "@/lib/utils";
import { toast } from "sonner";



export default function HomePage() {
  const [fileName, setFileName] = useState("");

  const audioAnalysisMutation = useMutation({
    mutationFn: analyzeAudio,
    onSuccess: () => {
      toast.success("Audio analysis successful!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? `Audio analysis failed: ${error.message}`
          : "Audio analysis failed."
      );
    },
  });

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    audioAnalysisMutation.mutate(file);
  };

  const { main, internals } = audioAnalysisMutation.data?.visualization
    ? splitLayers(audioAnalysisMutation.data.visualization)
    : { main: [], internals: {} };

  return (
    <main className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-[100%]">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-light tracking-tight text-foreground">
            Audio Visualizer
          </h1>
          <p className="text-md mb-8 text-foreground">
            Upload a WAV file to see the model's predictions and feauture maps
          </p>

          <div className="flex flex-col items-center">
            <div className="relative inline-block cursor-pointer">
              <input
                aria-label="Input"
                type="file"
                accept=".wav"
                id="file-upload"
                onChange={handleFileChange}
                disabled={audioAnalysisMutation.isPending}
                className="absolute inset-0 w-full opacity-0 cursor-pointer"
              />
              <Button
                disabled={audioAnalysisMutation.isPending}
                className="border-muted-foreground cursor-pointer"
                variant="outline"
                size="lg"
              >
                {audioAnalysisMutation.isPending ? "Analysing..." : "Choose File"}
              </Button>
            </div>

            {fileName && (
              <Badge
                variant="secondary"
                className="mt-4 bg-muted text-foreground/90"
              >
                {fileName}
              </Badge>
            )}
          </div>
        </div>

        {audioAnalysisMutation.isError && (
          <Card className="mb-8 border-red-200 bg-red-50">
            <CardContent>
              <p className="text-red-600">
                Error: {audioAnalysisMutation.error instanceof Error
                  ? audioAnalysisMutation.error.message
                  : "An unknown error occurred"}
              </p>
            </CardContent>
          </Card>
        )}

        {audioAnalysisMutation.data && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-foreground">
                  Top Predictions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {audioAnalysisMutation.data.predictions.slice(0, 3).map((pred, i) => (
                    <div key={pred.class} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-md font-medium text-foreground/90">
                          {getEmojiForClass(pred.class)}{" "}
                          <span>{pred.class.replaceAll("_", " ")}</span>
                        </div>
                        <Badge variant={i === 0 ? "default" : "secondary"}>
                          {(pred.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={pred.confidence * 100} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader className="text-foreground">
                  <CardTitle className="text-foreground">
                    Input Spectrogram
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <FeatureMap
                    data={audioAnalysisMutation.data.input_spectrogram.values}
                    title={`${audioAnalysisMutation.data.input_spectrogram.shape.join(" x ")}`}
                    spectrogram
                  />

                  <div className="mt-5 flex justify-end">
                    <ColorScale width={200} height={16} min={-1} max={1} />
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-foreground">
                    Audio Waveform
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Waveform
                    data={audioAnalysisMutation.data.waveform.values}
                    title={`${audioAnalysisMutation.data.waveform.duration.toFixed(2)}s * ${audioAnalysisMutation.data.waveform.sample_rate}Hz`}
                  />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Convolutional Layer Outputs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-6">
                  {main.map(([mainName, mainData]) => (
                    <div key={mainName} className="space-y-4">
                      <div>
                        <h4 className="mb-2 font-medium text-foreground/90">
                          {mainName}
                        </h4>
                        <FeatureMap
                          data={mainData.values}
                          title={`${mainData.shape.join(" x ")}`}
                        />
                      </div>

                      {internals[mainName] && (
                        <div className="h-80 overflow-y-auto rounded border border-muted-foreground bg-background p-2">
                          <div className="space-y-2">
                            {internals[mainName]
                              .sort(([a], [b]) => a.localeCompare(b))
                              .map(([layerName, layerData]) => (
                                <FeatureMap
                                  key={layerName}
                                  data={layerData.values}
                                  title={layerName.replace(`${mainName}.`, "")}
                                  internal={true}
                                />
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                <div className="mt-5 flex justify-end">
                  <ColorScale width={200} height={16} min={-1} max={1} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}