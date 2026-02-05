import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"


const app = express()


app.use(
    cors({
      origin: "http://localhost:5173", // Vite frontend
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


  // Routes setup
  app.use("/api/v1/users", studentRoute)
  app.use("/api/v1/documents", documentRoute)
  app.use("/api/v1/search", searchRoutes);
  app.use("/api/v1/dashboard", dashboardRoutes);
  app.use("/api/v1/revision", revisionRoutes);
  app.use("/api/v1/concepts", conceptRoutes);



export { app }