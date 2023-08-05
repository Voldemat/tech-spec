import subprocess
import tempfile
from pathlib import Path
from typing import Generator

import pytest


def run_cli(args: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        ["python3", "-m", "techspec", *args],
        capture_output=True,
        text=True,
    )


@pytest.fixture
def tmpdir() -> Generator[Path, None, None]:
    with tempfile.TemporaryDirectory() as path:
        yield Path(path)
