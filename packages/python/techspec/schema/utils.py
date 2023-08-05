from pathlib import Path
from typing import Any, Generator

from jsonschema import validate

from .json_schema import json_schema


def find_files(dir_path: Path) -> Generator[Path, None, None]:
    return dir_path.glob("**/*.tech-spec.yaml")


def validate_data(data: dict[str, Any]) -> dict[str, Any]:
    validate(instance=data, schema=json_schema)
    return data
