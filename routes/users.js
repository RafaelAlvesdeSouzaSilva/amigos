import express from "express";
import db from "../db.js";
const router = express.Router();

router.get("/", async (req, res) => {
    const [users] = await db.query(
        "SELECT id, nome, email, foto_url FROM usuarios"
    );
    res.json(users);
});

export default router;
