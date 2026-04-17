Set WshShell = CreateObject("WScript.Shell")
StartupFolder = WshShell.SpecialFolders("Startup")
Set shortcut = WshShell.CreateShortcut(StartupFolder & "\SumaRise-Server.lnk")
shortcut.TargetPath = WshShell.CurrentDirectory & "\start-server.bat"
shortcut.WorkingDirectory = WshShell.CurrentDirectory
shortcut.Description = "Start SumaRise Text Summarization Server"
shortcut.Save
