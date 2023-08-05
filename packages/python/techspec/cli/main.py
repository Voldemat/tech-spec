from .app import app
from .container import CLIContainer


def cli_main() -> None:
    CLIContainer()
    app()
