import { serve } from "bun";

const PORT = process.env.PORT || 8088;
const BASE_URL = "https://api.telegram.org";
const TOKEN =
  process.env.TOKEN || "6802867045:AAFeEtNpltFcRvVI3B07MuTwum6NjaYohOA";

serve({
  port: PORT,
  async fetch(request) {
    try {
      const { method } = request;
      const { pathname } = new URL(request.url);

      if (method === "GET" && pathname.startsWith("/file/")) {
        if (!TOKEN) throw new Error("Token not found");
        const id = pathname.split("/")[2];
        if (!id) throw new Error("Invalid ID");

        const resp1 = await fetch(
          `${BASE_URL}/bot${TOKEN}/getFile?file_id=${id}`
        );
        if (!resp1.ok) throw new Error("Failed to fetch file info");

        const resp1Json: any = await resp1.json();
        const filePath = resp1Json.result && resp1Json.result.file_path;
        if (!filePath) throw new Error("File path not found");

        const resp2 = await fetch(`${BASE_URL}/file/bot${TOKEN}/${filePath}`);
        if (!resp2.ok) throw new Error("Failed to fetch file content");

        const buffer = await resp2.arrayBuffer();
        return new Response(buffer, {
          headers: { "Content-Type": "application/octet-stream" },
        });
      }
    } catch (error: any) {
      console.error("Error:", error.message);
      return new Response("Internal Server Error", { status: 500 });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Listening on http://localhost:${PORT} ...`);
