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

export const getAssets = async (req, res) => {
  try {
    const assets = await fetchAssets();
    return ok(res, assets);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export const getCourses = async (req, res) => {
  try {
    const courses = await fetchCourses();
    return ok(res, courses);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export const getAssetById = async (req, res) => {
  try {
    const { assetId } = req.params;
    const asset = await fetchAssetById(assetId);

    if (!asset) return fail(res, `Asset not found: ${assetId}`, 404);
    return ok(res, asset);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};

export const getCourseById = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await fetchCourseById(courseId);

    if (!course) return fail(res, `Course not found: ${courseId}`, 404);
    return ok(res, course);
  } catch (error) {
    return fail(res, error.message, 500);
  }
};
