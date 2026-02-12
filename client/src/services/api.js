const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const json = await res.json();

  // IMPORTANT: your backend wraps everything in { ok, data }
  if (!json.ok) throw new Error(json.message || "Request failed");
  return json.data;
}



export const api = {
  getDashboard: (userId) => request(`/api/user/${userId}/dashboard`),
  getEnrollments: (userId) => request(`/api/user/${userId}/enrollments`), // ✅ THIS
  // ✅ NEW: list courses
  getCourses: () => request(`/api/catalog/courses`),

  // ✅ NEW: enroll (creates enrollment + path)
  enroll: (userId, courseId) =>
    request(`/api/user/${userId}/enroll/${encodeURIComponent(courseId)}`, {
      method: "POST",
    }),

  getAssetById: (assetId) => request(`/api/catalog/assets/${encodeURIComponent(assetId)}`),

  getQuiz: (userId, topic) =>
    request(`/api/engine/${userId}/quiz?topic=${encodeURIComponent(topic)}`),

  submitQuiz: (userId, payload) =>
    request(`/api/engine/${userId}/quiz/submit`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

