import React, { useEffect, useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import "./SidebarLayout.css";
import { api } from "../../services/api";

/*
  Layout Responsibility:
  - render sidebar
  - render topbar
  - fetch global user state
  - provide course switcher
*/

export default function SidebarLayout() {

  const nav = useNavigate();
  const location = useLocation();

  // 🔹 TEMP USER (later replace with auth context)
  const userId = "u-emp-02";

  // ---------- STATE ----------
  const [dashboard, setDashboard] = useState(null);     // current active course + user info
  const [enrollments, setEnrollments] = useState([]);   // ALL enrolled courses
  const [open, setOpen] = useState(false);              // dropdown open/close

  // ---------- LOAD GLOBAL DATA ----------
  useEffect(() => {
    async function load() {
      try {
        // fetch active state
        const dash = await api.getDashboard(userId);

        // fetch ALL enrollments for dropdown
        const list = await api.getEnrollments(userId);

        setDashboard(dash);
        setEnrollments(list);
      } catch (err) {
        console.error("Layout load error:", err);
      }
    }

    load();
  }, []);

  // ---------- HELPERS ----------
  const isActive = (path) => location.pathname === path;

  const currentCourse =
    dashboard?.course?.title || "Select Course";

  // Switch course handler
  async function switchCourse(courseId) {
    try {
      await api.enroll(userId, courseId); // backend switches active
      setOpen(false);
      window.location.reload(); // MVP refresh
    } catch (err) {
      console.error("Switch course failed:", err);
    }
  }

  // ---------- RENDER ----------
  return (
    <div className="ss-shell">

      {/* =======================================================
            LEFT SIDEBAR
      ======================================================= */}
      <aside className="ss-sidebar">

        {/* Brand */}
        <div className="ss-brand">
          <div className="ss-logo">⚡</div>
          <div className="ss-brand-name">SkillStream</div>
        </div>

        <div className="ss-subtitle">Dynamic Upskilling Engine</div>

        {/* Navigation */}
        <nav className="ss-nav">

          <button
            className={`ss-navitem ${isActive("/") ? "active" : ""}`}
            onClick={() => nav("/")}
          >
            ● Dashboard
          </button>

          <button
            className={`ss-navitem ${isActive("/courses") ? "active" : ""}`}
            onClick={() => nav("/courses")}
          >
            ▦ Courses
          </button>

          <button
            className={`ss-navitem ${isActive("/path") ? "active" : ""}`}
            onClick={() => nav("/path")}
          >
            ⧉ My Path
          </button>

          <button
            className={`ss-navitem ${isActive("/quiz") ? "active" : ""}`}
            onClick={() => nav("/quiz")}
          >
            ☑ Quiz
          </button>

        </nav>

        {/* User Panel */}
        <div className="ss-sidebottom">
          <div className="ss-user">

            <div className="ss-useravatar">
              {(dashboard?.user?.name || "U")[0]}
            </div>

            <div>
              <div className="ss-username">
                {dashboard?.user?.name || "Loading"}
              </div>

              <div className="ss-userrole">
                {dashboard?.user?.role || ""}
              </div>
            </div>

          </div>
        </div>

      </aside>



      {/* =======================================================
            MAIN CONTENT AREA
      ======================================================= */}
      <main className="ss-main">

        {/* ================= TOPBAR ================= */}
        <div className="ss-topbar">

          {/* COURSE SWITCHER */}
          <div
            className="ss-course"
            onClick={() => setOpen(!open)}
          >
            <div className="ss-course-name">
              {currentCourse}
            </div>

            <div className="ss-course-caret">▾</div>
          </div>


          {/* DROPDOWN LIST */}
          {open && (
            <div className="ss-dropdown">

              {enrollments.length === 0 && (
                <div className="ss-dropdown-item muted">
                  No enrolled courses
                </div>
              )}

              {enrollments.map(e => (
                <div
                  key={e.courseId}
                  className={`ss-dropdown-item ${
                    dashboard?.course?.courseId === e.courseId
                      ? "active"
                      : ""
                  }`}
                  onClick={() => switchCourse(e.courseId)}
                >
                  {e.courseId}
                </div>
              ))}

            </div>
          )}


          {/* RIGHT STATUS AREA */}
          <div className="ss-topright">
            <span className="ss-dot" />
            <span>Connected</span>
            <button className="ss-iconbtn">↻</button>
          </div>

        </div>


        {/* PAGE CONTENT */}
        <Outlet />

      </main>
    </div>
  );
}
