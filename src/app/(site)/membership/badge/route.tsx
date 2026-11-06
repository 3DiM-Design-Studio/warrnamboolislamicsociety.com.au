import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";

// A shareable "I'm officially a member" card. The name comes from the query string, so it is
// only ever drawn as text on the image.
export async function GET(req: Request) {
  const raw = new URL(req.url).searchParams.get("name") ?? "";
  const name = raw.replace(/\s+/g, " ").trim().slice(0, 40) || "A new member";
  const logo = await readFile(path.join(process.cwd(), "public/logo.jpg"));
  const logoSrc = `data:image/jpeg;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-end",
        background: "#00bf2e",
        color: "#0b1f12",
        padding: 60,
        textAlign: "left",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={logoSrc}
        width={260}
        height={260}
        alt=""
        style={{
          position: "absolute",
          top: 60,
          left: 60,
          borderRadius: 130,
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          width: "100%",
          padding: 64,
          borderRadius: 40,
          background: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
          }}
        >
          I am officially a member of
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 16,
            fontSize: 84,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          Warrnambool Islamic Society
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginTop: 56,
            padding: "20px 48px",
            borderRadius: 999,
            background: "#c9f26b",
            fontSize: 52,
            fontWeight: 700,
          }}
        >
          <svg
            width="56"
            height="56"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#0b1f12"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
          </svg>
          {name}
        </div>
        <div style={{ display: "flex", marginTop: 56, fontSize: 30 }}>
          Join us at warrnamboolislamicsociety.com.au
        </div>
      </div>
    </div>,
    { width: 1200, height: 1200 },
  );
}
