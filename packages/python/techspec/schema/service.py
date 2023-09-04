from pathlib import Path
from typing import Any, Iterable

import jsonschema

import yaml

from . import exceptions
from .dtos import (
    FIELD_DTO,
    FORM_DTO,
    FieldMetadataDTO,
    FieldSpecDTO,
    FormFieldDTO,
    FormMetadataDTO,
    SpecDTO,
    TechSpecDTO,
)
from .json_schema import json_schema


class SchemaService:
    exc = exceptions

    def _validate_data(self, data: dict[str, Any]) -> None:
        jsonschema.validate(instance=data, schema=json_schema)

    def validate(self, data: dict[Path, dict[str, Any]]) -> TechSpecDTO:
        fields = self.validate_fields(data)
        forms: list[FORM_DTO] = []
        errors: list[str] = []
        for filepath, spec in filter(
            lambda d: d[1]["type"] != "field", data.items()
        ):
            try:
                self._validate_data(spec)
            except jsonschema.ValidationError as exc:
                errors.append(self.generate_schema_error(str(filepath), exc))
                continue
            match spec["type"]:
                case "form":
                    forms.append(
                        SpecDTO(
                            type=spec["type"],
                            metadata=FormMetadataDTO(
                                name=spec["metadata"]["name"]
                            ),
                            spec={
                                k: FormFieldDTO(
                                    required=v["required"],
                                    fieldRef=v["fieldRef"],
                                    field=fields[v["fieldRef"]],
                                    helper_message=v["helperMessage"],
                                    placeholder=v["placeholder"],
                                    error_message=v["errorMessage"],
                                )
                                for k, v in spec["spec"].items()
                            },
                        )
                    )
                case _:
                    raise ValueError(f'Unhandled type: {spec["type"]}')
        if len(errors) > 0:
            raise exceptions.SchemaValidationException(errors)
        return TechSpecDTO(
            forms=forms, fields=list(fields.values()), design_systems=[]
        )

    def validate_fields(
        self, data: dict[Path, dict[str, Any]]
    ) -> dict[str, FIELD_DTO]:
        errors: list[str] = []
        fields: dict[str, FIELD_DTO] = {}
        for filepath, field in filter(
            lambda d: d[1]["type"] == "field", data.items()
        ):
            try:
                self._validate_data(field)
            except jsonschema.ValidationError as exc:
                errors.append(self.generate_schema_error(str(filepath), exc))
                continue

            fields[field["metadata"]["name"]] = SpecDTO(
                type="field",
                metadata=FieldMetadataDTO(name=field["metadata"]["name"]),
                spec=FieldSpecDTO(
                    type=field["spec"]["type"],
                    regex=field["spec"]["regex"],
                ),
            )
        if len(errors) > 0:
            raise exceptions.SchemaValidationException(errors)
        return fields

    def find_files(self, dir_path: Path) -> Iterable[Path]:
        return dir_path.glob("**/*.tech-spec.yaml")

    def get_techspec(self, spec_dir: Path) -> TechSpecDTO:
        if not spec_dir.is_dir():
            raise exceptions.SpecDirDoesNotExists()

        files = list(self.find_files(spec_dir))
        if len(files) == 0:
            raise exceptions.SpecFilesDoNotExist()

        parsed_data: dict[Path, dict[str, Any]] = {}
        errors: list[str] = []
        for filepath in files:
            with open(filepath, "r") as file:
                try:
                    data = yaml.load(file, Loader=yaml.Loader)
                    parsed_data[filepath] = data
                except yaml.YAMLError as exc:
                    errors.append(str(exc))
        if len(errors) > 0:
            raise exceptions.YamlParsingException(errors)

        return self.validate(parsed_data)

    def generate_schema_error(
        self, filepath: str, exc: jsonschema.ValidationError
    ) -> str:
        return (
            "SchemaValidationError\n"
            f"File: {filepath}\n"
            f"Path: {exc.json_path}\n"
            f"Message: {exc.message}\n"
        )
