set "PATH=%~dp0..\devenv\git;%~dp0..\devenv\git\bin;%PATH%"
set "PATH=%~dp0..\devenv\nodejs;%~dp0..\devenv\nodejs\node_modules\npm;%PATH%"
set "PATH=%~dp0..\devenv\python;%~dp0..\devenv\python\Scripts;%PATH%"

set PYTHON=%~dp0..\devenv\python\python.exe

set APPDATA=%~dp0../devenv/MsVSCode
set USERPROFILE=%~dp0../devenv/MsVSCode

start "" %~dp0../devenv/MsVSCode/Code.exe %~dp0
