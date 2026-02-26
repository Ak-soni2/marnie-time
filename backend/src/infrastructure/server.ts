import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "../adapters/inbound/http/routes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", routes);

app.listen(process.env.PORT || 4000, () => {
    console.log("Server running on port 4000");
});