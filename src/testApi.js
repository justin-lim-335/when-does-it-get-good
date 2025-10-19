// src/testApi.js
import fetch from "node-fetch";

const API_BASE = process.env.API_BASE || "http://localhost:3001";

// ✅ Replace these with a real user_id and show_tmdb_id that exist in your DB
const TEST_USER_ID = "8373f35a-f58d-46f2-8092-d35c30a43331";
const TEST_SHOW_ID = 40075;

async function test() {
  // Helper to log section
  const log = (label, ...args) => console.log(`\n=== ${label} ===`, ...args);

  // 1️⃣ GET user vote
  try {
    const res = await fetch(`${API_BASE}/votes/${TEST_USER_ID}/${TEST_SHOW_ID}`);
    const data = await res.json();
    log("GET vote", "status:", res.status, "response:", data);
  } catch (err) {
    log("GET vote error", err);
  }

  // 2️⃣ POST submit-vote
  const postPayload = {
    user_id: TEST_USER_ID,
    show_tmdb_id: TEST_SHOW_ID,
    season: 1,
    episode: 1,
    episode_title: "Pilot",
    absolute_number: 1,
  };

  try {
    console.log("POST payload:", postPayload);

    const res = await fetch(`${API_BASE}/submit-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(postPayload),
    });
    const data = await res.json();
    log("POST submit-vote", "status:", res.status, "response:", data);
  } catch (err) {
    log("POST submit-vote error", err);
  }

  // 3️⃣ PATCH update-vote
  const patchPayload = {
    season: 1,
    episode: 2,
    episode_title: "Second Episode",
    absolute_number: 2,
  };

  try {
    console.log("PATCH payload:", patchPayload);

    const res = await fetch(
      `${API_BASE}/update-vote/${TEST_USER_ID}/${TEST_SHOW_ID}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patchPayload),
      }
    );
    const data = await res.json();
    log("PATCH update-vote", "status:", res.status, "response:", data);
  } catch (err) {
    log("PATCH update-vote error", err);
  }

  // 4️⃣ DELETE vote
  try {
    const res = await fetch(`${API_BASE}/delete-vote/${TEST_USER_ID}/${TEST_SHOW_ID}`, {
      method: "DELETE",
    });
    const data = await res.json();
    log("DELETE vote", "status:", res.status, "response:", data);
  } catch (err) {
    log("DELETE vote error", err);
  }
}

test();
