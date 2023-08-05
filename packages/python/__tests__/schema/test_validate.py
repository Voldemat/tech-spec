from pathlib import Path

from ..conftest import run_cli


def test_validate_valid_spec(tmpdir: Path) -> None:
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
    process = run_cli(["schema", "validate", str(tmpdir)])
    assert process.returncode == 0, process.stderr


def test_validate_unexisting_dir(tmpdir: Path) -> None:
    process = run_cli(["schema", "validate", str(tmpdir / "some-folder")])
    assert process.returncode == 1, process.stdout
    assert (
        process.stderr == "Provided spec directory does not exists\n"
    ), process.stderr


def test_validate_empty_dir(tmpdir: Path) -> None:
    process = run_cli(["schema", "validate", str(tmpdir)])
    assert process.returncode == 1, process.stdout
    assert (
        process.stderr == "There is not spec files in provided directory\n"
    ), process.stderr


def test_validate_dir_with_files_with_wrong_names(
    tmpdir: Path,
) -> None:
    filepath = tmpdir / "some-form.tech-spe.yaml"
    filepath.write_text("some-content")
    process = run_cli(["schema", "validate", str(tmpdir)])
    assert process.returncode == 1, process.stdout
    assert (
        process.stderr == "There is not spec files in provided directory\n"
    ), process.stderr


def test_validate_invalid_yaml_file(tmpdir: Path) -> None:
    filepath = tmpdir / "some-form.tech-spec.yaml"
    filepath.write_text(
        """
        type: form
        asd
        """
    )
    process = run_cli(["schema", "validate", str(tmpdir)])
    assert process.returncode == 1, process.stdout
    expected_error = (
        f"while scanning a simple key\n"
        f'  in "{filepath}", line 3, column 9\n'
        "could not find expected ':'\n"
        f'  in "{filepath}", line 4, column 9\n'
    )
    assert process.stderr == expected_error


def test_validate_invalid_schema_file(tmpdir: Path) -> None:
    filepath = tmpdir / "some-form.tech-spec.yaml"
    filepath.write_text(
        """
        type: form
        metadata:
            name: 'some-form'
        spec:
            login:
                required: true
                helperMessage: 1
                errorMessage: null
                regex: '$.{5,10}^'
        """
    )
    process = run_cli(["schema", "validate", str(tmpdir)])
    assert process.returncode == 1, process.stdout
    assert process.stderr == (
        "SchemaValidationError\n"
        f"File: {filepath}\n"
        f"Path: $.spec.login.helperMessage\n"
        f"Message: 1 is not of type 'string', 'null'\n\n"
    )
