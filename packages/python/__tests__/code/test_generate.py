from pathlib import Path

from ..conftest import run_cli


def test_generate(tmpdir: Path, tmpdir2: Path) -> None:
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
                errorMessage: null
                helperMessage: null
        """
    )
    loginfile = tmpdir / "login.tech-spec.yaml"
    loginfile.write_text(
        """
        type: field
        metadata:
            name: login
        spec:
            type: string
            regex: '$.{5,150}^'
        """
    )
    process = run_cli(["code", "generate", str(tmpdir), str(tmpdir2)])
    assert process.returncode == 0, process.stderr
    assert process.stdout == "Code generated successfully\n"
    assert (tmpdir2 / "__init__.py").exists()
    generated_filepath = tmpdir2 / "fields.py"
    assert generated_filepath.exists()
    with open(generated_filepath, "r") as file:
        content = file.read()

    print(content)
    assert content == (
        "import re\nlogin = {'type': 'string', "
        "'regex': re.compile('$.{5,150}^')}\n"
    )
