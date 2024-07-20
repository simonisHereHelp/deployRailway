import { camElement, TOP_DRAW_WIDTH, TOP_DRAW_HEIGHT, SCOPE_DRAW_WIDTH, SCOPE_DRAW_HEIGHT } from './webcam.js';

export async function drawCombinedStream(context) {
  context.ctxCombined.clearRect(0, 0, context.canvasCombined.width, context.canvasCombined.height);

  console.log('drawCombinedStream:', context.scopeOn);

  // Calculate dimensions and positions based on canvas width
  const canvasWidth = context.canvasCombined.width;
  const canvasHeight = context.canvasCombined.height;

  // Calculate dimensions for Video A (pipElement)
  const videoAWidth = canvasWidth * 0.25; // Video A width is 25% of canvas width
  const videoAHeight = videoAWidth * (3 / 4); // Maintain 4:3 aspect ratio

  // Calculate dimensions for Video B (camElement) to cover 75% of the canvas width
  const videoBWidth = canvasWidth * 0.75; // Video B width is 75% of canvas width
  const videoBHeight = videoBWidth * (3 / 4); // Maintain 4:3 aspect ratio

  // Position calculations
  const videoAX = 0;
  const videoAY = 0;

  const videoBX = videoAWidth;
  const videoBY = 0;

  // Draw Video A (context.pipElement)
  context.ctxCombined.drawImage(
    context.pipElement, // Image source
    videoAX, videoAY, // Destination x and y on the canvas
    videoAWidth, videoAHeight // Destination width and height on the canvas
  );

  // Determine the correct video element based on the scope
  const currentCamElement = context.scopeOn === '1' ? camElement.scope : camElement.top;
  if (!currentCamElement) {
    console.error('Video element is not defined');
    return;
  }

  // Apply cropping and draw Video B (currentCamElement)
  const sourceWidth = context.scopeOn === '1' ? SCOPE_DRAW_WIDTH : TOP_DRAW_WIDTH;
  const sourceHeight = context.scopeOn === '1' ? SCOPE_DRAW_HEIGHT : TOP_DRAW_HEIGHT;
  const destWidth = videoBWidth;
  const destHeight = videoBHeight;
  const sourceX = (currentCamElement.videoWidth - sourceWidth) / 2; // Center crop for videoB
  const sourceY = 0;

  context.ctxCombined.drawImage(
    currentCamElement, // Image source
    sourceX, sourceY, // Source x and y
    sourceWidth, sourceHeight, // Source width and height
    videoBX, videoBY, // Destination x and y on the canvas
    destWidth, destHeight // Destination width and height on the canvas
  );

  // Get the current time in yy/mm/dd hh:mm format
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const currentTime = `${year}/${month}/${day} ${hours}:${minutes}`;

  // Calculate and draw Text Box B (label with detailed information)
  const fontSize = canvasHeight * 0.03; // Set font size to 1.5% of canvas height
  context.ctxCombined.font = `${fontSize}px sans-serif`;
  context.ctxCombined.fillStyle = 'rgba(255, 255, 255, 0.7)';
  const activeLabel = context.scopeOn === '1' ? 'SCOPE VIEW' : 'BENCH VIEW';
  const textBoxBContent = `Recorded Id: ${context.recordId} (${activeLabel})\nTime: ${currentTime}\n`;
  wrapText(context.ctxCombined, textBoxBContent, 10, canvasHeight - 100, canvasWidth - 20, fontSize);

  // Continue drawing the video streams
  context.drawCombinedStreamAnimationFrame = requestAnimationFrame(() => drawCombinedStream(context));
}

function wrapText(context, text, x, y, maxWidth, lineHeight) {
  const lines = text.split('\n');
  let yPos = y;

  for (let i = 0; i < lines.length; i++) {
    let words = lines[i].split(' ');
    let line = '';

    for (let j = 0; j < words.length; j++) {
      const testLine = line + words[j] + ' ';
      const metrics = context.measureText(testLine);
      const testWidth = metrics.width;

      if (testWidth > maxWidth && j > 0) {
        context.fillText(line, x, yPos);
        line = words[j] + ' ';
        yPos += lineHeight;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, yPos);
    yPos += lineHeight;
  }
}
