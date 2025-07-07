// AR Object Controls
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;

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

        // 3. Load AR object with error handling
        const arObject = document.getElementById("ar-object");
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        
        console.log("Loading image from:", model_url); // Debug path
        
        arObject.onload = () => {
            console.log("✅ Image loaded successfully");
            arObject.style.display = "block";
            initObjectPosition(); // Center object
        };
        
        arObject.onerror = () => {
            console.error("❌ Failed to load image at:", model_url);
            alert("Chair image missing! Check console.");
        };
        
        arObject.src = model_url; // Trigger load

    } catch (error) {
        console.error("Camera/image error:", error);
        alert("Enable camera permissions and check console.");
    }
});

// Position object in center of camera feed
function initObjectPosition() {
    const cameraFeed = document.getElementById("camera-feed");
    const arObject = document.getElementById("ar-object");
    
    posX = cameraFeed.offsetWidth / 2 - arObject.offsetWidth / 2;
    posY = cameraFeed.offsetHeight / 2 - arObject.offsetHeight / 2;
    
    updateObjectTransform();
}

// Zoom with mouse wheel/pinch
document.getElementById("ar-object").addEventListener("wheel", (e) => {
    e.preventDefault();
    scale += e.deltaY * -0.01;
    scale = Math.min(Math.max(0.5, scale), 3); // Limit scale 0.5x-3x
    updateObjectTransform();
});

// Drag to move
document.getElementById("ar-object").addEventListener("mousedown", startDrag);
document.getElementById("ar-object").addEventListener("touchstart", startDrag, { passive: false });
document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", drag, { passive: false });
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

function startDrag(e) {
    e.preventDefault();
    isDragging = true;
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    startX = clientX - posX;
    startY = clientY - posY;
}

function drag(e) {
    if (!isDragging) return;
    e.preventDefault();
    const clientX = e.clientX || e.touches[0].clientX;
    const clientY = e.clientY || e.touches[0].clientY;
    posX = clientX - startX;
    posY = clientY - startY;
    updateObjectTransform();
}

function endDrag() {
    isDragging = false;
}

// Rotate with right-click/long-press
document.getElementById("ar-object").addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
});

// Apply all transformations
function updateObjectTransform() {
    const arObject = document.getElementById("ar-object");
    arObject.style.transform = `
        translate(${posX}px, ${posY}px)
        scale(${scale})
        rotate(${rotation}deg)
    `;
}