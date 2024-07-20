export async function screenButtons(mode = 1) {
    const status = document.querySelector("#hsien-cam-status");
    let domHtml = '';
  
    switch(mode) {
      case 1:
        domHtml = ``;  //erase all buttons from screen
        break;
      case 2:
        domHtml = `
          <div id="savePhotoBtn" class="camera-status-topCam">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="52" height="52" fill="#FFA500" style="opacity: 1;">
              <path d="M149.1 64.8L138.7 96H64C28.7 96 0 124.7 0 160V416c0 35.3 28.7 64 64 64H448c35.3 0 64-28.7 64-64V160c0-35.3-28.7-64-64-64H373.3L362.9 64.8C356.4 45.2 338.1 32 317.4 32H194.6c-20.7 0-39 13.2-45.5 32.8zM256 192a96 96 0 1 1 0 192 96 96 0 1 1 0-192z"/>
            </svg>
          </div>`;
        break;
      case 3:
        domHtml = `
          <div id="discardPhoto" class="camera-status-topCam" style="display: flex; align-items: center; justify-content: center; border: 4px dashed orange; border-radius: 5px;">
          <span style="color:white;">Discard</span>
          </div>
          <div id="confirmPhoto" class="camera-status-topCam" style="display: flex; align-items: center; justify-content: center; border: 4px dashed orange; border-radius: 5px;">
            </svg><span style="color:white;">Confirm</span>
          </div>
          <div id="watchVideoAgain" class="camera-status-topCam" style="display: flex; align-items: center; justify-content: center; border: 4px dashed orange; border-radius: 5px;">
            <span style="color:white;">Watch Again</span>
          </div>`;
        break;
      default:
        domHtml = `<p>Invalid mode</p>`;
    }
  
    status.innerHTML = domHtml;
  }
  