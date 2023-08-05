from pathlib import Path

from typer import Typer

from ..actions.schema import validate_action


app = Typer()


@app.command()
def validate(spec_dir: Path) -> None:
    validate_action(spec_dir)
