const input = document.getElementById("userInput");
const submitBtn = document.getElementById("submitBtn");
const wordCount = document.getElementById("wordCount");
const tones = document.querySelectorAll(".tone-btn");
const chatArea = document.getElementById("chatArea");
const loadingState = document.getElementById("loadingState");

let selectedTone = null;

/* ===============================
   WORD COUNTER (DEBOUNCED)
================================ */
input.addEventListener("input", () => {
  const words = input.value.trim().split(/\s+/).filter(Boolean);
  wordCount.textContent = words.length;
  submitBtn.disabled = words.length === 0 || !selectedTone;
});

/* ===============================
   TONE SELECTION
================================ */
tones.forEach(btn => {
  btn.addEventListener("click", () => {
    selectedTone = btn.dataset.tone;

    tones.forEach(b => {
      b.classList.remove("active", "faded");
      if (b !== btn) b.classList.add("faded");
    });

    btn.classList.add("active");
    submitBtn.disabled = input.value.trim() === "";
  });
});

/* ===============================
   SUBMIT HANDLER
================================ */
submitBtn.addEventListener("click", async () => {
  const userText = input.value.trim();
  if (!userText || !selectedTone) return;

  input.disabled = true;
  submitBtn.disabled = true;
  loadingState.hidden = false;

  appendMessage("You", userText, "user");

  try {
    //const refined = await callAI(userText, selectedTone);
    appendMessage("Refined Output", refined, "ai");
  } catch (err) {
    appendMessage("System", "Something went wrong. Please try again.", "ai");
    console.error(err);
  } finally {
    loadingState.hidden = true;
    input.value = "";
    wordCount.textContent = "0";
    input.disabled = false;
  }
});

/* ===============================
   MESSAGE RENDERER
================================ */
function appendMessage(label, text, type) {
  const div = document.createElement("div");
  div.className = `message ${type}`;
  div.innerHTML = `<strong>${label}:</strong><br>${text}`;
  chatArea.appendChild(div);
  chatArea.scrollTop = chatArea.scrollHeight;
}

/* ===============================
   TONE PROFILES (CRITICAL)
================================ */
function getToneProfile(tone) {
  const profiles = {
    casual:
      "Use a relaxed, conversational tone. Keep it natural and human. Avoid slang overload.",
    formal:
      "Use a professional, structured, and clear tone. Keep it precise and respectful.",
    dark:
      "Use an introspective, restrained,phsycological and subtle tone. Avoid manipulation or aggression.",
    friendly:
      "Use a warm, supportive, and approachable tone. Be clear and positive."
  };
  return profiles[tone];
}

/* ===============================
   AI API CALL (NETLIFY FUNCTION)
================================ */
async function callAI(text, tone) {
  const res = await fetch("/.netlify/functions/ai", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ text, tone })
  });

  if (!res.ok) {
    throw new Error("Server error");
  }

  const data = await res.json();

  if (data.error) {
    throw new Error(data.error);
  }

  return data.output;
}
