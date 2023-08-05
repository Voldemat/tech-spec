import shutil

from rich.console import Console

CONSOLE_WIDTH = shutil.get_terminal_size((120, 20)).columns
stderr = Console(
    stderr=True,
    width=CONSOLE_WIDTH,
)
