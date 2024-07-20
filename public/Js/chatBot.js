import { handleError } from './errors.js';
import { examplesBlog } from './examplesBlog.js';
import { recordBlog } from './recordBlog.js';
import { savePhoto } from './savePhoto.js';
import { uploadPhotos } from './uploadPhotos.js';

let isChatBotListenersAdded = false;

export async function initializeChatBot(context) {
  try {
    const videoText = await fetchVideoText(context);
    context.tocTimeArray = genArray(videoText);

    assignIndex(videoText);

    const chatBotSession = document.querySelector(".chatBot .chatBody .hsien-chatSession");
    if (!chatBotSession) {
      throw new Error("ChatBot session element not found");
    }

    if (videoText === "##error##") {
      chatBotSession.innerHTML = `
        <p class="hsien-textHighlight">
          <span class="ht-textSec hsien-chatSession" data-start="0.00" data-end="500.00" data-scope="0">
            #review recorded video
          </span>
        </p>`;
    } else {
      chatBotSession.innerHTML = videoText.innerHTML;
    }

    openChatBot();
    addChatBotEventListeners(context);
  } catch (error) {
    handleError(6, "ChatBot initialization error: " + error.message); // Error ID 6 for 'ChatBot initialization error'
    console.error("Error during ChatBot initialization:", error);
  }
}

async function fetchVideoText(context) {
  const url = `./video/${context.courseMetaId}.txt`;  
  let retryCount = 0;
  const maxRetries = 3;

  while (retryCount < maxRetries) {
    try {
      const response = await fetch(url);
      console.log('Fetch response:', response);
      
      if (!response.ok) {
        throw new Error(`Network response was not ok. Status: ${response.status} - ${response.statusText}`);
      }

      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'text/html');
      return doc.querySelector('.hsien-textHighlight');
    } catch (error) {
      retryCount++;
      console.error(`Error fetching video text (attempt ${retryCount}):`, error);

      if (retryCount >= maxRetries) {
        // Log the error internally without showing visual error message to the user
        handleError(5, new Error(`Error loading TXT file for course ${context.courseId}: ${error.message}`));
        // Fallback to cached or default content
        return "##error##";
      }
    }
  }
}

function genArray(videoText) {
  const elements = videoText.querySelectorAll('.ht-textSec.hsien-chatSession');
  const array = Array.from(elements).map((element, index)=> ({
    index: `i${index}`,
    startTime: parseFloat(element.getAttribute('data-start')),
    endTime: parseFloat(element.getAttribute('data-end')),
    dataScope: element.getAttribute('data-scope')
  }));
  return array;
}

function assignIndex(videoText) {
  const elements = videoText.querySelectorAll('.ht-textSec.hsien-chatSession');
  elements.forEach((element, index) => {
    element.id = `i${index}`;
  });
}

export function checkTOC(context, currentTime) {
  const newIndex = getTOCIndex(currentTime, context.tocTimeArray);
  const currentIndex = context.currentTocIndex;
  if (newIndex !== -1 && newIndex !== currentIndex) {
    const prevIndex = context.currentTocIndex;
    context.currentTocIndex = newIndex;
    updateTOC(prevIndex, newIndex, context);
  }
}

function getTOCIndex(currentTime, tocTimeArray) {
  for (let i = 0; i < tocTimeArray.length; i++) {
    if (currentTime >= tocTimeArray[i].startTime && currentTime <= tocTimeArray[i].endTime) {
      return i;
    }
  }
  return -1;
}

export function addChecker(context, textNote) {
  const targetID = `i${context.currentTocIndex}`;
  const targetElement = document.getElementById(targetID);
  console.log("target ", targetID);

  if (targetElement) {
    const checkerIcon = `<img src="./images/checkerIcon.svg" alt="Checked" style="width: 20px; height: 20px; vertical-align: middle;">`;
    const existingText = targetElement.innerHTML;

    if (!existingText.includes('src="./images/checkerIcon.svg"')) {
      targetElement.innerHTML = `${checkerIcon} ${existingText} ${textNote}`;
    }
  }
}


export async function updateTOC(prevIndex, newIndex, context) {
  if (prevIndex === newIndex) { return; }
  const highlightColor = "orange";
  const prevDiv = `i${prevIndex}`;
  const prevElement = document.getElementById(prevDiv)  || null;
  if (prevElement) {
    prevElement.style.backgroundColor = "white";
    prevElement.style.color = "black";
  }
  const newDiv = `i${newIndex}`;
  const newElement = document.getElementById(newDiv) || null;
  if (newElement) {
    newElement.style.backgroundColor = highlightColor;
    newElement.style.color = "white";
    context.currentTOC = newElement.textContent; // Use textContent to get the text content only
    await updateCamSource(newElement.getAttribute("data-scope"), context);  // "0" or "1"

    const openScript = newElement.getAttribute("open-script") || null;

    if (openScript) {
      eval(openScript); // Evaluate the open script immediately    
      context.currentEndTime = parseFloat(newElement.getAttribute("data-end"));
    }

  }
}

export async function updateCamSource(dataScope, context) {
  if (dataScope === '0') {
    context.canvasTop.style.display = 'block';
    context.canvasScope.style.display = 'none';
    context.TopVideoElement = document.querySelector('video#topCam');
  } else {
    context.canvasTop.style.display = 'none';
    context.canvasScope.style.display = 'block';
    context.ScopeVideoElement = document.querySelector('video#scopeCam');
  }
}

function addChatBotEventListeners(context) {
  if (!isChatBotListenersAdded) {
    document.querySelectorAll('.hsien-chatSession').forEach((session) => {
      session.addEventListener('click', (event) => {
        const id = event.target.id;
        const newIndex = parseInt(id.slice(1), 10);
        const jumpToTime = event.target.getAttribute('data-start');
        const temp = event.target.textContent;
        const prevIndex = context.currentTocIndex;
        context.currentTocIndex = newIndex;
        context.pipElement.currentTime = parseFloat(jumpToTime) + 0.5;
        updateTOC(prevIndex, newIndex, context);
        context.pipElement.play();
      });
    });

    const chatOpenTrigger = document.querySelector(".chatBot .chatBotHeading #chatOpenTrigger");
    const chatCloseTrigger = document.querySelector(".chatBot .chatBotHeading #chatCloseTrigger");

    if (chatOpenTrigger) {
      chatOpenTrigger.addEventListener('click', () => {
        openChatBot();
        chatOpenTrigger.style.display = "none";
        chatCloseTrigger.style.display = "block";
      });
    }

    if (chatCloseTrigger) {
      chatCloseTrigger.addEventListener('click', () => {
        closeChatBot();
        chatOpenTrigger.style.display = "block";
        chatCloseTrigger.style.display = "none";
      });
    }

    isChatBotListenersAdded = true;
  }
}
