import express from "express";
import { router as helloRouter } from "./routes/hello.js";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());

// Routes
app.use("/api/test", helloRouter);

app.get("/", (req, res) => {
  res.send("🚀 Express + TypeScript server is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
