# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""merge.py: Merges new keys in diff.txt into de.json."""

import json

sort_only = False
overwrite = False

path = "languages/"

def main():
    j = None
    line = ""
    linenum = 0
    
    try:
        with open(path + "diff.txt", "r", encoding="utf-8") as diff:
            with open(path + "de.json", "r", encoding="utf-8") as file:
                j = json.load(file)

                for line in diff:
                    linenum += 1
                    line = line.strip()
                    if line.endswith(","):
                      line = line[:-1]
                    line = "{" + line + "}"

                    n = json.loads(line)
                    for k in n.keys():
                        if k in j and not overwrite:
                            print("Conflict: key " + str(k) + " exists, ignoring")
                            continue

                        if not sort_only:
                            j[k] = n[k]
    except Exception as e:
        print("Error after parsing line " + str(linenum) + ":")
        print(line)
        raise e from None

    with open(path + "de.json", "w", encoding="utf-8") as out:
        json.dump(j, out, sort_keys=True, indent=0, ensure_ascii=False)

if __name__ == "__main__":
    main()
