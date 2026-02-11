📦 project-root
┃
┣━━ 🛠️ FEATURE 1: THE CATALOG (Library)
┃   ┣━━ 📂 Folder: server/src/routes/catalog.routes.js
┃   ┣━━ 📍 Route:  GET  /api/catalog
┃   ┗━━ 💻 UI:      client/src/components/PathView.jsx
┃
┣━━ 👤 FEATURE 2: USER PROGRESS (Memory)
┃   ┣━━ 📂 Folder: server/src/routes/user.routes.js
┃   ┣━━ 📍 Route:  GET  /api/user/:userId
┃   ┣━━ 📍 Route:  POST /api/user/:userId/event
┃   ┗━━ 💻 UI:      client/src/components/StatTiles.jsx
┃
┣━━ 🧠 FEATURE 3: THE BRAIN (Recommendation)
┃   ┣━━ 📂 Folder: server/src/services/engine.service.js
┃   ┣━━ 📍 Route:  GET  /api/engine/:userId/next
┃   ┗━━ 💻 UI:      client/src/components/NextAssetCard.jsx
┃
┗━━ 🧪 FEATURE 4: THE SIMULATOR (Judge Demo)
    ┣━━ 📂 Folder: server/src/routes/engine.routes.js
    ┣━━ 📍 Route:  POST /api/engine/:userId/simulate
    ┗━━ 💻 UI:      client/src/pages/Simulate.jsx
