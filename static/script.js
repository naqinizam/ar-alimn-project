// Theme Toggle
const toggle = document.getElementById('toggle-theme');
toggle.addEventListener('click', () => {
  document.body.classList.toggle('dark');
  toggle.textContent = document.body.classList.contains('dark') ? '☀️' : '🌙';
});

// AR Controls
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY, initialDistance = 0;

const cameraFeed = document.getElementById("camera-feed");
const arObject = document.getElementById("ar-object");
const startBtn = document.getElementById("start-ar");

if (startBtn) {
  startBtn.addEventListener("click", async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { exact: "environment" }
        }
      });

      cameraFeed.srcObject = stream;

      const res = await fetch("/get_model");
      const data = await res.json();

      arObject.src = data.model_url;
      arObject.style.display = "block";

      // Position object in center
      setTimeout(() => {
        const feedBox = cameraFeed.getBoundingClientRect();
        const objBox = arObject.getBoundingClientRect();
        posX = (feedBox.width - objBox.width) / 2;
        posY = (feedBox.height - objBox.height) / 2;
        updateTransform();
      }, 300);

    } catch (err) {
      console.error("Camera failed:", err);
      alert("Unable to access camera. Please use HTTPS and allow permissions.");
    }
  });

  // Interaction
  arObject.addEventListener("mousedown", startDrag);
  arObject.addEventListener("touchstart", handleTouchStart, { passive: false });
  document.addEventListener("mousemove", drag);
  document.addEventListener("touchmove", handleTouchMove, { passive: false });
  document.addEventListener("mouseup", endDrag);
  document.addEventListener("touchend", endDrag);

  arObject.addEventListener("wheel", (e) => {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale + e.deltaY * -0.01), 3);
    updateTransform();
  });

  arObject.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 15;
    updateTransform();
  });

  function startDrag(e) {
    isDragging = true;
    startX = (e.clientX || e.touches?.[0]?.clientX) - posX;
    startY = (e.clientY || e.touches?.[0]?.clientY) - posY;
  }

  function drag(e) {
    if (!isDragging) return;
    posX = (e.clientX || e.touches?.[0]?.clientX) - startX;
    posY = (e.clientY || e.touches?.[0]?.clientY) - startY;
    updateTransform();
  }

  function handleTouchStart(e) {
    if (e.touches.length === 1) startDrag(e);
    else if (e.touches.length === 2) {
      initialDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
    }
  }

  function handleTouchMove(e) {
    if (e.touches.length === 2) {
      e.preventDefault();
      const currentDist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      scale = Math.min(Math.max(0.5, scale * (currentDist / initialDistance)), 3);
      initialDistance = currentDist;
      updateTransform();
    } else {
      drag(e);
    }
  }

  function endDrag() {
    isDragging = false;
  }

  function updateTransform() {
    arObject.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
  }
}
