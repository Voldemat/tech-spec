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
                regex: '$.{5,150}^'
                errorMessage: null
                helperMessage: null
        """
    )
    process = run_cli(["code", "generate", str(tmpdir), str(tmpdir2)])
    assert process.returncode == 0, process.stderr
    assert process.stdout == "Code generated successfully\n"
    generated_filepath = tmpdir2 / "forms.py"
    assert generated_filepath.exists()
    with open(generated_filepath, "r") as file:
        content = file.read()

    assert content == (
        "forms = {'some-form': {'login': {'required': True,"
        " 'regex': '$.{5,150}^',\n"
        "    'helperMessage': None, 'errorMessage': None}}}\n"
    )
