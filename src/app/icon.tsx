import { ImageResponse } from "next/og";

export const size = {
  width: 512,
  height: 512,
};

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
          background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
          color: "white",
          borderRadius: "112px",
          fontSize: "260px",
          fontWeight: 900,
          letterSpacing: "-0.08em",
        }}
      >
        R
      </div>
    ),
    size,
  );
}
