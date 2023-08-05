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
                regex: '$.{5,150}^'
                errorMessage: null
                helperMessage: null
        """
    )
    codefile = tmpdir2 / "forms.py"
    codefile.write_text(
        (
            "forms = {'some-form': {'login': {'required': True,"
            " 'regex': '$.{5,150}^',\n"
            "    'helperMessage': None, 'errorMessage': None}}}\n"
        )
    )
    process = run_cli(["code", "validate", str(tmpdir), str(tmpdir2)])
    print(process.stdout)
    assert process.returncode == 0, process.stderr
    assert process.stdout == "Code is in sync with schema\n"
