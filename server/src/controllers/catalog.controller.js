import {
  getAssets as fetchAssets,
  getCourses as fetchCourses,
  getAssetById as fetchAssetById,
  getCourseById as fetchCourseById
} from "../services/dataStore.js";

function ok(res, data) {
  return res.json({ ok: true, data });
}

function fail(res, message, status = 400) {
  return res.status(status).json({ ok: false, message });
}

export const getAssets = (req, res) => {
  const assets = fetchAssets();
  return ok(res, assets);
};

export const getCourses = (req, res) => {
  const courses = fetchCourses();
  return ok(res, courses);
};

export const getAssetById = (req, res) => {
  const { assetId } = req.params;
  const asset = fetchAssetById(assetId);

  if (!asset) return fail(res, `Asset not found: ${assetId}`, 404);
  return ok(res, asset);
};

export const getCourseById = (req, res) => {
  const { courseId } = req.params;
  const course = fetchCourseById(courseId);

  if (!course) return fail(res, `Course not found: ${courseId}`, 404);
  return ok(res, course);
};
