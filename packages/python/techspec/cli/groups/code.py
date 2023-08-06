from pathlib import Path

from typer import Typer

from ..actions.code import generate_action, get_spec_action, validate_action


app = Typer()


@app.command()
def generate(spec_dir: Path, output_dir: Path) -> None:
    generate_action(spec_dir, output_dir)


@app.command()
def validate(spec_dir: Path, code_dir: Path) -> None:
    validate_action(spec_dir, code_dir)


@app.command()
def get_spec(code_dir: Path) -> None:
    get_spec_action(code_dir)
