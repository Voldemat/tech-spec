import ast
from pathlib import Path
from typing import Any, Callable

import astor

from . import exceptions
from .dtos import SpecCodeDTO
from ..schema.dtos import (
    FIELD_DTO,
    FieldMetadataDTO,
    FieldSpecDTO,
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
        body: list[ast.AST] = [ast.Import(names=[ast.alias(name="re")])]
        for field in spec.fields:
            body.append(
                ast.Assign(
                    targets=[ast.Name(id=field.metadata.name)],
                    value=ast.Dict(
                        keys=[ast.Constant("type"), ast.Constant("regex")],
                        values=[
                            ast.Constant(field.spec.type),
                            ast.Call(
                                func=ast.Attribute(
                                    value=ast.Name(id="re"), attr="compile"
                                ),
                                args=[ast.Constant(field.spec.regex)],
                                keywords=[],
                            ),
                        ],
                    ),
                )
            )

        module = ast.Module(body=body)
        data = astor.to_source(module)
        return SpecCodeDTO(fields=data)

    def get_techspec(self, dir_path: Path) -> TechSpecDTO:
        fields_file = dir_path / "fields.py"
        fields: list[FIELD_DTO] = []
        if fields_file.exists():
            with open(fields_file, "r") as file:
                content = file.read()

            module = ast.parse(content)
            for variable in filter(
                lambda v: isinstance(v, ast.Assign), module.body
            ):
                value = from_dict(
                    variable.value,  # type: ignore
                    from_constant,
                    lambda v: v.args[0].value  # type: ignore
                    if isinstance(v, ast.Call)
                    else v.value,
                )
                fields.append(
                    SpecDTO(
                        type="field",
                        metadata=FieldMetadataDTO(
                            name=variable.targets[0].id  # type: ignore
                        ),
                        spec=FieldSpecDTO(
                            type=value["type"],
                            regex=value["regex"],
                        ),
                    )
                )
        return TechSpecDTO(fields=fields, forms=[], design_systems=[])

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
