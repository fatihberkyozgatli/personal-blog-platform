import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const alt = SITE_NAME;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#6E1423",
          fontFamily: "serif",
          padding: 96,
          textAlign: "center",
        }}
      >
        <div style={{ width: 90, height: 3, background: "#D8B564", marginBottom: 40 }} />
        <div style={{ fontSize: 76, fontWeight: 700, color: "#F7EFDD", lineHeight: 1.1 }}>
          {SITE_NAME}
        </div>
        <div style={{ fontSize: 34, color: "#D8B564", marginTop: 28, letterSpacing: 2 }}>
          Thoughts · Stories · Reflections
        </div>
        <div style={{ width: 90, height: 3, background: "#D8B564", marginTop: 40 }} />
      </div>
    ),
    { ...size },
  );
}
