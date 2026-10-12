#include <windows.h>
#include <string>
#include <map>
#include <fstream>
#include <sstream>
#include <iostream>

using namespace std;

// Helper to trim strings
string trim(const string& str) {
    size_t first = str.find_first_not_of(" \t\r\n");
    if (first == string::npos) return "";
    size_t last = str.find_last_not_of(" \t\r\n");
    return str.substr(first, last - first + 1);
}

// Function to replace all occurrences of a substring
void replaceAll(string& source, const string& from, const string& to) {
    if (from.empty()) return;
    size_t start_pos = 0;
    while ((start_pos = source.find(from, start_pos)) != string::npos) {
        source.replace(start_pos, from.length(), to);
        start_pos += to.length();
    }
}

extern "C" __declspec(dllexport) bool GenerateConfig(const char* connectDir, const char* altvDir, const char* customCachePath) {
    string configPath = string(connectDir) + "\\.config";
    string altvConfigPath = string(altvDir) + "\\altv.toml";
    
    // Default config values mapping
    map<string, string> values;
    
    ifstream cfg(configPath);
    string currentSection = "";
    string line;
    
    if (cfg.is_open()) {
        while (getline(cfg, line)) {
            line = trim(line);
            if (line.empty() || line[0] == '#' || line[0] == ';') continue;
            
            if (line[0] == '[' && line.back() == ']') {
                currentSection = line.substr(1, line.length() - 2);
            } else {
                size_t eqPos = line.find('=');
                if (eqPos != string::npos) {
                    string key = trim(line.substr(0, eqPos));
                    string val = trim(line.substr(eqPos + 1));
                    string fullKey = currentSection.empty() ? key : currentSection + "." + key;
                    values[fullKey] = val;
                }
            }
        }
        cfg.close();
    }

    // cachePath logic
    string cachePath = (customCachePath && customCachePath[0] != '\0') ? string(customCachePath) : string(connectDir) + "\\cache";
    replaceAll(cachePath, "\\", "/"); // Replace backslashes with forward slashes for TOML

    string templateConfig = R"(audioFrameLimit = false
autoBackup = true
autoFindMic = false
branch = 'release'
cachePath = '{ cache_path }'
cefAlwaysFullCopy = false
cefUseHardwareAcceleration = true
consoleHeight = 0.40000000596046448
consoleWidth = 0.40000000596046448
crashOnFatalError = false
crashReporterEnabled = true
debug = { gtamp-hidden-options.debug }
disableForcedRawInput = false
disableRtl = false
discordRichPresence = false
displaySystemUpdateMessagesInLog = false
earlyAuthTestURL = ''
enableDiscordOverlay = false
enableGuildedOverlay = false
enableNvidiaShadowPlayOverlay = false
enableOverwolfOverlay = false
expandedConsole = false
externalConsoleX = 0
externalConsoleY = 0
gtaPlatform = 'steam'
gtapath = { gta_path }
heapSize = 1024
lang = 'en'
lastip = ''
launcherSkin = 'default'
launcherSkinsDisabled = []
linuxCompatibility = false
logTimeFormat = '%H:%M:%S'
maxDownloadSpeed = 0
name = '39a4cb14b4afd8c1eef1667c74e3b5936238c44f'
netgraph = false
permissionsSet = true
promotedOnTop = false
region = 'global'
streamerMode = false
textureBudgetPatch = true
uiVolume = 50
update = false
useExternalConsole = false
useSharedTextures = true

voiceActivationEnabled = { voice.enabled }
voiceActivationKey = { voice.input.key }
voiceAutoInputVolume = { voice.options.auto_input_volume }
voiceEnabled = { voice.enabled }
voiceInputDevice = { voice.input.device }
voiceInputNormalization = { voice.options.normalization }
voiceInputSensitivity = { voice.input.sensitivity }
voiceInputVolume = { voice.input.volume }
voiceNoiseSuppression = { voice.options.noise_suppresion }
voiceVolume = { voice.volume }
)";

    replaceAll(templateConfig, "{ cache_path }", cachePath);
    
    auto replaceVar = [&](const string& placeholder, const string& mapKey, const string& defVal) {
        string val = values.count(mapKey) ? values[mapKey] : defVal;
        replaceAll(templateConfig, placeholder, val);
    };

    replaceVar("{ gtamp-hidden-options.debug }", "gtamp-hidden-options.debug", "false");
    replaceVar("{ gta_path }", "gta_path", "''");
    replaceVar("{ voice.enabled }", "voice.enabled", "true");
    replaceVar("{ voice.input.key }", "voice.input.key", "78");
    replaceVar("{ voice.options.auto_input_volume }", "voice.options.auto_input_volume", "true");
    replaceVar("{ voice.input.device }", "voice.input.device", "'default'");
    replaceVar("{ voice.options.normalization }", "voice.options.normalization", "true");
    replaceVar("{ voice.input.sensitivity }", "voice.input.sensitivity", "20");
    replaceVar("{ voice.input.volume }", "voice.input.volume", "100");
    replaceVar("{ voice.options.noise_suppresion }", "voice.options.noise_suppresion", "true");
    replaceVar("{ voice.volume }", "voice.volume", "100");

    ofstream out(altvConfigPath);
    if (out.is_open()) {
        out << templateConfig;
        out.close();
    }

    // Check if GTA5.exe exists in gtaPath
    string gtaPathStr = values.count("gta_path") ? values["gta_path"] : "";
    if (gtaPathStr.size() >= 2 && gtaPathStr.front() == '\'' && gtaPathStr.back() == '\'') {
        gtaPathStr = gtaPathStr.substr(1, gtaPathStr.size() - 2);
    }
    
    if (!gtaPathStr.empty()) {
        string gtaExePath = gtaPathStr + "\\GTA5.exe";
        DWORD dwAttrib = GetFileAttributesA(gtaExePath.c_str());
        if (dwAttrib == INVALID_FILE_ATTRIBUTES || (dwAttrib & FILE_ATTRIBUTE_DIRECTORY)) {
            return false;
        }
    } else {
        return false;
    }
    return true;
}

