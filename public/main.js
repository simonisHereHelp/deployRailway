import { initializeWebcam, resizeCanvases } from './Js/webcam.js';
import { loadPage, loadPip, activateTextButtons } from './Js/newPage.js';
import { updateCaptions } from './Js/captions.js';
import { checkConnection, handleUnexpectedErrors } from './Js/errors.js';
import { checkTOC, updateTOC, updateCamSource } from './Js/chatBot.js';

let isEventListenersAdded = false;

var HandCheckrApp = new Vue({
  el: '#hsien-handCheckr',
  data: {
    courseId: 'c72a',
    courseMetaId: '',
    recordId: null,
    currentDataStart: '',
    scopeOn: '--',
    recordingMode: false,
    currentPipTime: 0,
    captions: [],
    topCam: 'USB Camera', //
    scopeCam: 'HY-500B',
    mediaRecorder: null,
    recordedChunks: [],
    socket: null,
    canvasCombined: null,
    ctxCombined: null,
    recordPath: '',
    currentTOC: '',
    videoLength: 0,
    startText: '',
    pauseText: '',
    nextText: '',
    completedText: '',
    pageConfig: null,
    choiceBScript: '',
    tocTimeArray: [],
    sessionHistory: [],
    backClickCounter: 0,
    durationKey: 3,
    savedPhotos: [],
    savedTimeStamps: [],
    uploadTimeStamp: ''
  },

  async mounted() {
    this.recordingMode = false;
    this.canvasTop = document.getElementById("hsien-canvas-top");
    this.canvasScope = document.getElementById("hsien-canvas-scope");
    this.ctxTop = this.canvasTop.getContext("2d");
    this.ctxScope = this.canvasScope.getContext("2d");
    this.TopVideoElement = null;
    this.ScopeVideoElement = null;
    this.pipElement = document.getElementById("hsien-pip");
    this.canvasCombined = document.createElement('canvas');
    this.ctxCombined = this.canvasCombined.getContext('2d');
    await loadPip(this)
    await loadPage(this)
    await initializeWebcam(this);
    this.addEventListeners();
    await this.tocEventListener();
    await this.pipEventListener();
    this.tocSliderSync();
    
    window.addEventListener('resize', resizeCanvases);
    window.addEventListener('load', resizeCanvases);
    resizeCanvases();
    
    this.pipElement.addEventListener('timeupdate', () => {
      let ctime = this.pipElement.currentTime
      updateCaptions(this.pipElement, this.captions);
      checkTOC(this, ctime);
          // Check if currentTime exceeds the currentEndTime
      if (this.currentEndTime !== undefined && ctime >= this.currentEndTime) {
        this.pipElement.pause();
        this.currentEndTime = undefined; // Reset currentEndTime to avoid repeated pauses
      }
      let noteContainer = document.getElementById('menuNote');
      let secondsLeft = this.pipElement.duration - ctime;
      noteContainer.innerHTML = `<span>Session left: ${Math.round(secondsLeft)} seconds...</span>`;
      if (ctime > this.durationKey) { this.updateSessionHistory(this.courseId) }
      console.log("current toc Index", this.currentTocIndex)
    });

    if (localStorage.getItem('resumePlayback') === 'true') {
      localStorage.removeItem('resumePlayback');
      this.pipElement.play();
    }
    
    checkConnection();
    handleUnexpectedErrors();
    await updateCamSource("0", this)
  },

  methods: {
    addEventListeners() {
      if (!isEventListenersAdded) {
        this.courseButtonListener();
        this.chatTriggerListener();
        this.helpListener();

        isEventListenersAdded = true;
      }
    },

    updateSessionHistory(id) {
      if (id !== this.sessionHistory[0]) {
        this.sessionHistory.unshift(id);
      }
      this.backClickCounter = 0;
    },

    tocSliderSync() {
      const tocSlider = document.getElementById('tocSlider');

      // Update slider max value when video metadata is loaded
      this.pipElement.addEventListener('loadedmetadata', () => {
        tocSlider.max = Math.floor(this.pipElement.duration);
      });

      // Update slider value while video is playing
      this.pipElement.addEventListener('timeupdate', () => {
        tocSlider.value = Math.floor(this.pipElement.currentTime);
      });

      // Seek video when slider value changes
      tocSlider.addEventListener('input', () => {
        this.pipElement.currentTime = tocSlider.value;
      });

      // Play video when slider is released
      tocSlider.addEventListener('change', () => {
        this.pipElement.currentTime = tocSlider.value;
        this.pipElement.play();
      });
    },

    async tocEventListener() {
      document.querySelectorAll('.hsien-chatSession').forEach((session) => {
        session.addEventListener('click', (event) => {
          const id = event.target.id;
          const newIndex = parseInt(id.slice(1), 10)
          const jumpToTime = event.target.getAttribute('data-start');
          const temp = event.target.textContent
          const prevIndex = this.currentTocIndex
          this.currentTocIndex = newIndex
          this.pipElement.currentTime = parseFloat(jumpToTime) + 0.5;
          updateTOC(prevIndex, newIndex, this)
          this.pipElement.play();
        });
      });
    },

    chatTriggerListener() {
      const chatOpenTrigger = document.querySelector(".chatBot .chatBotHeading #chatOpenTrigger");
      const chatCloseTrigger = document.querySelector(".chatBot .chatBotHeading #chatCloseTrigger");

      // Add event listener for chatOpenTrigger
      chatOpenTrigger.addEventListener('click', () => {
        openChatBot();
        chatOpenTrigger.style.display = "none";
        chatCloseTrigger.style.display = "block";
      });

      // Add event listener for chatCloseTrigger
      chatCloseTrigger.addEventListener('click', () => {
        closeChatBot();
        chatOpenTrigger.style.display = "block";
        chatCloseTrigger.style.display = "none";
      });
    },

    async pipEventListener() {
      let courseButton = document.getElementById('courseButton');
      let nextButton = document.getElementById('nextButton');

      let helpButton = document.getElementById('helpButton');
      let menuNote = document.getElementById('menuNote');
      let buttonNote = document.getElementById('buttonNote');

      this.pipElement.addEventListener("loadedmetadata", () => {
        if (this.pipElement.currentTime === 0) {
          courseButton.innerHTML = '<img src="./images/icon-play.png" style="width: 50px; height: 50px;" />';
          buttonNote.textContent = 'new session now'
          menuNote.textContent = 'click to start...'
          courseButton.style.display = "block"
          buttonNote.style.display = "block"
          menuNote.style.display = "block"
          courseButton.classList.add('cam-flashing');
          menuNote.classList.add('cam-flashing')
        }
      });

      // Handle video play state
      this.pipElement.addEventListener("play", () => {
        courseButton.classList.remove('cam-flashing');
        courseButton.innerHTML = '<img src="./images/icon-pause.png" style="width: 50px; height: 50px;" />';
        buttonNote.textContent = this.pauseText
        menuNote.classList.add('cam-flashing')
        courseButton.style.display = "block"
        nextButton.style.display = "none"
        checkTOC(this, this.pipElement.currentTime);
      });

      // Handle video pause state
      this.pipElement.addEventListener("pause", () => {
        courseButton.classList.add('cam-flashing');
        courseButton.innerHTML = '<img src="./images/icon-play.png" style="width: 50px; height: 50px;" />';
        buttonNote.textContent = this.startText
        menuNote.classList.remove('cam-flashing')
        courseButton.style.display = "block"
        nextButton.style.display = "none"
      });

      // Handle video ended state
      this.pipElement.addEventListener("ended", () => {
        courseButton.style.display = "none"
        menuNote.textContent = this.endNote
        menuNote.classList.remove('cam-flashing')
        nextButton.innerHTML = `<img src="./images/icon-next.png" style="width: 40px; height: 40px;" />`
        buttonNote.textContent = this.nextText
        nextButton.style.display = "block"
        nextButton.classList.add('cam-flashing')

        // Update Text Buttons states on video end
        const buttonStates = this.endButtonStates;
        activateTextButtons(buttonStates);
      });
    },

    async courseButtonListener() {
      //courseButton
      let courseButton = document.getElementById('courseButton');
      let nextButton = document.querySelector('#nextButton')
      let stepBack = document.querySelector('#stepBack')
      let choiceB = document.querySelector('#choiceB')
      let course1 = document.querySelector('#course1')
      let course2 = document.querySelector('#course2')

      courseButton.addEventListener('click', async () => {
        courseButton.style.border = 'none';
        courseButton.style.outline = 'none';
        try {
          const readyState = this.pipElement.readyState;

          if (readyState >= this.pipElement.HAVE_ENOUGH_DATA) {
            if (this.pipElement.paused) {
              await this.pipElement.play();
            } else {
              await this.pipElement.pause();
            }
          } else {
            console.log("pip, do nothing");
          }
        } catch (error) {
          console.error('Error during media button click:', error);
        }
      });

      nextButton.addEventListener('click', async () => {
        nextButton.disabled = true;
        try {
          eval(this.nextScript);
        } catch (error) {
          console.error('Error executing nextScript:', error);
        } finally {
          nextButton.disabled = false; // Re-enable the button after execution
        }
      });

      choiceB.addEventListener('click', async () => {
        choiceB.disabled = true;
        try {
          eval(this.choiceBScript);
        } catch (error) {
          console.error('Error executing choiceBScript:', error);
        } finally {
          choiceB.disabled = false; // Re-enable the button after execution
        }
      });

      function setCourseButtons(activeButton, inactiveButton) {
        activeButton.style.color = 'orange';
        activeButton.style.opacity = 1;
        activeButton.style.cursor = 'pointer';
        activeButton.style.pointerEvents = 'auto';

        inactiveButton.style.color = 'white';
        inactiveButton.style.opacity = 0.5;
        inactiveButton.style.cursor = 'default';
        inactiveButton.style.pointerEvents = 'none';
      }

      course1.addEventListener('click', async () => {
        setCourseButtons(course2, course1);
        course1.disabled = true;
        try {
          await this.newPage('c72a')
        } catch (error) {
          console.error('Error executing choiceBScript:', error);
        } finally {
          course1.disabled = false; // Re-enable the button after execution
        }
      });

      course2.addEventListener('click', async () => {
        setCourseButtons(course1, course2);
        course2.disabled = true;
        try {
          await this.newPage('c71a')
        } catch (error) {
          console.error('Error executing choiceBScript:', error);
        } finally {
          course2.disabled = false; // Re-enable the button after execution
        }
      });

      stepBack.addEventListener('click', async () => {
        // Calculate the index ensuring it stays within bounds
        let id = Math.min(this.backClickCounter, this.sessionHistory.length - 1);

        // Get the backSessionId from the session history
        let backSessionId = this.sessionHistory[id];

        // Check if backSessionId is null or undefined and set it to the current courseId if true
        if (!backSessionId) {
          backSessionId = this.courseId;
        }

        try {
          await this.newPage(backSessionId);
          this.backClickCounter++;
        } catch (error) {
          console.error('Error stepping back:', error);
        }
      });
    },

    helpListener() {
      const openHelp = document.querySelector('#openHelp');
      const closeHelp = document.querySelector('#closeHelp');
      const helpBackdrop = document.querySelector('#helpBackdrop');

      // Show the help backdrop and add the cam-flashing class
      openHelp.addEventListener('click', () => {
        helpBackdrop.style.display = 'block';
        setTimeout(() => {
          closeHelp.classList.add('cam-flashing');
        }, 2000); // 1000 milliseconds = 1 second
      });

      // Hide the help backdrop and remove the cam-flashing class
      closeHelp.addEventListener('click', () => {
        helpBackdrop.style.display = 'none';
        closeHelp.classList.remove('cam-flashing');
      });
    },

    async newPage(id) {
      this.courseId = id;
      await loadPip(this);
      await loadPage(this);
    },
  },

  created() {
    checkConnection();
    handleUnexpectedErrors();
  }
});
