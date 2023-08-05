from typer import Typer

from .container import CLIContainer
from .groups import schema_group


cli = Typer()

cli.add_typer(schema_group, name="schema")


def cli_main() -> None:
    CLIContainer()
    cli()
