@echo off
echo Starting Artvee AWS S3 Image Download...
echo.
echo This will download all 1,810 artworks.
echo Estimated time: 3-5 hours
echo The download will continue in the background.
echo.
echo Check progress in: images\download-progress-aws.json
echo Log file: aws-download-log.txt
echo.
start /B node download-with-aws-urls.js > aws-download-log.txt 2>&1
echo Download started in background.
echo.
echo To check progress, use:
echo   type images\download-progress-aws.json
echo.
pause