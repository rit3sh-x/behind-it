import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { audio_data } = await req.json();
        const backendRes = await fetch(process.env.INFERENCE_URL!, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ audio_data }),
        });

        if (!backendRes.ok) {
            return NextResponse.json({ error: "Inference failed" }, { status: 500 });
        }

        const data = await backendRes.json();
        return NextResponse.json(data);
    } catch (error) {
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}