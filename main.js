window.jsPDF = window.jspdf.jsPDF;
const player = document.getElementById('player');
const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
const captureButton = document.getElementById('capture');
const convertButton = document.getElementById('convert');
const fileInput = document.getElementById('file-input');
const counter = document.getElementById('counter');
counter.innerHTML = 0;
var drag = false;
var id = 1;
var documentCounter = 0;
var lastDot;
var image;

const constraints = {
    video: true,
};
navigator.serviceWorker.register("./sw.js");
player.addEventListener("loadedmetadata", function(e) {
    if (e.target.clientWidth > screen.width) {
        var scaling = e.target.clientHeight / screen.width;
        player.width = screen.width;
        player.height = e.target.clientHeight / scaling;
        return;
    }
    canvas.width = e.target.clientWidth;
    canvas.height = e.target.clientHeight;
}, false);

captureButton.addEventListener('click', () => {
    // Draw the video frame to the canvas.
    context.drawImage(player, 0, 0, canvas.width, canvas.height);

    convertButton.disabled = false;
});

convertButton.addEventListener('click', () => {
    image = context.getImageData(0, 0, canvas.width, canvas.height);
    var doc = new jsPDF();

    var pageWidth = doc.internal.pageSize.getWidth() - 20;

    var scaleFactor = pageWidth / image.width;

    doc.addImage(image, 'png', 10, 10, pageWidth, image.height * scaleFactor, 'image');
    doc.save("image.pdf");

    counter.innerHTML = documentCounter;
});

var errorCallback = function(e) {
    player.remove();
    captureButton.remove();
};

// Attach the video stream to the video element and autoplay.
navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
    player.srcObject = stream;
}).catch(errorCallback);

fileInput.addEventListener('change', (e) => {
    image = new Image();
    image.src = URL.createObjectURL(e.target.files[0]);
    image.onload = function() {
        context.drawImage(image, 0, 0, canvas.width, canvas.height);
        convertButton.disabled = false;
    }
});

function hasGetUserMedia() {
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia ||
        navigator.mozGetUserMedia || navigator.msGetUserMedia);
}

if (!hasGetUserMedia()) {
    player.remove();
    captureButton.remove();
}

canvas.addEventListener('mousedown', function(event) {
    drag = true;
    lastDot = {
        x: event.offsetX,
        y: event.offsetY
    };
});

canvas.addEventListener('mouseup', function(event) {
    drag = false;
});
canvas.addEventListener('mousemove', function(event) {
    if (drag) {
        context.beginPath();
        context.moveTo(lastDot.x, lastDot.y);
        context.lineTo(event.offsetX, event.offsetY);
        context.strokeStyle = '#ff0000';
        context.stroke();
        lastDot = {
            x: event.offsetX,
            y: event.offsetY
        };
    }
});