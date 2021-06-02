# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""packs_to_babele.py: Converts pack .db files in compendium/ to Babele JSON."""

import os
import json

target_dir = "compendium"
target_prefix = "dnd5e."
target_suffix = ".json"
source_suffix = ".db"
encoding = "utf-8"

def main():
    for filename in os.listdir(target_dir):
        if filename.lower().endswith(target_suffix):
            source_file = get_source_name(filename)

            convert(os.path.join(target_dir, source_file),
                    os.path.join(target_dir, filename))

def convert(source, target):
    print(source + " -> " + target)

    json_data = None
    names = {}

    with open(target, "r", encoding=encoding) as js:
        json_data = json.load(js)

    if not "entries" in json_data:
        print("Target data has no entries field")
        return

    with open(source, "r", encoding=encoding) as src:
        for line in src:
            if len(line) < 1:
                continue
            data = json.loads(line)
            if not "name" in data:
                print("Invalid data, missing name")
                continue
            else:
                if data["name"] in json_data["entries"]:
                    # Data already exists
                    continue
                else:
                    # TODO: Check spelling
                    entry = {}
                    entry["name"] = ""
                    json_data["entries"][data["name"]] = entry
                    print("New: " + data["name"])

    with open(target, "w", encoding=encoding) as out:
        json.dump(json_data, out, sort_keys=True, indent=4, ensure_ascii=False)
        out.write(os.linesep)

def get_source_name(source_file):
    if source_file.lower().startswith(target_prefix):
        source_file = source_file[len(target_prefix):]
    if source_file.lower().endswith(target_suffix):
        source_file = source_file[:-len(target_suffix)]
    source_file += source_suffix
    return source_file

if __name__ == "__main__":
    main()
