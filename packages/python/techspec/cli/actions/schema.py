import json
from pathlib import Path

from dependency_injector.wiring import Provide, inject

from rich.console import Console

import typer

from techspec.cli.container import CLIContainer
from techspec.schema import SchemaService, TechSpecDTO


@inject
def validate_action(
    spec_dir: Path,
    stderr: Console = Provide[CLIContainer.stderr],
    service: SchemaService = Provide[CLIContainer.schema],
) -> TechSpecDTO:
    try:
        return service.get_techspec(spec_dir)
    except SchemaService.exc.SpecDirDoesNotExists:
        stderr.print("Provided spec directory does not exists")
        raise typer.Exit(1)
    except SchemaService.exc.SpecFilesDoNotExist:
        stderr.print("There is not spec files in provided directory")
        raise typer.Exit(1)
    except (
        SchemaService.exc.YamlParsingException,
        SchemaService.exc.SchemaValidationException,
    ) as exc:
        stderr.print("\n".join(exc.errors))
        raise typer.Exit(1)


@inject
def get_spec_action(
    spec_dir: Path,
) -> None:
    spec = validate_action(spec_dir)
    print(json.dumps(spec, indent=4, default=lambda v: v.__dict__))
