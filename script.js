const canvas = document.getElementById('signature-pad');
const ctx = canvas.getContext('2d');
let drawing = false;
let currentColor = '#000000'; // Default color
let paths = []; // Array to store the paths
let currentPath = [];
let currentWidth = canvas.width;
let currentHeight = canvas.height;
let scaleFactor = 1;

// Color Picker event listener
const colorPicker = document.getElementById('color-picker');
colorPicker.addEventListener('input', function () {
    currentColor = this.value;
    ctx.strokeStyle = currentColor;
});

// Handle drawing inputs (mouse, stylus, touch)
function getPointerPosition(e) {
    const rect = canvas.getBoundingClientRect();
    return {
        x: (e.clientX || e.touches[0].clientX) - rect.left,
        y: (e.clientY || e.touches[0].clientY) - rect.top
    };
}

canvas.addEventListener('mousedown', startDrawing);
canvas.addEventListener('mouseup', stopDrawing);
canvas.addEventListener('mousemove', draw);

canvas.addEventListener('touchstart', startDrawing);
canvas.addEventListener('touchend', stopDrawing);
canvas.addEventListener('touchmove', draw);

document.getElementById('increase-size').addEventListener('click', () => resizeCanvas(1.2));
document.getElementById('decrease-size').addEventListener('click', () => resizeCanvas(0.8));

document.getElementById('clear').addEventListener('click', clearCanvas);
document.getElementById('download').addEventListener('click', downloadSignature);

function startDrawing(e) {
    drawing = true;
    currentPath = [{ color: currentColor, width: ctx.lineWidth, path: [] }];
    const { x, y } = getPointerPosition(e);
    currentPath[0].path.push({ x: x / scaleFactor, y: y / scaleFactor });
    ctx.beginPath();
    ctx.moveTo(x, y);
    e.preventDefault();  // Prevent scrolling when drawing on touch devices
}

function stopDrawing() {
    if (!drawing) return;
    drawing = false;
    paths.push(currentPath);
}

function draw(e) {
    if (!drawing) return;
    const { x, y } = getPointerPosition(e);
    currentPath[0].path.push({ x: x / scaleFactor, y: y / scaleFactor });
    ctx.lineTo(x, y);
    ctx.stroke();
    e.preventDefault();  // Prevent scrolling when drawing on touch devices
}

function clearCanvas() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paths = []; // Clear stored paths as well
}

function resizeCanvas(factor) {
    // Update the scaling factor
    scaleFactor *= factor;

    // Save current canvas image data (if needed for further export, but we redraw paths now)
    const newWidth = currentWidth * factor;
    const newHeight = currentHeight * factor;

    // Resize canvas
    currentWidth = newWidth;
    currentHeight = newHeight;
    canvas.width = currentWidth;
    canvas.height = currentHeight;

    // Redraw all stored paths with new scaling
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = currentColor;
    redrawPaths();
}

function redrawPaths() {
    paths.forEach(pathSet => {
        ctx.strokeStyle = pathSet[0].color;
        ctx.lineWidth = pathSet[0].width;
        ctx.beginPath();
        pathSet[0].path.forEach((point, index) => {
            const scaledX = point.x * scaleFactor;
            const scaledY = point.y * scaleFactor;
            if (index === 0) {
                ctx.moveTo(scaledX, scaledY);
            } else {
                ctx.lineTo(scaledX, scaledY);
            }
        });
        ctx.stroke();
    });
}

function downloadSignature() {
    // Create a new canvas for exporting with white background
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = canvas.width;
    exportCanvas.height = canvas.height;
    const exportCtx = exportCanvas.getContext('2d');

    // Fill with white background
    exportCtx.fillStyle = '#FFFFFF';
    exportCtx.fillRect(0, 0, exportCanvas.width, exportCanvas.height);

    // Draw the signature from the original canvas
    exportCtx.drawImage(canvas, 0, 0);

    // Export the canvas as JPEG
    const link = document.createElement('a');
    link.download = 'signature.jpeg';
    link.href = exportCanvas.toDataURL('image/jpeg');
    link.click();
}
