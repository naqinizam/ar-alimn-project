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
let cameraStarted = false;

document.addEventListener("DOMContentLoaded", () => {
  const arObject = document.getElementById("ar-object");
  const cameraFeed = document.getElementById("camera-feed");
  const dropdown = document.getElementById("ar-item-select");
  const arButton = document.getElementById("start-ar");

  if (!arObject || !cameraFeed || !dropdown) return;

  const startCameraIfNeeded = async () => {
    if (!cameraStarted) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        cameraFeed.srcObject = stream;
        cameraStarted = true;
      } catch (err) {
        alert("Could not access camera.");
        console.error("Camera error:", err);
      }
    }
  };

  const loadARObject = async (item) => {
    try {
      const res = await fetch(`/get_model?item=${item}`);
      const data = await res.json();
      arObject.src = data.model_url || "https://i.imgur.com/JqYeZLn.png";

      arObject.onload = () => {
        arObject.style.display = "block";
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            centerObject();
          });
        });
      };
    } catch (err) {
      console.error("Failed to load AR item:", err);
    }
  };

  const centerObject = () => {
    posX = (cameraFeed.offsetWidth - arObject.offsetWidth) / 2;
    posY = (cameraFeed.offsetHeight - arObject.offsetHeight) / 2;
    updateObjectTransform();
  };

  const updateObjectTransform = () => {
    arObject.style.transform = `
      translate(${posX}px, ${posY}px)
      scale(${scale})
      rotate(${rotation}deg)
    `;
  };

  // Initial load (from dropdown or URL)
  const itemFromURL = new URLSearchParams(window.location.search).get("item") || dropdown.value;
  dropdown.value = itemFromURL;
  loadARObject(itemFromURL);

  // Live switching (no button needed)
  dropdown.addEventListener("change", () => {
    loadARObject(dropdown.value);
  });

  // Start camera when user clicks start
  arButton?.addEventListener("click", startCameraIfNeeded);

  // Drag and Touch
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

  arObject.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
  });

  arObject.addEventListener("wheel", (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale - e.deltaY * 0.01), 3);
    updateObjectTransform();
  }, { passive: false });
});


// ======================
// 👀 Fade In on Scroll
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
