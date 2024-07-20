// File: js/goodbye.js

export async function loadGoodbyePage(context) {
   console.log('goodbye page')
    // Create a full-screen overlay
    const overlay = document.createElement('div');
    overlay.id = 'goodbyeOverlay';
    overlay.classList.add('hidden'); // Ensure initially hidden state
  
    // Fetch the content of goodbye.html
    try {
      const response = await fetch('./Js/goodbye.html');
      let text = await response.text();
      const currentDate = new Date().toISOString().split('T')[0];
      text = text.replace('<time datetime="2024-07-18">--</time>', `<time datetime="${currentDate}">${currentDate}</time>`);
      overlay.innerHTML = text;
      document.body.appendChild(overlay);
      overlay.style.display = 'block'; // Ensure display is set to block before opacity change
  
      // Trigger the fade-in effect
      requestAnimationFrame(() => {
        overlay.classList.add('visible');
      });
  
      // Add an event listener to the exit button to close the window
      const exitButton = overlay.querySelector('#exit');
      if (!exitButton) {
        console.error('Exit button not found in overlay');
        return;
      }
  
      exitButton.addEventListener('click', () => {
        // Check if the window has an opener and the opener is not closed
        if (window.opener && !window.opener.closed) {
          window.opener.document.querySelector('#hsien-handCheckr').__vue__.pipElement.play();
        }
        window.close();
      });
    } catch (error) {
      console.error('Error loading goodbye.html:', error);
      document.body.removeChild(overlay);
    }
  }
  