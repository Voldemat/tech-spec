from pathlib import Path

from ..conftest import run_cli


def test_validate(tmpdir: Path, tmpdir2: Path) -> None:
    specfile = tmpdir / "some-form.tech-spec.yaml"
    specfile.write_text(
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
    fieldfile = tmpdir / "login.tech-spec.yaml"
    fieldfile.write_text(
        """
        type: field
        metadata:
            name: login
        spec:
            type: string
            regex: '$.{5,150}^'
        """
    )
    codefile = tmpdir2 / "fields.py"
    codefile.write_text(
        "import re\nlogin = {'type': 'string', "
        "'regex': re.compile('$.{5,150}^')}\n"
    )
    process = run_cli(["code", "validate", str(tmpdir), str(tmpdir2)])
    assert process.returncode == 0, process.stderr
    assert process.stdout == "Code is in sync with schema\n"
