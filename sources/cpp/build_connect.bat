call \" C:\Program Files\Microsoft Visual "Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat\ x64  
cl /EHsc /std:c++17 connect.cpp /link /out:..\..\client\connect.exe user32.lib ws2_32.lib shell32.lib 
