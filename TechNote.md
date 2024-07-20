#mainJS
    canvasWidth: 1440,
    canvasHeight: 1080,

#recorderJS
context.canvasCombined.width = 1440;
context.canvasCombined.height = 1080;

  context.ctxCombined.drawImage(
    activeVideoElement, // Image source
    360, 180, // Source x and y (top-left corner of the image)
    720, // Source width (25% of the original width)
    360, // Source height (25% of the original height)
    videoBX, videoBY, // Destination x and y on the canvas
    videoBWidth, videoBHeight // Destination width and height on the canvas
  );

![alt text](image-1.png)

## how to git lfs

# Install Git LFS globally (if not already installed)
git lfs install

# Navigate to your project directory
cd ./project

# Initialize Git (if not already initialized)
git init

# Track MP4 files with Git LFS
git lfs track "*.mp4"

# Add files to the staging area, including .gitattributes
git add .gitattributes
git add *

# Commit your changes
git commit -m "0720 backup"

# Set the branch name to 'main'
git branch -M main

# Add the remote repository
git remote add origin https://github.com/simonisHereHelp/provisio_deploy.git

# Push your changes to GitHub
git push -u origin main
