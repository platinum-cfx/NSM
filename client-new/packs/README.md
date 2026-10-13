# Game packs (mp1..mp7.pack)

NSM.exe refuses to Connect unless `packs\mp1.pack` .. `packs\mp7.pack` exist
next to it, and the game runtime at `%LOCALAPPDATA%\<sha1("gtamp")>` is
deleted on every reboot - the packs re-install it on the next launch
(decrypt -> LoadLibrary -> RunExtractor, see `sources/cpp/connect.cpp`,
`EnsureGameFilesReady`).

## Format

Each `.pack` file is: 16-byte random IV + AES-256-CBC (PKCS#7) ciphertext of
an extractor DLL built from `sources/cpp/mpN_extractor.cpp`. The key is the
one hardcoded in `connect.cpp` `DecryptDataAES`. The DLL exports
`RunExtractor(destDir)` which creates the runtime folders and writes its
embedded RCDATA payloads.

## What ships here

- `mp1.pack` - STUB (no payload). The real one is 226.6 MB (carries
  `libs\libce2.dll`, SHA1 1affc48a243bc183076544bf46c94f4cae1becb9 - the
  file the alt:V client requires and verifies against its own update
  hashList). It exceeds GitHub's 100 MB git limit, so it lives in the
  `game-packs` release:
  https://github.com/platinum-cfx/NSM/releases/download/game-packs/mp1.pack
  The wrapper's pack-guard detects the stub at startup and downloads the
  full pack in the background, swapping it in ("pack: mp1.pack upgraded -
  press Connect again" in nsm-embed-debug.log). Without libce2.dll the
  client exits with code 0xC0000005 before starting GTA V.
- `mp2.pack` - full: carries `backup\GTA5.exe` recovered from the runtime
  upload.
- `mp3..mp7.pack` - full payloads recovered from the user's runtime upload,
  size+SHA1 verified against `sources/cpp/manifest.h` where listed. The one
  deliberate exclusion: `cache\skin.bin` (the runtime copy differs from the
  pristine manifest size because the launcher rewrites it at runtime; the
  manifest check skips skin.bin anyway, and the runtime keeps its copy).
  Extractors skip missing resources gracefully - same code path as the
  original build.

## Provenance / honesty

Rebuilt from this repo's own sources. Verified in Wine with the real
`connect.exe`: every pack decrypts byte-identically, loads, and extracts
payload files byte-exact; a full -connect run on an empty runtime reached
"Packs successfully extracted." and launched altv.exe. Nothing is faked.
