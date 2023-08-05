from pathlib import Path
from typing import Any, Iterable

import jsonschema

import yaml

from . import exceptions
from .dtos import (
    FORM_DTO,
    FormFieldDTO,
    FormMetadataDTO,
    SpecDTO,
    THEME_DTO,
    TechSpecDTO,
    ThemeMetadataDTO,
    ThemeSpecDTO,
)
from .json_schema import json_schema


class SchemaService:
    exc = exceptions

    def validate_data(self, data: dict[str, Any]) -> FORM_DTO | THEME_DTO:
        jsonschema.validate(instance=data, schema=json_schema)
        match data["type"]:
            case "form":
                return SpecDTO(
                    type=data["type"],
                    metadata=FormMetadataDTO(name=data["metadata"]["name"]),
                    spec={
                        k: FormFieldDTO(
                            required=v["required"],
                            regex=v["regex"],
                            helper_message=v["helperMessage"],
                            error_message=v["errorMessage"],
                        )
                        for k, v in data["spec"].items()
                    },
                )
            case "theme":
                return SpecDTO(
                    type=data["type"],
                    metadata=ThemeMetadataDTO(
                        name=data["metadata"]["name"],
                    ),
                    spec=ThemeSpecDTO(
                        colors=data["spec"]["colors"],
                    ),
                )
            case _:
                raise ValueError(f'Unhandled type: {data["type"]}')

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

        spec = TechSpecDTO(forms=[], themes=[])
        for filepath, data in parsed_data.items():
            try:
                dto = self.validate_data(data)
                if dto.type == "form":
                    spec.forms.append(dto)
                elif dto.type == "theme":
                    spec.themes.append(dto)
            except jsonschema.ValidationError as exc:
                errors.append(
                    "SchemaValidationError\n"
                    f"File: {filepath}\n"
                    f"Path: {exc.json_path}\n"
                    f"Message: {exc.message}\n"
                )
        if len(errors) > 0:
            raise exceptions.SchemaValidationException(errors)
        return spec
