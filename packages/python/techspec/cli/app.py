from typer import Typer

from .groups import code_group, schema_group


app = Typer()

app.add_typer(code_group, name="code")
app.add_typer(schema_group, name="schema")
