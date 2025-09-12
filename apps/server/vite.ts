// @ts-nocheck
import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

  // Import React plugin with correct path
  const reactPlugin = await import('../../node_modules/@vitejs/plugin-react/dist/index.js');
  const react = reactPlugin.default || reactPlugin;

  // Set up correct paths for Vite
  const projectRoot = path.resolve(__dirname, "../../");
  const clientRoot = path.resolve(projectRoot, "client");
  
  // Use inline config to avoid temp file generation and import issues
  const vite = await createViteServer({
    root: clientRoot,
    configFile: false, // Prevent Vite from loading config file and creating temp files
    cacheDir: path.resolve(projectRoot, '.vite-dev-cache'),
    plugins: [react()],
    server: { 
      middlewareMode: true, 
      hmr: { server },
      watch: { 
        ignored: ['**/node_modules/.vite-temp/**', '**/.vite-temp/**', '**/node_modules/**'] 
      },
      // Allow Replit host
      host: true,
      allowedHosts: [
        "96c14a12-0c35-4094-bb9e-82e96ecfc487-00-cpe54o4q2gk3.spock.replit.dev",
        ".replit.dev",
        ".replit.app",
        "localhost"
      ]
    },
    appType: "custom",
    resolve: {
      alias: {
        "@": path.resolve(clientRoot, "./src"),
        "@assets": path.resolve(clientRoot, "./assets"),
        "@lib": path.resolve(clientRoot, "./src/lib"),
        "@shared": path.resolve(projectRoot, "./shared"),
      },
    },
  });

  app.use(vite.middlewares);
  
  // Serve index.html for root and all navigation requests
  const serveHtml = async (req: any, res: any, next: any) => {
    // Skip non-GET requests and non-HTML requests
    if (req.method !== "GET" || (req.headers.accept && !req.headers.accept.includes("text/html"))) {
      return next();
    }

    try {
      const template = await fs.promises.readFile(
        path.resolve(clientRoot, "index.html"),
        "utf-8",
      );
      
      const html = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(html);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  };
  
  // Explicitly handle root path
  app.get("/", serveHtml);
  
  // Handle all other paths that might be client-side routes
  app.use("*", serveHtml);
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