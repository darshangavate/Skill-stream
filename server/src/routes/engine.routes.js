import express from "express";
import {
  getQuiz,
  submitQuiz
} from "../controllers/engine.controller.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from Engine' });
});

router.get("/:userId/quiz", getQuiz);
router.post("/:userId/quiz/submit", submitQuiz);

export default router;