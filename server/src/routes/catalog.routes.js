import express from "express";
import {
  getAssets,
  getCourses,
  getAssetById,
  getCourseById
} from "../controllers/catalog.controller.js";

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ message: 'Hello from Catalog' });
});

router.get("/assets", getAssets);
router.get("/courses", getCourses);
router.get("/assets/:assetId", getAssetById);
router.get("/courses/:courseId", getCourseById);

export default router;
