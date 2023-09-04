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
                fieldRef: login
                placeholder: null
                errorMessage: null
                helperMessage: null
        """
    )
    loginfile = tmpdir / "login.tech-spec.yaml"
    loginfile.write_text(
        """
        type: field
        metadata:
            name: 'login'
        spec:
            type: 'string'
            regex: '$.{5,150}^'

        """
    )
    process = run_cli(["schema", "get-spec", str(tmpdir)])
    assert process.returncode == 0, process.stderr
    print(process.stdout)
    assert process.stdout == (
        """{
    "forms": [
        {
            "type": "form",
            "metadata": {
                "name": "some-form"
            },
            "spec": {
                "login": {
                    "required": true,
                    "fieldRef": "login",
                    "field": {
                        "type": "field",
                        "metadata": {
                            "name": "login"
                        },
                        "spec": {
                            "type": "string",
                            "regex": "$.{5,150}^"
                        }
                    },
                    "error_message": null,
                    "helper_message": null,
                    "placeholder": null
                }
            }
        }
    ],
    "fields": [
        {
            "type": "field",
            "metadata": {
                "name": "login"
            },
            "spec": {
                "type": "string",
                "regex": "$.{5,150}^"
            }
        }
    ],
    "design_systems": []
}
"""
    )
