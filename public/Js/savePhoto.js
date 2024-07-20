const safePhotoBtnNote = document.querySelector('#savePhotoBtnNote');
const safePhotoMenuNote = document.querySelector('#savePhotoMenuNote');
import { camElement } from './webcam.js';
import { addChecker } from './chatBot.js';

let isSaveBtnEvented = false;

export async function savePhoto(photoNumber, context, replayTime) {
    context.currentPhotoNumber = photoNumber; // Update the current photo number in the context
    halfChatBot();
    const canvas = document.getElementById('hsien-canvas-top');
    const photoBoxContainer = document.querySelector('#recorder-box');

    // Create button HTML for capturing the photo
    const dashBox = `
        <audio id="cameraSound" src="../images/cameraShutter.mp3" preload="auto"></audio>
        <div id="capture-box" style="position: absolute; margin: 2%; left: 50%; transform: translateX(-50%); z-index: 1500; width: 80%; height: 80%; display: flex; align-items: center; justify-content: center; border: 8px dashed orange; border-radius: 15px; display: block">
             <img id="checkerIcon" src="../images/checkerIcon.svg"  style="position: absolute; top: 3vh; right: -4vw; display: none">
            <div id="key" style="position: absolute; bottom: 5vh; display: flex; align-items: center; justify-content: center;">
                <span>#${photoNumber}</span>
            </div>
        </div>
    `;
    // Insert button HTML into the canvas container
    photoBoxContainer.insertAdjacentHTML('beforeend', dashBox);
    photoBoxContainer.style.display = 'block';
    photoBoxContainer.style.width = '100%';
    photoBoxContainer.style.height = '100%';
    safePhotoMenuNote.innerText = 'press to capture image'
    safePhotoBtnNote.innerText =`Photo #${photoNumber}`
    safePhotoMenuNote.classList.add('cam-flashing')
    addSavePhotoBtnListeners(context);
}

function addSavePhotoBtnListeners(context) {
    const safePhotoBtn = document.querySelector('#savePhotoBtn');
    if (safePhotoBtn && !isSaveBtnEvented) {
        safePhotoBtn.addEventListener('mousedown', handleMouseDown);
        safePhotoBtn.addEventListener('mouseup', (event) => {
            const photoNumber = context.currentPhotoNumber;
            handleMouseUp(event, context, photoNumber);
        });
        isSaveBtnEvented = true;
    }
}

function handleMouseDown(event) {
    const img = event.target.querySelector('img');
    if (img) {
        img.style.opacity = '0.5';
    }
    if (safePhotoBtnNote) {
        safePhotoBtnNote.innerText = '...';
    }
}

async function handleMouseUp(event, context, photoNumber) {
    const svg = event.target.querySelector('svg');
    if (svg) {
        svg.style.opacity = '1';
    }
    const cameraSound = document.getElementById('cameraSound');
    if (cameraSound) {
        await cameraSound.play();
    }
    if (safePhotoBtnNote) {
        safePhotoBtnNote.innerText = 'saved!';
    }
    if (safePhotoMenuNote) {
        safePhotoMenuNote.innerText = 'Photo captured. Back to video...';
    }
    const checkerIcon = document.getElementById('checkerIcon');
    if (checkerIcon) {
        checkerIcon.style.display = "block";
    }
    capturePhoto(document.getElementById('hsien-canvas-top'), context, photoNumber);
    setTimeout(() => {
        restoreChatBot();
        context.pipElement.play()
    }, 2000);
}

function capturePhoto(canvas, context, photoNumber) {
    console.log('Capturing photo #', photoNumber);

    // Determine which video element is currently displayed
    let videoElement;
    if (context.canvasTop.style.display === 'block') {
        videoElement = camElement.top;
    } else if (context.canvasScope.style.display === 'block') {
        videoElement = camElement.scope;
    }

    if (videoElement) {
        const context2D = canvas.getContext('2d');
        context2D.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL('image/jpeg');
        context.savedPhotos[photoNumber - 1] = image;
        context.savedTimeStamps[photoNumber - 1] = new Date().toLocaleTimeString();
        console.log('Image data URL:', image);
        addChecker(context, '[done]')

        safePhotoMenuNote.innerText = 'saved'
        safePhotoBtnNote.innerText =""
        safePhotoMenuNote.classList.remove('cam-flashing')
        for (let i = 0; i < context.savedPhotos.length; i++) {
            console.log(`Photo #${i + 1}:`, context.savedTimeStamps[i]);
        }

        // Clear the canvas to release the image buffer
        context2D.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = canvas.width;
        canvas.height = canvas.height;
    } else {
        console.error('No video element is currently displayed');
    }
}

async function restoreChatBot() {
    const photoBoxContainer = document.querySelector('#recorder-box');
    photoBoxContainer.innerHTML = '';
    photoBoxContainer.style.display = "none";
    openChatBot();
}
