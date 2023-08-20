import json
from pathlib import Path

from ..conftest import run_cli


def test_get_spec(tmpdir: Path) -> None:
    codefile = tmpdir / "fields.py"
    codefile.write_text("login = {'type': 'string', 'regex': '$.{5,150}^'}\n")
    process = run_cli(["code", "get-spec", str(tmpdir)])
    assert process.returncode == 0, process.stderr
    assert (
        process.stdout
        == json.dumps(
            {
                "forms": [],
                "fields": [
                    {
                        "type": "field",
                        "metadata": {"name": "login"},
                        "spec": {"type": "string", "regex": "$.{5,150}^"},
                    }
                ],
                "design_systems": [],
            },
            indent=4,
        )
        + "\n"
    )
