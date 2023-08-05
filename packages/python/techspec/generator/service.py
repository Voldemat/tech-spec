import ast
from pathlib import Path
from typing import Any, Callable

import astor

from . import exceptions
from .dtos import SpecCodeDTO
from ..schema.dtos import (
    FORM_DTO,
    FormFieldDTO,
    FormMetadataDTO,
    SpecDTO,
    TechSpecDTO,
)


def to_constant(v: Any) -> ast.Constant:
    return ast.Constant(v)


def from_constant(const: ast.Constant) -> Any:
    return const.value


def from_dict(
    d: ast.Dict,
    keys_map: Callable[[Any], Any] = lambda v: v,
    values_map: Callable[[Any], Any] = lambda v: v,
) -> dict[Any, Any]:
    return dict(
        zip(
            map(keys_map, d.keys),
            map(values_map, d.values),
        )
    )


class GeneratorService:
    exc = exceptions

    def generate(self, spec: TechSpecDTO) -> SpecCodeDTO:
        value = ast.Dict(keys=[], values=[])
        for form in spec.forms:
            value.keys.append(ast.Constant(value=form.metadata.name))
            value.values.append(
                ast.Dict(
                    keys=list(map(to_constant, form.spec.keys())),
                    values=list(
                        map(
                            lambda v: ast.Dict(
                                keys=[
                                    to_constant("required"),
                                    to_constant("regex"),
                                    to_constant("helperMessage"),
                                    to_constant("errorMessage"),
                                ],
                                values=[
                                    to_constant(v.required),
                                    to_constant(v.regex),
                                    to_constant(v.helper_message),
                                    to_constant(v.error_message),
                                ],
                            ),
                            form.spec.values(),
                        )
                    ),
                )
            )

        module = ast.Module(
            body=[
                ast.Assign(
                    targets=[ast.Name(id="forms")],
                    value=value,
                )
            ]
        )
        data = astor.to_source(module)
        return SpecCodeDTO(forms=data)

    def get_techspec(self, dir_path: Path) -> TechSpecDTO:
        forms_file = dir_path / "forms.py"
        forms: list[FORM_DTO] = []
        if forms_file.exists():
            with open(forms_file, "r") as file:
                content = file.read()

            module = ast.parse(content)
            forms_dict = self.get_forms_dict(module)
            if forms_dict is not None:
                for form_name, form_fields in forms_dict.items():
                    spec = {}
                    fields = from_dict(form_fields, from_constant)
                    for field, field_spec in fields.items():
                        properties_dict = from_dict(
                            field_spec, from_constant, from_constant
                        )
                        spec[field] = FormFieldDTO(
                            required=properties_dict["required"],
                            regex=properties_dict["regex"],
                            helper_message=properties_dict["helperMessage"],
                            error_message=properties_dict["errorMessage"],
                        )
                    forms.append(
                        SpecDTO(
                            type="form",
                            metadata=FormMetadataDTO(name=form_name),
                            spec=spec,
                        )
                    )
        return TechSpecDTO(forms=forms, themes=[])

    def get_forms_dict(self, module: ast.Module) -> dict[str, Any] | None:
        forms_var: ast.Dict | None = next(
            map(
                lambda v: v.value,  # type: ignore
                filter(
                    lambda v: (  # type: ignore
                        isinstance(v, ast.Assign)
                        and v.targets[0].id == "forms"  # type: ignore
                    ),
                    module.body,
                ),
            ),
            None,
        )
        if forms_var is None:
            return None
        return from_dict(forms_var, from_constant)
