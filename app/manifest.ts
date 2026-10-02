import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gen Uprising",
    short_name: "Gen Uprising",
    description: "Gen Uprising editorial archive.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a08",
    theme_color: "#0a0a08",
    icons: [{ src: "/logo.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
