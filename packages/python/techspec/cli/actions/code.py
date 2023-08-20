import json
from pathlib import Path

from dependency_injector.wiring import Provide, inject

from rich.console import Console

import typer

from techspec.cli.container import CLIContainer
from techspec.generator import GeneratorService

from .schema import validate_action as schema_validation_action


@inject
def generate_action(
    spec_dir: Path,
    output_dir: Path,
    generator: GeneratorService = Provide[CLIContainer.generator],
) -> None:
    spec = schema_validation_action(spec_dir)
    code = generator.generate(spec)
    if not output_dir.exists():
        output_dir.mkdir(parents=True)
    with open(output_dir / "fields.py", "w+") as file:
        file.write(code.fields)
    with open(output_dir / "__init__.py", "w+") as file:
        pass
    print("Code generated successfully")


@inject
def validate_action(
    spec_dir: Path,
    code_dir: Path,
    stderr: Console = Provide[CLIContainer.stderr],
    generator: GeneratorService = Provide[CLIContainer.generator],
) -> None:
    spec = schema_validation_action(spec_dir)
    try:
        code_spec = generator.get_techspec(code_dir)
    except GeneratorService.exc.OutputDirectoryDoesNotExists:
        stderr.print("Provided code directory does not exists")
        raise typer.Exit(1)
    spec.design_systems = []
    spec.forms = []
    if spec != code_spec:
        stderr.print("Code is not sync with schema")
        raise typer.Exit(1)

    print("Code is in sync with schema")


@inject
def get_spec_action(
    code_dir: Path,
    stderr: Console = Provide[CLIContainer.stderr],
    generator: GeneratorService = Provide[CLIContainer.generator],
) -> None:
    try:
        code_spec = generator.get_techspec(code_dir)
        print(json.dumps(code_spec, indent=4, default=lambda v: v.__dict__))
    except GeneratorService.exc.OutputDirectoryDoesNotExists:
        stderr.print("Provided code directory does not exists")
        raise typer.Exit(1)
