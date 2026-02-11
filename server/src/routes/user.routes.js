import express from "express";
import { getDashboard } from "../controllers/user.controller.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from User' });
});

router.get("/:userId/dashboard", getDashboard);

export default router;