// === DARK MODE TOGGLE ===
const themeToggle = document.getElementById("toggle-theme");
const body = document.body;

function setTheme(mode) {
  if (mode === "dark") {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    themeToggle.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    themeToggle.textContent = "🌙";
  }
}

if (localStorage.getItem("theme") === "dark") {
  setTheme("dark");
}

themeToggle?.addEventListener("click", () => {
  const current = body.classList.contains("dark") ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
});

// === AR DEMO CAMERA CONTROL ===
document.addEventListener("DOMContentLoaded", () => {
  const arBtn = document.getElementById("start-ar");
  const arObject = document.getElementById("ar-object");
  const cameraFeed = document.getElementById("camera-feed");

  if (!arBtn || !arObject || !cameraFeed) return;

  arBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      cameraFeed.srcObject = stream;

      const res = await fetch("/get_model");
      const data = await res.json();
      arObject.src = data.model_url || "https://i.imgur.com/JqYeZLn.png";

      // Wait for both video and image to be ready
      cameraFeed.onloadedmetadata = () => {
        arObject.onload = () => {
          arObject.style.display = "block";
          centerObject();
        };
      };
    } catch (err) {
      console.error("AR failed", err);
      alert("Camera access failed.");
    }
  });

  let scale = 1, rotation = 0, posX = 0, posY = 0, dragging = false, startX, startY;

  function centerObject() {
    posX = (cameraFeed.offsetWidth - arObject.offsetWidth) / 2;
    posY = (cameraFeed.offsetHeight - arObject.offsetHeight) / 2;
    updateObjectTransform();
  }

  function updateObjectTransform() {
    arObject.style.transform = `
      translate(${posX}px, ${posY}px)
      scale(${scale})
      rotate(${rotation}deg)
    `;
  }

  arObject.addEventListener("mousedown", e => {
    dragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  document.addEventListener("mousemove", e => {
    if (!dragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateObjectTransform();
  });

  document.addEventListener("mouseup", () => dragging = false);

  arObject.addEventListener("wheel", e => {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale - e.deltaY * 0.01), 3);
    updateObjectTransform();
  });

  arObject.addEventListener("contextmenu", e => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
  });
});
