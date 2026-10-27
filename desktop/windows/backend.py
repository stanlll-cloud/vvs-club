"""Windows 桌面包的私有后端入口；不启动原版托盘。"""
from __future__ import annotations

import multiprocessing
from pathlib import Path
import sys


def main():
    multiprocessing.freeze_support()
    root = Path(__file__).resolve().parents[2]
    for directory in (root / 'src', root / 'desktop/macos'):
        sys.path.insert(0, str(directory))
    if len(sys.argv) < 2:
        return 2
    mode = sys.argv.pop(1)
    if mode == '--vvs-cli':
        from peach.cli import main as run
        return run(sys.argv[1:])
    if mode == '--cloud':
        from cloud_service import main as run
        return run()
    if mode == '--media':
        from service import main as run
        return run()
    return 2


if __name__ == '__main__':
    raise SystemExit(main())
