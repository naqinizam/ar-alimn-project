// AR Initialization
document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // Show AR view
        document.getElementById("ar-section").style.display = "none";
        document.getElementById("ar-view").style.display = "block";

        // Start camera
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } 
        });
        document.getElementById("camera-feed").srcObject = stream;

        // Load AR object
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        const arObject = document.getElementById("ar-object");
        arObject.src = model_url;
        arObject.style.display = "block";
        initObjectControls();

    } catch (error) {
        alert("Camera access denied. Please enable permissions.");
        console.error(error);
    }
});

// AR Object Controls
function initObjectControls() {
    const arObject = document.getElementById("ar-object");
    let scale = 1;
    let rotation = 0;
    let posX = 0;
    let posY = 0;
    let isDragging = false;
    let startX, startY;

    // Center object initially
    const cameraFeed = document.getElementById("camera-feed");
    posX = cameraFeed.offsetWidth / 2 - arObject.offsetWidth / 2;
    posY = cameraFeed.offsetHeight / 2 - arObject.offsetHeight / 2;
    updateTransform();

    // Zoom with mouse wheel/pinch
    arObject.addEventListener("wheel", (e) => {
        e.preventDefault();
        scale += e.deltaY * -0.01;
        scale = Math.min(Math.max(0.5, scale), 3);
        updateTransform();
    });

    // Move with drag
    arObject.addEventListener("mousedown", startDrag);
    arObject.addEventListener("touchstart", startDrag);
    document.addEventListener("mousemove", drag);
    document.addEventListener("touchmove", drag);
    document.addEventListener("mouseup", endDrag);
    document.addEventListener("touchend", endDrag);

    // Rotate with right-click/long-press
    arObject.addEventListener("contextmenu", (e) => {
        e.preventDefault();
        rotation += 30;
        updateTransform();
    });

    function startDrag(e) {
        isDragging = true;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        startX = clientX - posX;
        startY = clientY - posY;
    }

    function drag(e) {
        if (!isDragging) return;
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        posX = clientX - startX;
        posY = clientY - startY;
        updateTransform();
    }

    function endDrag() {
        isDragging = false;
    }

    function updateTransform() {
        arObject.style.transform = `
            translate(${posX}px, ${posY}px)
            scale(${scale})
            rotate(${rotation}deg)
        `;
    }
}