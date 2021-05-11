# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""compile_csv.py: Saves D&D csv export data to JSON."""

import csv
import json


def main():
    version = 1
    infile = "data.csv"
    outfile = "data.json"
    newline = "\r\n"
    quote = "\""
    encoding = "utf-8"
    delimiter = ","

    data = {}
    with open(infile, newline=newline, encoding=encoding) as csvfile:
        r = csv.reader(csvfile, delimiter=delimiter, quotechar=quote)
        for row in r:
            d = {}
            name_en = row[1]
            d["name"] = row[0]
            d["env"] = row[6]
            d["src"] = row[9]
            d["src_pg"] = row[10]

            if name_en in data:
                print("COLLISION: " + name_en)
            data[name_en] = d

    with open(outfile, "w", encoding=encoding) as out:
        wrapper = {}
        wrapper["version"] = version
        wrapper["data"] = data
        json.dump(wrapper, out, sort_keys=True, indent=4, ensure_ascii=False)


if __name__ == "__main__":
    main()
