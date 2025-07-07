// AR Object Controls
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let initialDistance = 0; // For pinch zoom

// Initialize AR
document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // 1. Switch to AR view
        document.getElementById("ar-section").style.display = "none";
        document.getElementById("ar-view").style.display = "block";

        // 2. Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // Rear camera
        });
        document.getElementById("camera-feed").srcObject = stream;

        // 3. Load AR object
        const arObject = document.getElementById("ar-object");
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        
        console.log("Loading image from:", model_url);
        
        arObject.onload = () => {
            console.log("✅ Image loaded successfully");
            arObject.style.display = "block";
            initObjectPosition(); // Center object
        };
        
        arObject.onerror = () => console.error("❌ Failed to load image");

        arObject.src = model_url;

    } catch (error) {
        console.error("Camera/image error:", error);
        alert("Enable camera permissions and check console.");
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
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(0.5, scale), 3); // Limit 0.5x-3x
    console.log("Scale:", scale);
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

// ====== CONTROL FUNCTIONS ====== //
function startDrag(e) {
    isDragging = true;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
}

function handleTouchStart(e) {
    if (e.touches.length === 1) {
        // Single touch: drag
        isDragging = true;
        startX = e.touches[0].clientX - posX;
        startY = e.touches[0].clientY - posY;
    } else if (e.touches.length === 2) {
        // Two touches: pinch zoom
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
    if (e.touches.length === 1 && isDragging) {
        // Single touch drag
        drag(e);
    } else if (e.touches.length === 2) {
        // Pinch zoom
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

// Update object position/scale/rotation
function updateObjectTransform() {
    arObject.style.transform = `
        translate(${posX}px, ${posY}px)
        scale(${scale})
        rotate(${rotation}deg)
    `;
}