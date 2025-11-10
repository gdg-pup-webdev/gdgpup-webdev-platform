import express from "express";
import { userRouter } from "./routes/userRoute.js";
import { verifyToken } from "./middlewares/verifyToken.js"; 
import { tokenRouter } from "./routes/tokenRoutes.js";
import { questionRouter } from "./routes/questionRoutes.js";
import { statRouter } from "./routes/statsRoute.js";

const app = express();
const port = process.env.PORT || 8000;

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
  res.send("gdg webdev platform api");
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
