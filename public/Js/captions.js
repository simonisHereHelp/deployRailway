import { handleError } from './errors.js';

export async function loadVTTFile(context) {
  let url = `./video/${context.courseMetaId}.vtt`
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch VTT file: ${response.status} ${response.statusText}`);
    }
    const vttText = await response.text();
    return parseVTT(vttText);
  } catch (error) {
    console.error('Error loading VTT file:', error);
    handleError(5, new Error(`Error loading VTT file for course ${context.courseId}: ${error.message}`));
  }
}

function parseVTT(vttText) {
  const captions = [];
  const lines = vttText.split('\n');
  let currentCaption = null;

  lines.forEach(line => {
    const timePattern = /^(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/;
    const timeMatch = line.match(timePattern);
    if (timeMatch) {
      if (currentCaption) captions.push(currentCaption);
      currentCaption = { start: parseTime(timeMatch[1]), end: parseTime(timeMatch[2]), text: '' };
    } else if (currentCaption) {
      if (line.trim() === '') {
        captions.push(currentCaption);
        currentCaption = null;
      } else {
        currentCaption.text += line + '\n';
      }
    }
  });

  if (currentCaption) captions.push(currentCaption);

  return captions;
}

function parseTime(timeString) {
  const parts = timeString.split(':');
  const hours = parseFloat(parts[0]);
  const minutes = parseFloat(parts[1]);
  const seconds = parseFloat(parts[2]);
  return hours * 3600 + minutes * 60 + seconds;
}

export function updateCaptions(video, captions) {
  const currentTime = video.currentTime;
  const captionElement = document.getElementById('hsien-vtt');
  const currentCaption = captions.find(caption => currentTime >= caption.start && currentTime <= caption.end);

  if (currentCaption) {
    captionElement.innerHTML = currentCaption.text;
  } else {
    captionElement.innerHTML = '';
  }
}
