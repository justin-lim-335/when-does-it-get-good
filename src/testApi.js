import fetch from "node-fetch"; // if using Node.js <18, otherwise fetch is global

const API_BASE = "https://getgood-api.onrender.com"; // change if needed
const TEST_USER_ID = "8373f35a-f58d-46f2-8092-d35c30a43331"; // replace with a real user ID
const TEST_SHOW_ID = 40075; // replace with a real TMDB show ID

async function testApi() {
  try {
    console.log("1️⃣ Testing GET vote...");
    let res = await fetch(`${API_BASE}/votes/${TEST_USER_ID}/${TEST_SHOW_ID}`);
    console.log("GET status:", res.status);
    const getData = await res.text();
    console.log("GET response:", getData);

    console.log("\n2️⃣ Testing POST submit-vote...");
    res = await fetch(`${API_BASE}/submit-vote`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: TEST_USER_ID,
        show_tmdb_id: TEST_SHOW_ID,
        season_number: 1,
        episode_number: 1,
        absolute_number: 1,
      }),
    });
    console.log("POST status:", res.status);
    const postData = await res.text();
    console.log("POST response:", postData);

    console.log("\n3️⃣ Testing PATCH update-vote...");
    res = await fetch(`${API_BASE}/update-vote/${TEST_USER_ID}/${TEST_SHOW_ID}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ absolute_number: 2 }),
    });
    console.log("PATCH status:", res.status);
    const patchData = await res.text();
    console.log("PATCH response:", patchData);

    console.log("\n4️⃣ Testing DELETE vote...");
    res = await fetch(`${API_BASE}/delete-vote/${TEST_USER_ID}/${TEST_SHOW_ID}`, {
      method: "DELETE",
    });
    console.log("DELETE status:", res.status);
    const deleteData = await res.text();
    console.log("DELETE response:", deleteData);

    console.log("\n✅ Test complete!");
  } catch (err) {
    console.error("Test script error:", err);
  }
}

testApi();
