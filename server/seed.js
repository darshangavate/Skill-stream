import mongoose from "mongoose";
import { connectDB } from "./src/config/db.js";
import User from "./src/models/User.js";
import Course from "./src/models/Course.js";
import Enrollment from "./src/models/Enrollment.js";
import Question from "./src/models/Question.js";
import Attempt from "./src/models/Attempt.js";
import Path from "./src/models/Path.js";
import Asset from "./src/models/Asset.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log("Clearing existing data...");
    await Promise.all([
      User.deleteMany({}),
      Course.deleteMany({}),
      Enrollment.deleteMany({}),
      Question.deleteMany({}),
      Attempt.deleteMany({}),
      Path.deleteMany({}),
      Asset.deleteMany({}),
    ]);

    // Load JSON files
    const dataDir = path.join(__dirname, "src/data");

    const users = JSON.parse(fs.readFileSync(path.join(dataDir, "users.json"), "utf8"));
    const courses = JSON.parse(fs.readFileSync(path.join(dataDir, "courses.json"), "utf8"));
    const enrollments = JSON.parse(fs.readFileSync(path.join(dataDir, "enrollments.json"), "utf8"));
    const questions = JSON.parse(fs.readFileSync(path.join(dataDir, "questions.json"), "utf8"));
    const attempts = JSON.parse(fs.readFileSync(path.join(dataDir, "attempts.json"), "utf8"));
    const paths = JSON.parse(fs.readFileSync(path.join(dataDir, "paths.json"), "utf8"));
    const assets = JSON.parse(fs.readFileSync(path.join(dataDir, "assets.json"), "utf8"));

    // Seed data
    console.log("Seeding Users...");
    await User.insertMany(users);
    console.log(`✓ ${users.length} users inserted`);

    console.log("Seeding Courses...");
    await Course.insertMany(courses);
    console.log(`✓ ${courses.length} courses inserted`);

    console.log("Seeding Enrollments...");
    await Enrollment.insertMany(enrollments);
    console.log(`✓ ${enrollments.length} enrollments inserted`);

    console.log("Seeding Questions...");
    await Question.insertMany(questions);
    console.log(`✓ ${questions.length} questions inserted`);

    console.log("Seeding Attempts...");
    await Attempt.insertMany(attempts);
    console.log(`✓ ${attempts.length} attempts inserted`);

    console.log("Seeding Paths...");
    await Path.insertMany(paths);
    console.log(`✓ ${paths.length} paths inserted`);

    console.log("Seeding Assets...");
    await Asset.insertMany(assets);
    console.log(`✓ ${assets.length} assets inserted`);

    console.log("\n✓ Database seeded successfully!");
    process.exit(0);
  } catch (error) {
    console.error("✗ Seed failed:", error.message);
    process.exit(1);
  }
};

seedData();
