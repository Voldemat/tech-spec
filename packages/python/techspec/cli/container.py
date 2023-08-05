import shutil

from dependency_injector import containers, providers

from rich.console import Console

from ..generator import GeneratorService
from ..schema import SchemaService


def console_width() -> int:
    return shutil.get_terminal_size((120, 20)).columns


class CLIContainer(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=[".actions"],
    )
    schema = providers.Singleton(SchemaService)
    generator = providers.Singleton(GeneratorService)
    console_width = providers.Singleton(console_width)
    stderr = providers.Singleton(Console, stderr=True, width=console_width)
