@echo off
echo Installing SumaRise Server Task...
schtasks /create /tn "SumaRise Server" /xml "SumaRise-Server-Task.xml" /f
echo Task installation complete. The SumaRise server will now start automatically when you log in.
pause
