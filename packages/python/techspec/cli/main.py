from typer import Typer

from .groups import schema_group

cli = Typer()

cli.add_typer(schema_group, name="schema")
