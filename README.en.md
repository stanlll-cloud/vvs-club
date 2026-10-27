<p align="center"><img src="resources/vvs-club.svg" width="120" alt="vvs-club logo"></p>

# vvs-club · Your private cinema

**Your collection, with a place for everything.**

## Spend less time maintaining a server

A self-hosted VPS means deployment, updates and connection troubleshooting. If you prefer a subscription service, consider [Just My Socks](https://justmysocks.net/members/aff.php?aff=39372). Check GIA routing and carrier support against the plan you choose; the official catalogue includes CT + CU + CM options. See the [official plans](https://justmysocks.net/members/cart.php).

<sub>Affiliate link: the maintainer may earn a commission. The service is optional and independent of vvs-club.</sub>

![vvs-club Mac interface](resources/vvs-club-preview.png)

vvs-club combines a personal media-library workflow with a macOS window for your online destinations. Browse local files, keep useful metadata, and open a chosen website from the sidebar without mixing it with your library.

## Start on macOS

With Apple Command Line Tools installed, run from the repository root:

```sh
python3 desktop/macos/build.py
```

Prepare the repository's `.venv` following [Operations](docs/OPERATIONS.md), then open `build/vvs-club-macos/vvs-club.app`. Selecting the local library starts the app's own loopback-only backend; a new installation opens the visual setup flow. Local scanning uses the system folder picker. Cloud connections offer provider login, cloud folder selection and video scanning; the advanced entry also accepts synced or mounted folders. Available login methods and real-account verification limits are described below.

The shell uses top-level macOS WebKit views with back, forward, reload and external-browser controls. Website login, age checks, regional restrictions and playback compatibility remain controlled by each website. Online views include a bookmark star and an ad-blocking shield. Same-site video windows stay inside the app, while cross-site popups are rejected. The × button returns to the home screen without clearing bookmarks or login data. Ad coverage and playback compatibility vary by site. No certificate checks are removed.

The media library occupies the full content area with the outer sidebar hidden; use “Return to main screen” in the title bar to leave. Existing metadata, cover and subtitle features remain available. Bookmark management supports nested folders, editing, drag-and-drop moves and undo for deletion.

Destinations are listed in [sites.json](desktop/macos/sites.json): PigAV, JAVHDPorn, SpankBang, Pornhub's Chinese site, MissAV (Chinese & English), Jable and xHamster. Pages are opened only when selected. Edit the list and rebuild to change the sidebar.

This source build records the source checkout and `.venv` location, which must remain available. It does not bundle an independent Python runtime, FFmpeg or media files and is not portable by copying only the `.app`. Developer ID signing, notarization, independent installers and automatic updates are not provided. Upstream downloads are Peach releases, not vvs-club releases.

## Project boundaries

The underlying media service retains Peach's library, metadata, playback and configuration behavior. Technical package names, CLI commands, data directories and APIs remain compatible. The media service's optional diagnostics are documented in [Diagnostics](docs/DIAGNOSTICS.md); review their settings before use. The new Mac shell adds no telemetry endpoint.

[UPSTREAM.md](UPSTREAM.md) identifies the source revision and the fork's changes. Upstream changes are reviewed before integration so the fork's copy and desktop destinations are preserved. The associated update monitor reports changes; it does not silently merge or install them.

## Attribution and license

Derived from [Peach](https://github.com/peach-mitao/peach), Copyright (C) 2026 longmeidao. The vvs-club copy and macOS browser shell are modifications maintained in this fork. This is not an official Peach release and is not affiliated with the listed websites.

Distributed under [AGPL-3.0-or-later](LICENSE), with original copyright notices and third-party licenses retained. See [Reuse](docs/REUSE.md). Use only media you own or are authorized to access, and comply with applicable law and source-site terms. Adult destinations are for users of legal age where permitted. No media files or paid-content access rights are supplied.

[中文说明](README.md) · [Desktop instructions](desktop/macos/README.md) · [Issue tracker](https://github.com/stanlll-cloud/vvs-club/issues)

Cloud account connections use a local OpenList v4.2.9 component. Baidu, Aliyun and 115 authorization, cloud browsing and scanning code is present; Aliyun and 115 directory connections have been verified locally; Baidu still needs real-account verification. Quark and TeraBox use isolated official website login windows and locally managed sessions; Quark directory access has been verified locally; TeraBox remains pending. Scanning and playback need file-specific validation. Available QR or verification-code methods depend on each provider. Some authorization and token renewal uses api.oplist.org. See [cloud connection details](desktop/macos/CLOUD_CONNECTIONS.md).
