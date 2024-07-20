import { initializeChatBot } from './chatBot.js';
import { loadVTTFile } from './captions.js';
import { handleError } from './errors.js';

export async function loadPage(context) {
  const config = {
    "c": {
      "pipView": "half-width",
      "pipAudio": true,
      "webcamView": true,
      "recorderBox": false,
      "photoBox": false,
      "chatBodyPointer": "auto",
      "startText": "to start or resume",
      "pauseText": "pause",
      "completedText": "[play again]",
      "nextText": "Record Video",
      "nextScript": "this.newPage('c72a'); ",
      "choiceBText": "[Last 3s]",
      "choiceBScript": "if (this.pipElement) { this.pipElement.currentTime = this.pipElement.duration-3; }",
      "endNote": "or [back]?",
      "buttonStates": [1, 1],
      "endButtonStates": [1, 1]
    }
  };

  try {
    console.log(context.courseId);

    context.courseMetaId = context.courseId;


    context.recordingMode = (context.courseId.startsWith('p'));
    console.log('Recording mode enabled -hehe:', context.recordingMode);
    pageLayout(context, config);

    await initializeChatBot(context);
    checkPipElementStatus(context)

    const captions = await loadVTTFile(context);
    context.captions = captions;

  } catch (error) {
    console.error('Error launching new page:', error);
  }
}

function pageLayout(context, config) {
  const key = context.courseId.charAt(0);
  try {
    const pageConfig = config[key];
    context.startText = pageConfig.startText;
    context.pauseText = pageConfig.pauseText;
    context.nextText = pageConfig.nextText;
    context.nextScript = pageConfig.nextScript;
    context.choiceBScript = pageConfig.choiceBScript;
    context.endNote = pageConfig.endNote;
    context.endButtonStates = pageConfig.endButtonStates;

    const sideElement = document.querySelector('.hsien-side-left');
    const webcamElement = document.querySelector('.hsien-webcam');
    const helpBackdrop = document.querySelector('#helpBackdrop');
    const choiceB = document.querySelector('#choiceB');
    let nextButton = document.querySelector('#nextButton');
    let courseButton = document.querySelector('#courseButton');
    let tocSlider = document.querySelector('.controls');
    nextButton.innerHTML = `<img src="./images/icon-next.png" style="width: 40px; height: 40px;" />`
    choiceB.innerHTML = pageConfig.choiceBText;
    const recorderBox = document.querySelector('#recorder-box');
    const chatBody = document.querySelector('.chatBody');

    helpBackdrop.style.display = 'none';
    nextButton.style.display = 'none';
    courseButton.style.display = 'block';

    recorderBox.style.display = pageConfig.recorderBox ? 'block' : 'none';
    tocSlider.style.display = pageConfig.recorderBox ? 'none' : 'block';

    // Apply pipView
    sideElement.classList.remove('full-width', 'half-width', 'hidden');
    if (pageConfig.pipView) {
      sideElement.classList.add(pageConfig.pipView);
    }

    // Apply pipAudio
    if (context.pipElement) {
      context.pipElement.muted = !pageConfig.pipAudio;
    }

    // Apply webcamView
    if (pageConfig.webcamView) {
      webcamElement.style.display = 'block';
    } else {
      webcamElement.style.display = 'none';
    }

    // Disallow clicks on TOC when Recorder / Submit mode
    chatBody.style.pointerEvents = pageConfig.chatBodyPointer;

    // Update button states
    activateTextButtons(pageConfig.buttonStates);
  } catch (error) {
    console.error('Error loading pageLoad.json:', error);
  }
}

export function activateTextButtons(mode) {
  const choiceB = document.getElementById('choiceB');
  const openHelp = document.getElementById('openHelp');
  console.log('textButton')
  // Array to hold the button elements
  const buttons = [choiceB, openHelp];

  // Iterate over the mode array to set the button states
  for (let i = 0; i < buttons.length; i++) {
    if (mode[i] === 0) {
      buttons[i].innerHTML = `[${buttons[i].textContent.trim().slice(1, -1)}]`;
      buttons[i].style.color = 'white';
      buttons[i].style.opacity = 0.5;
      buttons[i].style.cursor = 'default';
      buttons[i].style.pointerEvents = 'none'
      console.log('textButton-innerHTML', `[${buttons[i].textContent.trim().slice(1, -1)}]`)
    } else {
      buttons[i].innerHTML = `[${buttons[i].textContent.trim().slice(1, -1)}]`;
      buttons[i].style.color = 'orange';
      buttons[i].style.opacity = 1;
      buttons[i].style.cursor = 'pointer';
      buttons[i].style.pointerEvents = 'auto'; // Enable click events

    }
  }
}

export function loadPip(context) {
  let loadingGif = document.getElementById('loading');
  let courseButton = document.getElementById('courseButton');
  let buttonNote = document.getElementById('buttonNote');
  let menuNote = document.getElementById('menuNote');
  let course1 = document.getElementById('course1');
  let course2 = document.getElementById('course2');
  
  loadingGif.style.display = 'block';
  console.log('init pip');
  context.pipElement.src = `./video/${context.courseId}.mp4`;
  context.currentTocIndex = -3; // need this for checkTOC to work 

  function setCourseButtonState(button, pointerBlocked) {
    if (pointerBlocked) {
      button.style.color = 'white';
      button.style.opacity = 0.5;
      button.style.cursor = 'default';
      button.style.pointerEvents = 'none';
    } else {
      button.style.color = 'orange';
      button.style.opacity = 1;
      button.style.cursor = 'pointer';
      button.style.pointerEvents = 'auto';
    }
  }

  // Set initial button states based on courseId
  setCourseButtonState(course1, context.courseId.includes('72'));
  setCourseButtonState(course2, context.courseId.includes('71'));

  return new Promise((resolve, reject) => {
    context.pipElement.addEventListener('canplaythrough', () => {
      console.log('Video can play through');
      loadingGif.style.display = 'none';
      resolve();
    });

    context.pipElement.addEventListener('error', (e) => {
      console.error('Error loading video:', e);
      loadingGif.style.display = 'none';
      handleError(2, new Error('Failed to start video: ' + e.message)); // Handle error ID 2
      reject(e);
    });

    context.pipElement.addEventListener('loadedmetadata', () => {
      if (context.courseId.startsWith('p')) {
        context.pipElement.autoplay = false;
      } else {
        context.pipElement.autoplay = true;
        context.pipElement.play().catch(error => {
          console.error('Error playing video:', error);
          promptUser(context);
        });
      }
    });

    // Example usage
    // Assuming context is already defined and pipElement is part of it
  });
}

// Function to check pipElement status and update UI accordingly
function checkPipElementStatus(context) {
  console.log("state 1 ")
  if (!context.pipElement.paused && !context.pipElement.ended) {
    // Video is playing
    console.log("state 2 this is what we need ")
    let courseButton = document.getElementById('courseButton');
    let buttonNote = document.getElementById('buttonNote');
    let menuNote = document.getElementById('menuNote');

    courseButton.innerHTML = '<img src="../images/icon-pause.png" style="width: 50px; height: 50px;" />';
    buttonNote.textContent = 'click to pause...';
    menuNote.textContent = '...';
    courseButton.style.display = "block";
    buttonNote.style.display = "block";
    menuNote.style.display = "block";
    courseButton.classList.remove('cam-flashing');
    menuNote.classList.add('cam-flashing');
  }
}

function promptUser(context) {
  let courseButton = document.getElementById('courseButton');
  let buttonNote = document.getElementById('buttonNote');
  let menuNote = document.getElementById('menuNote');
  courseButton.innerHTML = '<img src="./images/icon-play.png" style="width: 50px; height: 50px;" />';
  buttonNote.textContent = 'start';
  menuNote.textContent = 'click to start...';
  courseButton.style.display = "block";
  buttonNote.style.display = "block";
  menuNote.style.display = "block";
  courseButton.classList.add('cam-flashing');
  menuNote.classList.add('cam-flashing');
}


