// 🌙 DARK MODE TOGGLE
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

// 📷 AR OBJECT LOGIC
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY, initialDistance = 0;

document.addEventListener("DOMContentLoaded", () => {
  const arButton = document.getElementById("start-ar");
  const arObject = document.getElementById("ar-object");
  const cameraFeed = document.getElementById("camera-feed");

  if (!arButton || !arObject || !cameraFeed) return;

  arButton.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      cameraFeed.srcObject = stream;

      const res = await fetch("/get_model");
      const data = await res.json();
      arObject.src = data.model_url || "https://i.imgur.com/JqYeZLn.png";

      arObject.onload = () => {
        arObject.style.display = "block";
        centerObject();
      };
    } catch (err) {
      console.error("AR error", err);
      alert("Camera access or model failed.");
    }
  });

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
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateObjectTransform();
  });

  document.addEventListener("mouseup", () => isDragging = false);

  arObject.addEventListener("touchstart", e => {
    if (e.touches.length === 1) {
      isDragging = true;
      startX = e.touches[0].clientX - posX;
      startY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }, { passive: false });

  document.addEventListener("touchmove", e => {
    if (e.touches.length === 1 && isDragging) {
      posX = e.touches[0].clientX - startX;
      posY = e.touches[0].clientY - startY;
      updateObjectTransform();
    } else if (e.touches.length === 2) {
      e.preventDefault();
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale *= currentDistance / initialDistance;
      scale = Math.min(Math.max(0.5, scale), 3);
      initialDistance = currentDistance;
      updateObjectTransform();
    }
  }, { passive: false });

  document.addEventListener("touchend", () => isDragging = false);

  arObject.addEventListener("contextmenu", e => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
  });

  arObject.addEventListener("wheel", e => {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale - e.deltaY * 0.01), 3);
    updateObjectTransform();
  }, { passive: false });
});
