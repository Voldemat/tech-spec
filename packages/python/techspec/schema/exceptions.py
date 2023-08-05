class SpecDirDoesNotExists(BaseException):
    pass


class SpecFilesDoNotExist(BaseException):
    pass


class YamlParsingException(BaseException):
    errors: list[str]

    def __init__(self, errors: list[str]) -> None:
        super().__init__(errors)
        self.errors = errors


class SchemaValidationException(BaseException):
    errors: list[str]

    def __init__(self, errors: list[str]) -> None:
        super().__init__(errors)
        self.errors = errors
