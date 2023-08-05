import json
from pathlib import Path


with open(Path(__file__).parent / ".." / "schema.json", "r") as file:
    json_schema = json.load(file)
