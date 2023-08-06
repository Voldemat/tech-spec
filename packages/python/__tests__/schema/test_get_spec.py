from pathlib import Path

from ..conftest import run_cli


def test_get_spec(tmpdir: Path) -> None:
    filepath = tmpdir / "some-form.tech-spec.yaml"
    filepath.write_text(
        """
        type: form
        metadata:
            name: 'some-form'
        spec:
            login:
                required: true
                regex: '$.{5,150}^'
                errorMessage: null
                helperMessage: null
        """
    )
    process = run_cli(["schema", "get-spec", str(tmpdir)])
    assert process.returncode == 0, process.stderr
    assert process.stdout == (
        '{\n    "forms": [\n        {\n            '
        '"type": "form",\n            "metadata":'
        ' {\n                "name": "some-form"\n'
        '            },\n            "spec": '
        '{\n                "login": {\n                    '
        '"required": true,\n                    '
        '"regex": "$.{5,150}^",\n                    '
        '"error_message": null,\n                    '
        '"helper_message": null\n                }\n'
        "            }\n        }\n    ],\n    "
        '"themes": []\n}\n'
    )
