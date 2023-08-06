import os
from pathlib import Path

from setuptools import find_packages, setup  # type: ignore [import]


setup(
    name="tech-spec",
    version=os.environ["GITHUB_REF_NAME"],
    description="Tech spec for code generation",
    author="Vladimir Vojtenko",
    author_email="vladimirdev635@gmail.com",
    license="MIT",
    install_requires=[
        "typer[all]",
        "astor",
        "pyyaml",
        "jsonschema",
        "dependency-injector",
    ],
    packages=find_packages(exclude=["__tests__*"]),
    include_package_data=True,
    long_description=(Path(__file__).parent / "README.md").read_text(),
    long_description_content_type="text/markdown",
    entry_points={"console_scripts": ["techspecpy=techspec.cli:cli_main"]},
)
