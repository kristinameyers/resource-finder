// @ts-nocheck
import express from "express";
import fs from "fs";
import path from "path";

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit", 
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

export async function setupVite(app: any, server: any) {
  // Skip Vite setup in production
  if (process.env.NODE_ENV === "production") {
    console.log("Production mode: skipping Vite setup");
    return;
  }

  // Use dynamic import to handle ESM/CJS interop - import from node_modules
  const mod = await import('../../node_modules/vite/dist/node/index.js');
  const createViteServer = mod.createServer ?? mod.default?.createServer;
  
  if (typeof createViteServer !== 'function') {
    console.warn('Vite createServer not available, skipping Vite setup');
    return;
  }

  const vite = await createViteServer({
    server: { middlewareMode: true, hmr: { server } },
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  app.use("*", async (req: any, res: any, next: any) => {
    const url = req.originalUrl;

    try {
      const template = fs.readFileSync(
        path.resolve("client/index.html"),
        "utf-8",
      );
      
      const html = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: any) {
  const distPath = path.resolve("dist/public");
  
  if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
  }
  
  app.use("*", (_req: any, res: any) => {
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
      res.sendFile(indexPath);
    } else {
      res.status(404).send("Application not built. Please run build first.");
    }
  });
}