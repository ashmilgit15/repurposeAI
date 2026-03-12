import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/seo";

export const alt = `${siteConfig.name} social preview`;
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "radial-gradient(circle at top left, rgba(79,70,229,0.9), rgba(2,6,23,1) 45%), linear-gradient(135deg, #02040a 10%, #0f172a 100%)",
          color: "white",
          padding: "64px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              width: "88px",
              height: "88px",
              borderRadius: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
              fontSize: "44px",
              fontWeight: 800,
            }}
          >
            R
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: "30px", opacity: 0.75 }}>RepurposeAI</div>
            <div style={{ fontSize: "22px", color: "#a5b4fc" }}>AI content repurposing for growth teams</div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "24px", maxWidth: "900px" }}>
          <div style={{ fontSize: "76px", lineHeight: 1.05, fontWeight: 900 }}>
            Turn one article into platform-ready posts.
          </div>
          <div style={{ fontSize: "30px", lineHeight: 1.4, color: "#cbd5e1" }}>
            Convert blog posts and newsletters into X threads, LinkedIn posts, Instagram captions, and more.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "18px",
            color: "#cbd5e1",
            fontSize: "22px",
          }}
        >
          <div style={{ padding: "14px 22px", borderRadius: "999px", background: "rgba(255,255,255,0.08)" }}>
            3 free jobs/month
          </div>
          <div style={{ padding: "14px 22px", borderRadius: "999px", background: "rgba(255,255,255,0.08)" }}>
            12+ output formats
          </div>
        </div>
      </div>
    ),
    size,
  );
}
