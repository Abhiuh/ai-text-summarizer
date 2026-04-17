@echo off
echo Opening port 3000 in Windows Firewall for SumaRise Server...
netsh advfirewall firewall add rule name="SumaRise Server" dir=in action=allow protocol=TCP localport=3000
echo Firewall rule added. Your SumaRise server should now be accessible from other devices.
pause
