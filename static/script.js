// DARK MODE TOGGLE
const toggleBtn = document.getElementById("toggle-theme");
toggleBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  toggleBtn.textContent = document.body.classList.contains("dark") ? "☀️" : "🌙";
});

// AR CAMERA INITIALIZATION
const startBtn = document.getElementById("start-ar");
if (startBtn) {
  startBtn.addEventListener("click", async () => {
    try {
      const video = document.getElementById("camera-feed");
      const arObject = document.getElementById("ar-object");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" }
      });
      video.srcObject = stream;

      arObject.src = "/static/images/chair.png";
      arObject.style.display = "block";
    } catch (err) {
      console.error("Camera error:", err);
      document.querySelector(".camera-error").style.display = "block";
    }
  });
}

// AR Object Interactivity
const arObject = document.getElementById("ar-object");
if (arObject) {
  let isDragging = false, startX, startY, scale = 1, rotation = 0, posX = 0, posY = 0;

  arObject.addEventListener("mousedown", e => {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
  });
  document.addEventListener("mousemove", e => {
    if (!isDragging) return;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    arObject.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
  });
  document.addEventListener("mouseup", () => isDragging = false);
  arObject.addEventListener("wheel", e => {
    e.preventDefault();
    scale += e.deltaY > 0 ? -0.1 : 0.1;
    scale = Math.max(0.5, Math.min(scale, 3));
    arObject.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
  });
  arObject.addEventListener("contextmenu", e => {
    e.preventDefault();
    rotation += 30;
    arObject.style.transform = `translate(${posX}px, ${posY}px) scale(${scale}) rotate(${rotation}deg)`;
  });
}
