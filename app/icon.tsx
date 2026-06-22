import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#6E1423",
          color: "#D8B564",
          fontSize: 46,
          fontWeight: 700,
          fontFamily: "serif",
        }}
      >
        P
      </div>
    ),
    { ...size },
  );
}
