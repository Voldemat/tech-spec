from pathlib import Path

from ..conftest import run_cli


def test_get_spec(tmpdir: Path) -> None:
    codefile = tmpdir / "forms.py"
    codefile.write_text(
        (
            "forms = {'some-form': {'login': {'required': True,"
            " 'regex': '$.{5,150}^',\n"
            "    'helperMessage': None, 'errorMessage': None}}}\n"
        )
    )
    process = run_cli(["code", "get-spec", str(tmpdir)])
    assert process.returncode == 0, process.stderr
    assert process.stdout == (
        '{\n    "forms": [\n        {\n            '
        '"type": "form",\n            '
        '"metadata": {\n                '
        '"name": "some-form"\n            '
        '},\n            "spec": {\n'
        '                "login": {\n                    '
        '"required": true,\n                    '
        '"regex": "$.{5,150}^",\n                    '
        '"error_message": null,\n                    '
        '"helper_message": null\n                '
        "}\n            }\n        }\n    ],\n    "
        '"themes": []\n}\n'
    )
