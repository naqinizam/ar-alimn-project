document.getElementById("start-ar").addEventListener("click", async () => {
    document.getElementById("ar-section").style.display = "none";
    document.getElementById("how-it-works").style.display = "block";

    // Fetch the placeholder model (PNG)
    const response = await fetch("/get_model");
    const data = await response.json();
    const modelUrl = data.model_url;

    // Display the AR object (PNG)
    const arObject = document.getElementById("ar-object");
    arObject.src = modelUrl;
    arObject.style.display = "block";

    // Simulate camera feed (for demo)
    const cameraFeed = document.getElementById("camera-feed");
    cameraFeed.innerHTML = `<img src="${modelUrl}" alt="AR Chair" style="width:100%;">`;

    // In a real app, use WebRTC for camera stream + libraries like AR.js
    console.log("AR functionality would use the camera here!");
});