import { addChecker } from './chatBot.js';

let isSubmitPhotosListenerAdded = false;
let isExitListenerAdded = false;

const byeHtml =`
 <header class="bg-dark text-white text-center py-3 mb-4">
    <div class="container">
      Congratulations on Completing the Video!
    </div>
  </header>

  <main class="container">
    <div class="row">
      <div class="col-md-12">
        <article class="mb-4">
          <h2 class="post-title">You Have Completed the Video</h2>
          <p class="post-content">
            Your dedication and hard work in completing the video are commendable. You have successfully demonstrated your ability to follow instructions and produce quality content.
          </p>
        </article>
        <article class="mb-4">
          <h2 class="post-title">You May Have Also Submitted Practice Photos</h2>
          <p class="post-content">
            If you submitted practice photos, thank you for your effort. Your submissions help in documenting your progress and provide valuable feedback for further improvement.
          </p>
        </article>
        <article class="mb-4">
          <h2 class="post-title">We Appreciate Your Efforts</h2>
          <p class="post-content">
            We truly appreciate your efforts in updating or enhancing your skills. Your commitment to continuous learning is inspiring and sets a great example for others.
          </p>
        </article>
        <article class="mb-4">
          <hr>          
          <p class="post-content" style="text-align:center; color: orange;">
            Now you can close this window.
          </p>
        </article>
      </div>
    </div>
  </main>

  <footer class="bg-dark text-white text-center py-3 mt-4">
    <div class="container">
      <p>Our Team Works for Your Success™</p>
    </div>
  </footer>
`

export async function uploadPhotos(context) {
    // Create a full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'blogOverlay';
    overlay.classList.add('hidden'); // Ensure initially hidden state

    // Fetch the content of uploadPhotos.html
    try {
        const response = await fetch('./Js/uploadPhotos.html');
        const templateText = await response.text();
        const populatedHtml = populateTemplate(templateText, context);
        overlay.innerHTML = populatedHtml;
        document.body.appendChild(overlay);
        overlay.style.display = 'block'; // Ensure display is set to block before opacity change

        // Trigger the fade-in effect
        requestAnimationFrame(() => {
            overlay.classList.add('visible');
        });

        addEventListeners(context);

    } catch (error) {
        console.error('Error loading uploadPhotos.html:', error);
    }
}

function populateTemplate(template, context) {
    const currentDate = new Date().toISOString().split('T')[0];
    template = template.replace(/{currentDate}/g, currentDate);

    for (let i = 0; i <= 5; i++) {
        const photoPlaceholder = new RegExp(`{img${i}}`, 'g');
        const timePlaceholder = new RegExp(`{time${i}}`, 'g');

        if (context.savedPhotos[i]) {
            template = template.replace(photoPlaceholder, context.savedPhotos[i]);
            template = template.replace(timePlaceholder, context.savedTimeStamps[i]);
        } else {
            template = template.replace(photoPlaceholder, './images/empty.png');
            template = template.replace(timePlaceholder, 'n/a');
        }
    }
    return template;
}

function addEventListeners(context) {
    const submitPhotosButton = document.getElementById('submitPhotos');
    const exitButton = document.getElementById('exit');

    if (submitPhotosButton && !isSubmitPhotosListenerAdded) {
        submitPhotosButton.addEventListener('click', () => submitName(context));
        isSubmitPhotosListenerAdded = true;
    }

    if (exitButton && !isExitListenerAdded) {
        exitButton.addEventListener('click', () => exitSession(context));
        isExitListenerAdded = true;
    }
}

async function submitName(context) {
    const userName = document.getElementById('userNameInput').value;
    if (!userName) {
        document.getElementById('userNameInput').style.backgroundColor = 'yellow';
        return;
    }

    // Generate log file content
    const date = new Date().toISOString().split('T')[0];
    const logContent = `
Course ID: ${context.courseId}
User: ${userName}
Date: ${date}
${generateLogContent(context.savedTimeStamps)}
    `.trim();

    // Create a Blob for the log file
    const logBlob = new Blob([logContent], { type: 'text/plain' });
    const logFileName = `${userName.slice(0, 20)} #${context.courseId} log.txt`;

    try {
        // Prepare FormData for upload
        const formData = new FormData();
        formData.append('userName', userName);
        formData.append('logFile', logBlob, logFileName);
        for (let i = 0; i <= 5; i++) {
            if (context.savedPhotos[i]) {
                const imageDataUrl = context.savedPhotos[i];
                const blob = dataURLToBlob(imageDataUrl);
                formData.append(`photo${i + 1}`, blob, `photo${i + 1}.jpg`);
            }
        }

        // Upload logic
        const response = await fetch('/sendEmail', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            context.uploadTimeStamp = new Date().toLocaleTimeString(); // Update context with upload timestamp
            addChecker(context, `uploaded on ${context.uploadTimeStamp}`); // Trigger TOC update
            exitSession(context);
        } else {
            console.error('Photo upload failed:', response.statusText);
            alert('An error occurred while uploading the photos. Please try again.');
        }
    } catch (error) {
        console.error('Error uploading photos:', error);
        alert('An error occurred while uploading the photos. Please try again.');
    }
}

function generateLogContent(savedTimeStamps) {
    let logContent = '';
    for (let i = 0; i <= 5; i++) {
        if (savedTimeStamps[i]) {
            logContent += `#${i + 1}: ${savedTimeStamps[i]}\n`;
        } else {
            logContent += `#${i + 1}: missing\n`;
        }
    }
    return logContent;
}

function dataURLToBlob(dataUrl) {
    const parts = dataUrl.split(',');
    const mime = parts[0].match(/:(.*?);/)[1];
    const bstr = atob(parts[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

async function exitSession(content) {
    const overlay = document.querySelector('#blogOverlay');

    // Step 1: Fade out the old content
    overlay.classList.remove('visible'); // Trigger fade-out effect

    setTimeout(async () => {
        // Step 2: Clear the old content after fade-out
        overlay.innerHTML = '';

        // Step 3: Set the new content to the overlay
        overlay.innerHTML = byeHtml;
        // Replace the date placeholder with the current date
        closeConnectedDevices();
        // Step 4: Fade in the new content
        overlay.classList.add('visible'); // Trigger fade-in effect

        // Add event listener for the close button
    }, 1000); // Delay to match the fade-out transition duration
}

function closeConnectedDevices() {
    // Add your logic to close all connected devices here
    console.log("Closing all connected devices...");
    // Example: navigator.mediaDevices.getUserMedia() and stop the tracks
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            if (device.kind === 'videoinput' || device.kind === 'audioinput') {
                navigator.mediaDevices.getUserMedia({ video: device.kind === 'videoinput', audio: device.kind === 'audioinput' })
                    .then(stream => {
                        stream.getTracks().forEach(track => track.stop());
                    })
                    .catch(error => console.error("Error closing device:", error));
            }
        });
    });
}