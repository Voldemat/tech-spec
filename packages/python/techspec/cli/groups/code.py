from pathlib import Path

from typer import Typer

from ..actions.code import generate_action, validate_action


app = Typer()


@app.command()
def generate(spec_dir: Path, output_dir: Path) -> None:
    generate_action(spec_dir, output_dir)


@app.command()
def validate(spec_dir: Path, output_dir: Path) -> None:
    validate_action(spec_dir, output_dir)
