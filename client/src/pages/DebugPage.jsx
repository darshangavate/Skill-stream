import { useEffect, useState } from "react";
import api from "../services/api";

export default function DebugPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [courses, users, assets, paths] = await Promise.all([
          api.get("/catalog/courses"),
          api.get("/user"),
          api.get("/catalog/assets"),
          api.get("/engine/paths"),
        ]);

        setData({
          courses: courses.data,
          users: users.data,
          assets: assets.data,
          paths: paths.data,
        });
      } catch (err) {
        console.error(err);
      }
    }

    load();
  }, []);

  if (!data) return <h2>Loading...</h2>;

  return (
    <div style={{ padding: 20 }}>
      <h1>Debug Dashboard</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
