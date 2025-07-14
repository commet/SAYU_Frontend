@echo off
echo Starting Artvee image download...
echo This will take approximately 60-90 minutes to complete.
echo The download will continue even if this window is closed.
echo.
echo Check progress in: images\download-progress.json
echo.
start /B node download-all-images.js > download-log.txt 2>&1
echo Download started in background.
echo Check download-log.txt for details.
pause