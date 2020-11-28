# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""compare.py: Saves keys in en.json that are missing in de.json to diff.txt."""

import json

path = "de-DE/"

def main():
    count = 0
    with open(path + "en.json", "r", encoding="utf-8") as diff1:
        with open(path + "de.json", "r", encoding="utf-8") as diff2:
            with open(path + "diff.txt", "w", encoding="utf-8") as out:
                a = json.load(diff1)
                b = json.load(diff2)
                
                for key in a.keys():
                    if key not in b:
                        val = a[key]
                        out.write("\"{0}\": \"{1}\",\n".format(key, val))
                        count += 1

print("Found " + str(count) + " missing keys")

if __name__ == "__main__":
    main()
