import { serve } from "bun";

const PORT = process.env.PORT || 8088;
const BASE_URL = "https://api.telegram.org";
const TOKEN = process.env.TOKEN || "";
const TTL = parseInt(process.env.TTL || "60"); // in minutes

let caches: any = [];

const findCacheById = (id: string) => {
  const cache = caches.find((c: any) => c.id === id);
  if (cache) {
    const now = new Date();
    const differenceMs = Math.abs(
      now.getTime() - (cache.date as Date).getTime()
    );
    const differenceMinutes = differenceMs / (1000 * 60);
    if (differenceMinutes < TTL) return cache;
  }
  return null;
};

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

        let filePath;

        const cache = findCacheById(id);
        if (cache) {
          filePath = cache.path;
        } else {
          const resp1 = await fetch(
            `${BASE_URL}/bot${TOKEN}/getFile?file_id=${id}`
          );
          if (!resp1.ok) throw new Error("Failed to fetch file info");

          const resp1Json: any = await resp1.json();
          filePath = resp1Json.result && resp1Json.result.file_path;
          const cache = {
            id,
            path: filePath,
            date: new Date(),
          };
          caches = [...caches.filter((c: any) => c.id !== id), cache];
        }
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
