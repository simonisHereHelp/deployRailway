export function slideShow(context) {
    context.pipScriptMode = true;
  
    const container = document.getElementById('hsien-canvas-top');
  
    if (!document.querySelector('#photo-box')) {
        const html = `
            <div id="photo-box" style="z-index:1500; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); opacity: 0.95; background-color: white; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); width: 90vw; height: 90vh; display: flex; flex-direction: column; justify-content: center; align-items: center; font-size: var(--font-size-3);">
                <form id="employeeForm" style="display: flex; flex-direction: column; align-items: center; width: 100%; font-size: var(--font-size-3);">
                    <div class="form-group" style="margin-bottom: 15px; text-align: center;">
                        <label for="employeeName" style="font-size: var(--font-size-3);">Employee Name</label>
                        <input type="text" id="employeeName" name="employeeName" required="" style="display: block; margin: 0 auto; font-size: var(--font-size-3);">
                    </div>
                    <div class="form-group" style="margin-bottom: 15px; text-align: center;">
                        <button id="submit" type="submit" style="display: block; margin: 0 auto; background-color: orange; color: white; font-size: var(--font-size-3);">Submit</button>
                    </div>
                    <div id="submitNote" style="text-align: center; font-size: var(--font-size-3);">click to submit</div>
                </form>
            </div>
        `;
        document.querySelector('#hsien-handCheckr').insertAdjacentHTML('beforeend', html);
    }
  
    const sideElement = document.querySelector('.hsien-side-left');
    const webcamElement = document.querySelector('.hsien-webcam');
    const helpBackdrop = document.querySelector('#helpBackdrop');
    const cb = document.querySelector('#cbContainer');
    const photoBox = document.querySelector('#photo-box');
    const form = document.querySelector("#employeeForm");

  
    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Prevent default form submission
        const employeeName = document.querySelector("#employeeName").value;

        try {
            // Simulate data upload process
            // Replace this with actual data upload logic
            const dataUploadedSuccessfully = true;

            if (dataUploadedSuccessfully) {
                // Hide photoBox after submission
                photoBox.classList.add('hidden');
                cb.classList.remove('hidden');
                cb.classList.add('active');
                sideElement.classList.remove('hidden');
                webcamElement.style.display = 'block';
                helpBackdrop.classList.add('hidden');
  
                // Simulate loading new page after 1 second
                setTimeout(async () => {
                    await context.newPage('s001');
                }, 1000);
            } else {
                console.error('Data upload failed');
            }
        } catch (error) {
            console.error('Error capturing or uploading data:', error);
        } finally {
            // Always restore UI state
            setTimeout(() => {
                photoBox.innerHTML = "";
                photoBox.style.display = "none";
                context.pipElement.play(); // Adjust as per your context
            }, 4000);
        }
    });
}
