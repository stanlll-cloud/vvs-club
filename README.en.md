# vvs-club

**Your collection, with a place for everything.**

vvs-club combines a personal media-library workflow with a macOS window for your online destinations. Browse local files, keep useful metadata, and open a chosen website from the sidebar without mixing it with your library.

## Start on macOS

With Apple Command Line Tools installed, run from the repository root:

```sh
python3 desktop/macos/build.py
```

Open `build/vvs-club-macos/vvs-club.app`. Online destinations work independently of the media backend. For local-library features, first configure and start the inherited backend following [Operations](docs/OPERATIONS.md). The desktop shell defaults to `http://127.0.0.1:8900`; its sidebar lets you change that address.

The shell uses top-level macOS WebKit views with back, forward, reload and external-browser controls. Website login, age checks, regional restrictions and playback compatibility remain controlled by each website. Automatic popups are disabled. No iframe restrictions or certificate checks are removed.

Destinations are listed in [sites.json](desktop/macos/sites.json): PigAV, JAVHDPorn, SpankBang and Pornhub's Chinese site. Pages are opened only when selected. Edit the list and rebuild to change the sidebar.

This is a locally built desktop shell, not a complete packaged backend. It does not bundle Python, FFmpeg or media files. Developer ID signing, notarization, independent installers and automatic updates are not provided. Upstream downloads are Peach releases, not vvs-club releases.

## Project boundaries

The underlying media service retains Peach's library, metadata, playback and configuration behavior. Technical package names, CLI commands, data directories and APIs remain compatible. The media service's optional diagnostics are documented in [Diagnostics](docs/DIAGNOSTICS.md); review their settings before use. The new Mac shell adds no telemetry endpoint.

[UPSTREAM.md](UPSTREAM.md) identifies the source revision and the fork's changes. Upstream changes are reviewed before integration so the fork's copy and desktop destinations are preserved. The associated update monitor reports changes; it does not silently merge or install them.

## Attribution and license

Derived from [Peach](https://github.com/peach-mitao/peach), Copyright (C) 2026 longmeidao. The vvs-club copy and macOS browser shell are modifications maintained in this fork. This is not an official Peach release and is not affiliated with the listed websites.

Distributed under [AGPL-3.0-or-later](LICENSE), with original copyright notices and third-party licenses retained. See [Reuse](docs/REUSE.md). Use only media you own or are authorized to access, and comply with applicable law and source-site terms. Adult destinations are for users of legal age where permitted. No media files or paid-content access rights are supplied.

[中文说明](README.md) · [Desktop instructions](desktop/macos/README.md) · [Issue tracker](https://github.com/stanlll-cloud/vvs-club/issues)
