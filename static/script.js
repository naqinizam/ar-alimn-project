document.getElementById("start-ar").addEventListener("click", async () => {
    try {
        // Hide intro section
        document.getElementById("ar-section").style.display = "none";
        
        // Show AR view
        const arView = document.getElementById("ar-view");
        arView.style.display = "block";

        // Request camera access
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: "environment" } // Force rear camera
        });

        // Display camera feed
        const cameraFeed = document.getElementById("camera-feed");
        cameraFeed.srcObject = stream;

        // Load AR object
        const response = await fetch("/get_model");
        const { model_url } = await response.json();
        const arObject = document.getElementById("ar-object");
        arObject.src = model_url;
        arObject.style.display = "block";

    } catch (error) {
        console.error("Camera error:", error);
        alert("Failed to access camera. Please enable permissions and reload.");
    }
});