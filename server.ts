import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import apiRouter from "./server/routes";
import { requestLogger, errorHandler } from "./server/middleware";

const app = express();
const PORT = 3000;

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use(requestLogger);

// Mount unified Modular API Routes under /api
app.use("/api", apiRouter);

// Global Error Handler for API routes
app.use(errorHandler);

// ---------------- VITE & STATIC PRODUCTION MIDDLEWARE ----------------

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode: Vite Dev middleware handles Client files & SPA fallback
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        watch: {
          ignored: ["**/database/**", "**/database/**/*", "**/database/*.json"],
        },
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode: Static file serving from pre-compiled dist folder
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ConfHub Backend] Modular architecture server running on http://localhost:${PORT}`);
  });
}

startServer();
