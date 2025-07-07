// AR Object Controls
let scale = 1;
let rotation = 0;
let posX = 0;
let posY = 0;
let isDragging = false;
let startX, startY;
let initialDistance = 0;

// AR Initialization with robust camera handling
document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // Show AR view
        document.querySelector(".hero").style.display = "none";
        document.querySelector(".ar-card").style.display = "block";

        // 1. Request camera access
        const constraints = {
            video: {
                facingMode: "environment",
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        };
        
        const stream = await navigator.mediaDevices.getUserMedia(constraints)
            .catch(err => {
                console.error("Camera error:", err);
                throw new Error("Camera access denied. Please enable permissions.");
            });

        // 2. Start camera feed
        const cameraFeed = document.getElementById("camera-feed");
        cameraFeed.srcObject = stream;
        cameraFeed.onloadedmetadata = () => {
            cameraFeed.play();
            console.log("Camera feed active");
        };

        // 3. Load AR object
        const arObject = document.getElementById("ar-object");
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        
        arObject.onload = () => {
            arObject.style.display = "block";
            centerObject();
        };
        
        arObject.onerror = () => console.error("Failed to load AR model");
        arObject.src = model_url;

    } catch (error) {
        console.error("AR initialization failed:", error);
        alert(error.message);
        // Fallback to show product images if AR fails
        document.querySelector(".hero").style.display = "flex";
    }
});

// Center object with camera feed awareness
function centerObject() {
    const cameraFeed = document.getElementById("camera-feed");
    const arObject = document.getElementById("ar-object");
    
    // Wait for video dimensions to stabilize
    const checkDimensions = setInterval(() => {
        if (cameraFeed.videoWidth > 0) {
            clearInterval(checkDimensions);
            posX = (cameraFeed.offsetWidth - arObject.offsetWidth) / 2;
            posY = (cameraFeed.offsetHeight - arObject.offsetHeight) / 2;
            updateObjectTransform();
        }
    }, 100);
}

// [Keep all your existing control functions (drag/zoom/rotate) unchanged]

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