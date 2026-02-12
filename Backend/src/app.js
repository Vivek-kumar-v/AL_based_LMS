import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import axios from "axios";


const app = express()


app.use(
    cors({
      origin: process.env.CORS_ORIGIN, // Vite frontend
      credentials: true
    })
  );

  app.use(express.json({limit: "16kb"}))
  app.use(express.urlencoded({extended: true, limit: "16kb"}))
  app.use(express.static("public"))
  app.use(cookieParser())  

  // Routes import
  import studentRoute from "./routes/student.route.js"
  import documentRoute from "./routes/Document.route.js"
  import searchRoutes from "./routes/search.routes.js";
  import dashboardRoutes from "./routes/dashboard.routes.js";
  import revisionRoutes from "./routes/revision.routes.js";
  import conceptRoutes from "./routes/concept.routes.js";

  // health-check endpoint
  app.get("/api/v1/health", (req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() })
  })

  app.get("/api/v1/health/ocr", async (req, res) => {
    try {
      const OCR_URL = process.env.OCR_SERVER_URL;
  
      const response = await axios.get(`${OCR_URL}/health`, {
        timeout: 10000,
      });
  
      return res.status(200).json({
        status: "ok",
        ocr: response.data,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return res.status(500).json({
        status: "fail",
        message: "OCR service is down",
        error: err.message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Routes setup
  app.use("/api/v1/users", studentRoute)
  app.use("/api/v1/documents", documentRoute)
  app.use("/api/v1/search", searchRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/revision", revisionRoutes);
  app.use("/api/v1/concepts", conceptRoutes);



export { app }