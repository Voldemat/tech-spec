from pathlib import Path

from typer import Typer

from ..actions.schema import get_spec_action, validate_action


app = Typer()


@app.command()
def validate(spec_dir: Path) -> None:
    validate_action(spec_dir)


@app.command()
def get_spec(spec_dir: Path) -> None:
    get_spec_action(spec_dir)
