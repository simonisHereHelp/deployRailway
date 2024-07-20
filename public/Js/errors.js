export function checkConnection() {
    if (!navigator.onLine) {
      handleError(3, new Error("No internet connection"));
    }
  }
  
  export function handleUnexpectedErrors() {
    window.addEventListener('error', (event) => {
      handleError(4, event.error);
    });
  }
  
  export async function handleError(errorId, error) {
    console.error(`Error ID ${errorId}:`, error);
    try {
      const response = await fetch('err.json');
      const errors = await response.json();
      const errorData = errors.find(err => err.id === errorId);
  
      if (errorData) {
        const errorHtml = `
        <div id="photo-box" style="z-index:1500; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); width: 100vw; height: 100vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: var(--font-size-3);">
          <div style="width: 80%; display: flex; flex-direction: column; justify-content: center; align-items: center;">
            <div>
              <strong>Error:</strong> ${errorData.error}<br><br>
              <strong>Tell Sign:</strong> ${errorData.tellsign}<br><br>
              <strong>Possible Causes:</strong> ${errorData.possible_causes}<br><br>
              <strong>How to Handle:</strong> ${errorData.how_to_handle}<br><br>
              <strong>Ref:</strong> ${error.message}<br>
            </div>
          </div>
        </div>
        `;
        document.querySelector('#hsien-handCheckr').insertAdjacentHTML('beforeend', errorHtml);
      }
    } catch (fetchError) {
      console.error('Error fetching error data:', fetchError);
      displayErrorPopup("An unexpected error occurred. Please try again or contact support.");
    }
  }
  
  
  