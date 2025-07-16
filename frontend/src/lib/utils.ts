import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { ApiResponse, LayerData, VisualizationData } from "@/types";
import { EMOJI_MAP } from "@/constants/emoji-map";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function analyzeAudio(file: File): Promise<ApiResponse> {
  const arrayBuffer = await file.arrayBuffer();
  const base64String = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );

  const response = await fetch(process.env.NEXT_PUBLIC_INFERENCE_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ audio_data: base64String }),
  });

  if (!response.ok) {
    throw new Error("Audio analysis failed");
  }

  return response.json();
}

export function getEmojiForClass(className: string): string {
  return EMOJI_MAP[className] || "🔈";
}

export function splitLayers(visualization: VisualizationData) {
  const main: [string, LayerData][] = [];
  const internals: Record<string, [string, LayerData][]> = {};

  for (const [name, data] of Object.entries(visualization)) {
    if (!name.includes(".")) {
      main.push([name, data]);
    } else {
      const [parent] = name.split(".");
      if (parent === undefined) continue;

      if (!internals[parent]) internals[parent] = [];
      internals[parent].push([name, data]);
    }
  }

  return { main, internals };
}