// AR Control Variables
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let initialDistance = 0;

// Initialize AR Experience
document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // Show AR View
        document.querySelector(".hero").style.display = "none";
        document.querySelector(".ar-card").style.display = "block";

        // 1. Start Camera Feed
        const cameraFeed = document.getElementById("camera-feed");
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });
        cameraFeed.srcObject = stream;

        // 2. Load AR Object
        const arObject = document.getElementById("ar-object");
        arObject.src = "/static/images/chair.png"; // Direct path for reliability
        
        // Fallback to online image if local fails
        arObject.onerror = () => {
            console.warn("Using fallback chair image");
            arObject.src = "https://i.imgur.com/JqYeZLn.png";
        };

        // 3. Wait for Both Camera and Object to Load
        const startTime = Date.now();
        const readyCheck = setInterval(() => {
            const cameraReady = cameraFeed.videoWidth > 0;
            const objectReady = arObject.complete && arObject.naturalWidth > 0;
            
            if (cameraReady && objectReady) {
                clearInterval(readyCheck);
                centerObject();
                arObject.style.display = "block";
            } 
            else if (Date.now() - startTime > 5000) {
                clearInterval(readyCheck);
                throw new Error("Loading timeout - check camera/object");
            }
        }, 100);

    } catch (error) {
        console.error("AR Initialization Failed:", error);
        document.querySelector(".camera-error").style.display = "flex";
    }
});

// Perfect Center Positioning
function centerObject() {
    const cameraFeed = document.getElementById("camera-feed");
    const arObject = document.getElementById("ar-object");
    
    // Calculate center coordinates
    posX = (cameraFeed.offsetWidth - arObject.offsetWidth) / 2;
    posY = (cameraFeed.offsetHeight - arObject.offsetHeight) / 2;
    
    // Ensure stays within viewport bounds
    posX = Math.max(0, Math.min(posX, cameraFeed.offsetWidth - arObject.offsetWidth));
    posY = Math.max(0, Math.min(posY, cameraFeed.offsetHeight - arObject.offsetHeight));
    
    updateObjectTransform();
}

// ====== USER CONTROLS ====== //
const arObject = document.getElementById("ar-object");

// 1. Zoom (Mouse Wheel/Pinch)
arObject.addEventListener("wheel", function(e) {
    e.preventDefault();
    scale = Math.min(Math.max(0.5, scale + e.deltaY * -0.01), 3);
    updateObjectTransform();
}, { passive: false });

// 2. Drag (Mouse/Touch)
arObject.addEventListener("mousedown", startDrag);
arObject.addEventListener("touchstart", handleTouchStart, { passive: false });
document.addEventListener("mousemove", drag);
document.addEventListener("touchmove", handleTouchMove, { passive: false });
document.addEventListener("mouseup", endDrag);
document.addEventListener("touchend", endDrag);

// 3. Rotate (Right-click/Long-press)
arObject.addEventListener("contextmenu", (e) => {
    e.preventDefault();
    rotation += 30;
    updateObjectTransform();
});

// Control Functions
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

// Browser Support Check
if (!navigator.mediaDevices?.getUserMedia) {
    document.getElementById('start-ar').disabled = true;
    document.querySelector('.hero').innerHTML += `
        <div class="warning">
            <i class="fas fa-exclamation-triangle"></i> 
            AR requires Chrome/Firefox on mobile
        </div>
    `;
}