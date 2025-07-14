@echo off
echo Starting Cloudinary upload in background...
start /B node upload-artvee-to-cloudinary.js > cloudinary-upload.log 2>&1
echo Upload started! Check cloudinary-upload.log for progress.
echo You can close this window.