from dependency_injector import containers, providers

from ..schema.service import SchemaService


class CLIContainer(containers.DeclarativeContainer):
    wiring_config = containers.WiringConfiguration(
        packages=[".groups"],
    )
    schema = providers.Singleton(SchemaService)
