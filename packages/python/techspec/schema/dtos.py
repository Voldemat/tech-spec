import re
from dataclasses import dataclass
from typing import Generic, Literal, TypeVar

T = TypeVar("T")
M = TypeVar("M")
S = TypeVar("S")


@dataclass
class SpecDTO(Generic[T, M, S]):
    type: T
    metadata: M
    spec: S


@dataclass
class FieldMetadataDTO:
    name: str


@dataclass
class FieldSpecDTO:
    type: Literal["string"]
    regex: re.Pattern[str]


FIELD_DTO = SpecDTO[Literal["field"], FieldMetadataDTO, FieldSpecDTO]


@dataclass
class FormMetadataDTO:
    name: str


@dataclass
class FormFieldDTO:
    required: bool
    fieldRef: str
    field: FIELD_DTO
    error_message: str | None
    helper_message: str | None
    placeholder: str | None


FORM_DTO = SpecDTO[Literal["form"], FormMetadataDTO, dict[str, FormFieldDTO]]


@dataclass
class DesignSystemMetadataDTO:
    name: str


@dataclass
class DesignSystemSpecDTO:
    colors: dict[str, str]


DESIGN_SYSTEM_DTO = SpecDTO[
    Literal["DesignSystem"], DesignSystemMetadataDTO, DesignSystemSpecDTO
]


@dataclass
class TechSpecDTO:
    forms: list[FORM_DTO]
    fields: list[FIELD_DTO]
    design_systems: list[DESIGN_SYSTEM_DTO]
