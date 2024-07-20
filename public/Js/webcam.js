import { handleError } from './errors.js';

let camElement = { top: null, scope: null }; // Declare global camElement

const TOP_DRAW_WIDTH = 1440;
const TOP_DRAW_HEIGHT = 1080;
const SCOPE_DRAW_WIDTH = 2592;
const SCOPE_DRAW_HEIGHT = 1944;

export async function initializeWebcam(context) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  let topCamFound = false;
  let scopeCamFound = false;
  let errorMessages = [];

  for (let device of videoDevices) {
      if (device.label.includes(context.topCam) && !topCamFound) {
          try {
              const resolution = await checkWebcamStatus(device, "Top", context);
              topCamFound = true;
          } catch (error) {
              errorMessages.push(`Top Camera Error: ${error.message}`);
          }
      } else if (device.label.includes(context.scopeCam) && !scopeCamFound) {
          try {
              const resolution = await checkWebcamStatus(device, "Scope", context);
              scopeCamFound = true;
          } catch (error) {
              errorMessages.push(`Scope Camera Error: ${error.message}`);
          }
      }
  }

  if (errorMessages.length > 0) {
      handleError(1, new Error(errorMessages.join('; ')));
  }
}

async function checkWebcamStatus(device, preText, context) {
  try {
      const stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: device.deviceId }
      });
      stream.getTracks().forEach(track => track.stop());

      const resolution = await initializeCamera(preText, device, context);
      return resolution;

  } catch (error) {
      throw new Error(`Error accessing video stream for ${preText}VideoElement: ${error.message}`);
  }
}


async function initializeCamera(preText, device, context) {
  try {
    const constraints = {
      video: {
        deviceId: { exact: device.deviceId }
      }
    };

    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();

    const maxWidth = capabilities.width.max || (preText === "Top" ? TOP_DRAW_WIDTH : SCOPE_DRAW_WIDTH);
    const maxHeight = capabilities.height.max || (preText === "Top" ? TOP_DRAW_HEIGHT : SCOPE_DRAW_HEIGHT);

    track.stop();

    const optimalConstraints = {
      video: {
        deviceId: { exact: device.deviceId },
        width: maxWidth,
        height: maxHeight
      }
    };

    const optimalStream = await navigator.mediaDevices.getUserMedia(optimalConstraints);
    const videoElement = document.createElement('video');
    videoElement.srcObject = optimalStream;
    videoElement.play();

    if (preText === "Top") {
      videoElement.top_draw_width = TOP_DRAW_WIDTH;
      videoElement.top_draw_height = TOP_DRAW_HEIGHT;
      camElement.top = videoElement;
    } else {
      videoElement.scope_draw_width = SCOPE_DRAW_WIDTH;
      videoElement.scope_draw_height = SCOPE_DRAW_HEIGHT;
      camElement.scope = videoElement;
    }

    context[`${preText}VideoElement`] = videoElement;
    if (preText === "Top") {
      displayTopStream(videoElement, context[`ctx${preText}`], context[`canvas${preText}`]);
    } else {
      displayScopeStream(videoElement, context[`ctx${preText}`], context[`canvas${preText}`]);
    }

    return { width: maxWidth, height: maxHeight };

  } catch (error) {
    throw new Error(`Error accessing video stream for ${preText}VideoElement: ${error.message}`);
  }
}

function displayTopStream(videoElement, ctx, canvasElement) {
  if (videoElement.paused || videoElement.ended) return;

  const sourceWidth = videoElement.top_draw_width;
  const sourceHeight = videoElement.top_draw_height;
  const destWidth = canvasElement.width;
  const destHeight = canvasElement.height;
  const sourceX = (videoElement.videoWidth - sourceWidth) / 2;
  const sourceY = 0;

  ctx.clearRect(0, 0, destWidth, destHeight);
  ctx.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
  requestAnimationFrame(() => displayTopStream(videoElement, ctx, canvasElement));
}

function displayScopeStream(videoElement, ctx, canvasElement) {
  if (videoElement.paused || videoElement.ended) return;

  const sourceWidth = videoElement.scope_draw_width;
  const sourceHeight = videoElement.scope_draw_height;
  const destWidth = canvasElement.width;
  const destHeight = canvasElement.height;

  ctx.clearRect(0, 0, destWidth, destHeight);
  ctx.drawImage(videoElement, 0, 0, sourceWidth, sourceHeight, 0, 0, destWidth, destHeight);
  requestAnimationFrame(() => displayScopeStream(videoElement, ctx, canvasElement));
}


export function resizeCanvases() {
  const container = document.querySelector('.hsien-canvas-container');
  if (!container) return;
  
  const aspectRatio = 4 / 3;
  let width = window.innerWidth;
  let height = window.innerHeight;

  // Calculate the maximum width and height that fit within the viewport while maintaining the aspect ratio
  if (width / height > aspectRatio) {
      width = height * aspectRatio;
  } else {
      height = width / aspectRatio;
  }

  // Set the container dimensions
  container.style.width = `${width}px`;
  container.style.height = `${height}px`;

  // Adjust the specific canvas sizes
  const canvasTop = document.getElementById('hsien-canvas-top');
  const canvasScope = document.getElementById('hsien-canvas-scope');
  
  if (canvasTop && canvasScope) {
      canvasTop.width = width;
      canvasTop.height = height;
      canvasScope.width = width;
      canvasScope.height = height;
  }
}

export { camElement, TOP_DRAW_WIDTH, TOP_DRAW_HEIGHT, SCOPE_DRAW_WIDTH, SCOPE_DRAW_HEIGHT }; // Export camElement and dimensions