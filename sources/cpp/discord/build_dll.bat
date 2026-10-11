call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvarsall.bat" x64
cl /EHsc /LD /std:c++17 discord_rpc.cpp /link /out:..\..\..\client-new\discord_rpc.dll user32.lib ws2_32.lib shell32.lib
