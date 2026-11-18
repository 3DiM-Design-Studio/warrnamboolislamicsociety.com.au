import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/content/site";

// The picture shown when a link to the site is shared on WhatsApp, Facebook, X and similar.
export async function shareImage() {
  const logo = await readFile(path.join(process.cwd(), "public", "logo.jpg"));
  const src = `data:image/jpeg;base64,${logo.toString("base64")}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 90px",
          background: "linear-gradient(135deg, #0b0d0b 0%, #12301c 100%)",
          color: "#fff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} width={240} height={240} alt="" style={{ borderRadius: 120, marginRight: 64 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 28, color: "#c9f26b", letterSpacing: 4, textTransform: "uppercase" }}>Warrnambool, Victoria</div>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, marginTop: 14 }}>{site.name}</div>
          <div style={{ fontSize: 30, color: "rgba(255,255,255,0.75)", marginTop: 20, maxWidth: 640, lineHeight: 1.35 }}>
            Service, education and empowerment for our community.
          </div>
          <div style={{ width: 140, height: 8, borderRadius: 4, marginTop: 34, background: "linear-gradient(90deg, #c9f26b, #00bf2e)" }} />
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
