from pathlib import Path

from dependency_injector.wiring import Provide, inject

import typer

from techspec.cli.container import CLIContainer
from techspec.schema.service import SchemaService

from .stderr import stderr

app = typer.Typer()


@app.command()
def validate(spec_dir: Path) -> None:
    validate_action(spec_dir)


@inject
def validate_action(
    spec_dir: Path, service: SchemaService = Provide[CLIContainer.schema]
) -> None:
    try:
        service.get_techspec(spec_dir)
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
