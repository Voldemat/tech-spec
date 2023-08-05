from pathlib import Path
from typing import Any

import jsonschema

import typer

import yaml

from techspec.schema.utils import find_files, validate_data

from .stderr import stderr

app = typer.Typer()


@app.command()
def validate(spec_dir: Path) -> None:
    if not spec_dir.is_dir():
        stderr.print("Provided spec directory does not exists")
        raise typer.Exit(1)

    files = list(find_files(spec_dir))
    if len(files) == 0:
        stderr.print("There is not spec files in provided directory")
        raise typer.Exit(1)

    parsed_data: dict[Path, dict[str, Any]] = {}
    errors: list[str] = []
    for filepath in files:
        with open(filepath, "r") as file:
            try:
                data = yaml.load(file, Loader=yaml.Loader)
                parsed_data[filepath] = data
            except yaml.YAMLError as exc:
                errors.append(str(exc))
    if len(errors) > 0:
        stderr.print("\n".join(errors))
        raise typer.Exit(1)

    for filepath, data in parsed_data.items():
        try:
            validate_data(data)
        except jsonschema.ValidationError as exc:
            errors.append(
                "SchemaValidationError\n"
                f"File: {filepath}\n"
                f"Path: {exc.json_path}\n"
                f"Message: {exc.message}\n"
            )
    if len(errors) > 0:
        stderr.print("\n".join(errors))
        raise typer.Exit(1)
