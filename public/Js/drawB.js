import { camElement, TOP_DRAW_WIDTH, TOP_DRAW_HEIGHT, SCOPE_DRAW_WIDTH, SCOPE_DRAW_HEIGHT } from './webcam.js';

export async function drawCombinedStream(context) {
  context.canvasCombined.width = TOP_DRAW_WIDTH;
  context.canvasCombined.height = TOP_DRAW_HEIGHT;
  context.ctxCombined.clearRect(0, 0, context.canvasCombined.width, context.canvasCombined.height);

  console.log('drawCombinedStream:', context.scopeOn);

  // Calculate dimensions for Video B (camElement) to cover the entire canvas
  const videoBWidth = TOP_DRAW_WIDTH; 
  const videoBHeight = TOP_DRAW_HEIGHT;

  // Determine the correct cam element based on the scope
  const currentCamElement = context.scopeOn === '1' ? camElement.scope : camElement.top;
  if (!currentCamElement) {
    console.error('Camera element is not defined');
    return;
  }

  // Apply cropping and draw Video B (currentCamElement)
  const sourceWidth = context.scopeOn === '1' ? SCOPE_DRAW_WIDTH : TOP_DRAW_WIDTH;
  const sourceHeight = context.scopeOn === '1' ? SCOPE_DRAW_HEIGHT : TOP_DRAW_HEIGHT;
  const sourceX = (currentCamElement.videoWidth - sourceWidth) / 2; // Center crop for videoB
  const sourceY = 0;

  context.ctxCombined.drawImage(
    currentCamElement, // Image source
    sourceX, sourceY, // Source x and y
    sourceWidth, sourceHeight, // Source width and height
    0, 0, // Destination x and y on the canvas
    videoBWidth, videoBHeight // Destination width and height on the canvas
  );

  // Continue drawing the video stream
  context.drawCombinedStreamAnimationFrame = requestAnimationFrame(() => drawCombinedStream(context));
}
