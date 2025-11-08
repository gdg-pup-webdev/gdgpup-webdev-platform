import express from "express";
import { router as helloRouter } from "./routes/hello.js";
import { authRouter } from "./routes/authRoutes.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { restrictRoute } from "./middlewares/restrictRoute.js";

const app = express();
const port = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Processing tokens
app.use(verifyToken);

// Routes
app.use("/api/test", helloRouter);
app.use("/api/auth", authRouter);

// admin only route
app.use(restrictRoute(["admin"]));

app.use("/api/admin", (req, res) => {
  res.json({ message: "Admin route" });
});

app.get("/", (req, res) => {
  res.send("🚀 Express + TypeScript server is running!");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
