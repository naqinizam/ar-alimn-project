// ======================
// 🌙 DARK MODE TOGGLE
// ======================
const themeToggle = document.getElementById("toggle-theme");
const body = document.body;

function setTheme(mode) {
  if (mode === "dark") {
    body.classList.add("dark");
    localStorage.setItem("theme", "dark");
    if (themeToggle) themeToggle.textContent = "☀️";
  } else {
    body.classList.remove("dark");
    localStorage.setItem("theme", "light");
    if (themeToggle) themeToggle.textContent = "🌙";
  }
}

if (localStorage.getItem("theme") === "dark") {
  setTheme("dark");
}

themeToggle?.addEventListener("click", () => {
  const current = body.classList.contains("dark") ? "dark" : "light";
  setTheme(current === "dark" ? "light" : "dark");
});

// ======================
// 📷 AR CAMERA + OBJECT
// ======================
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let initialDistance = 0;

document.addEventListener("DOMContentLoaded", () => {
  const arButton = document.getElementById("start-ar");
  const arObject = document.getElementById("ar-object");
  const cameraFeed = document.getElementById("camera-feed");
  const dropdown = document.getElementById("ar-select");

  if (!arButton || !arObject || !cameraFeed || !dropdown) return;

  // Start camera and show default object
  arButton.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      cameraFeed.srcObject = stream;

      loadARObject(dropdown.value);
    } catch (err) {
      console.error("AR init failed:", err);
      alert("Unable to start AR. Check camera permissions.");
    }
  });

  // Load selected AR object and center
  function loadARObject(item) {
    const src = `/static/images/${item}.png`;
    arObject.src = src;

    arObject.onload = () => {
      arObject.style.display = "block";
      scale = 1;
      rotation = 0;

      // Delay to wait for layout
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          centerObject();
        });
      });
    };
  }

  // On dropdown change, switch item and center it
  dropdown.addEventListener("change", () => {
    loadARObject(dropdown.value);
  });

  // Centering logic
  function centerObject() {
    const containerWidth = cameraFeed.offsetWidth;
    const containerHeight = cameraFeed.offsetHeight;
    const objectWidth = arObject.offsetWidth;
    const objectHeight = arObject.offsetHeight;

    posX = (containerWidth - objectWidth) / 2;
    posY = (containerHeight - objectHeight) / 2;

    updateObjectTransform();
  }

  // Apply current scale, position, rotation
  function updateObjectTransform() {
    arObject.style.transform = `
      translate(${posX}px, ${posY}px)
      scale(${scale})
      rotate(${rotation}deg)
    `;
  }

  // Drag (mouse)
  arObject.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    updateObjectTransform();
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
  });

  // Drag (touch)
  arObject.addEventListener("touchstart", (e) => {
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

  document.addEventListener("touchmove", (e) => {
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

  document.addEventListener("touchend", () => {
    isDragging = false;
  });

  // Right click to rotate
  arObject.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
  });

  // Scroll to zoom
  arObject.addEventListener("wheel", (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale - e.deltaY * 0.01), 3);
    updateObjectTransform();
  }, { passive: false });
});

// ======================
// ✨ Fade-In on Scroll
// ======================
document.addEventListener("DOMContentLoaded", () => {
  const fadeElements = document.querySelectorAll(".fade-in");

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  }, {
    threshold: 0.1
  });

  fadeElements.forEach(el => observer.observe(el));
});
