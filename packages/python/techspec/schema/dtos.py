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
class FormMetadataDTO:
    name: str


@dataclass
class FormFieldDTO:
    required: bool
    regex: re.Pattern[str]
    error_message: str | None
    helper_message: str | None


@dataclass
class ThemeMetadataDTO:
    name: str


@dataclass
class ThemeSpecDTO:
    colors: dict[str, str]


FORM_DTO = SpecDTO[Literal["form"], FormMetadataDTO, dict[str, FormFieldDTO]]
THEME_DTO = SpecDTO[Literal["theme"], ThemeMetadataDTO, ThemeSpecDTO]


@dataclass
class TechSpecDTO:
    forms: list[FORM_DTO]
    themes: list[THEME_DTO]
