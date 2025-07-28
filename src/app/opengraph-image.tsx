import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Prescription Manager";
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 60,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 20,
        }}
      >


        {/* Tagline */}
        <div
          style={{
            fontSize: 64,
            fontWeight: 300,
            textAlign: "center",
            maxWidth: "80%",
            lineHeight: 1.2,
          }}
        >
          Streamline your pharmacy operations
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 24,
            color: "#666",
            textAlign: "center",
            maxWidth: "70%",
            lineHeight: 1.4,
          }}
        >
          Register medicines, create prescriptions, and manage your pharmacy - all with a beautiful modern interface.
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
