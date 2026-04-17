@echo off
echo Starting SumaRise Text Summarization Server...
cd /d %~dp0
echo %DATE% %TIME% - Server starting > server-log.txt
node server.js >> server-log.txt 2>&1
