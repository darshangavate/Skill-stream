import express from "express";
import { getDashboard, getAllUsers, enrollInCourse ,getUserEnrollments} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/", (req, res) => res.json({ message: "Hello from User" }));

router.get("/all", getAllUsers);           // ✅ /api/user/all
router.get("/:userId/dashboard", getDashboard);
router.post("/:userId/enroll/:courseId", enrollInCourse);
router.get("/:userId/enrollments", getUserEnrollments);



export default router;
