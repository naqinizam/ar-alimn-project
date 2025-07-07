// AR Object Controls
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let initialDistance = 0;

// Initialize AR
document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // Switch to AR view
        document.getElementById("ar-section").style.display = "none";
        document.getElementById("ar-view").style.display = "block";

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" }
        });
        document.getElementById("camera-feed").srcObject = stream;

        // Load AR object
        const arObject = document.getElementById("ar-object");
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        
        arObject.onload = () => {
            arObject.style.display = "block";
            initObjectPosition();
        };
        
        arObject.src = model_url;

    } catch (error) {
        alert("Please enable camera permissions.");
    }
});

// Position object in center
function initObjectPosition() {
    const cameraFeed = document.getElementById("camera-feed");
    const arObject = document.getElementById("ar-object");
    
    posX = cameraFeed.offsetWidth / 2 - arObject.offsetWidth / 2;
    posY = cameraFeed.offsetHeight / 2 - arObject.offsetHeight / 2;
    updateObjectTransform();
}

// ====== CONTROLS ====== //
const arObject = document.getElementById("ar-object");

// 1. ZOOM (Mouse wheel/pinch)
arObject.addEventListener("wheel", function(e) {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale + e.deltaY * -0.01), 3);
    updateObjectTransform();
}, { passive: false });

// 2. DRAG (Mouse/touch)
arObject.addEventListener("mousedown", startDrag);
arObject.addEventListener("touchstart", handleTouchStart, { passive: false });
document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// 3. ROTATE (Right-click/long-press)
arObject.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
});

// Control functions
function startDrag(e) {
    isDragging = true;
    startX = (e.clientX || e.touches[0].clientX) - posX;
    startY = (e.clientY || e.touches[0].clientY) - posY;
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

function drag(e) {
    if (!isDragging) return;
    posX = (e.clientX || e.touches[0].clientX) - startX;
    posY = (e.clientY || e.touches[0].clientY) - startY;
    updateObjectTransform();
}

function handleTouchMove(e) {
    if (e.touches.length === 1) drag(e);
    else if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        scale = Math.min(Math.max(0.5, scale * (currentDistance / initialDistance)), 3);
        initialDistance = currentDistance;
        updateObjectTransform();
    }
}

function endDrag() {
    isDragging = false;
}

function updateObjectTransform() {
    arObject.style.transform = `
        translate(${posX}px, ${posY}px)
        scale(${scale})
        rotate(${rotation}deg)
    `;
}