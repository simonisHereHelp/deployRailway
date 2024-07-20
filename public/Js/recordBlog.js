// File: js/recordBlog.js

export async function recordBlog(context) {
  // Create a full-screen overlay
  const overlay = document.createElement('div');
  overlay.id = 'blogOverlay';
  overlay.classList.add('hidden'); // Ensure initially hidden state

  // Fetch the content of recordBlog.html
  try {
    const response = await fetch('./Js/recordBlog.html');
    const text = await response.text();
    overlay.innerHTML = text;
    document.body.appendChild(overlay);
    overlay.style.display = 'block'; // Ensure display is set to block before opacity change

    // Trigger the fade-in effect
    requestAnimationFrame(() => {
      overlay.classList.add('visible');
    });

    // Add an event listener to the exit button to remove the overlay and resume the video
    const exitButton = overlay.querySelector('#exit');
    if (!exitButton) {
      console.error('Exit button not found in overlay');
      return;
    }

    exitButton.addEventListener('click', () => {
      overlay.classList.remove('visible'); // Trigger fade-out effect
      setTimeout(() => {
        overlay.style.display = 'none'; // Hide after fade-out transition
        document.body.removeChild(overlay);
        context.pipElement.play();
      }, 500); // Delay to match the fade-out transition duration
    });
  } catch (error) {
    console.error('Error loading recordBlog.html:', error);
    document.body.removeChild(overlay);
  }
}
