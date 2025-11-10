import express from "express";
import { userRouter } from "./routes/userRoute.js";
import { verifyToken } from "./middlewares/verifyToken.js";
import { tokenRouter } from "./routes/tokenRoutes.js";
import { questionRouter } from "./routes/questionRoutes.js";
import { statRouter } from "./routes/statsRoute.js"; 
import cors from "cors";

const app = express();
const port = process.env.PORT || 8000;

// CORS config
app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// Processing tokens
app.use(verifyToken);

// Routes
app.use("/api/users", userRouter);
app.use("/api/stats", statRouter);
app.use("/api/tokens", tokenRouter);
app.use("/api/questions", questionRouter);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "hello from the gdg webdev platform api",
    data: null,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
