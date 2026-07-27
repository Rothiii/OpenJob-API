import cors from "cors";
import express from "express";

const app = express();

app.use(
	cors({
		origin: "*",
	}),
);
app.use(express.json());
app.use("/helloworld", (req, res) => {
	res.json({ message: "Hello, World!" });
});

export default app;