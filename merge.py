# -*- coding: utf-8 -*-
#!/usr/bin/env python

"""merge.py: Merges new keys in diff.txt into de.json."""

import json

sort_only = False
overwrite = False

path = "de-DE/"

def main():
    j = None
    with open(path + "diff.txt", "r", encoding="utf-8") as diff:
        with open(path + "de.json", "r", encoding="utf-8") as file:
            j = json.load(file)
            
            for line in diff:
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
    
    with open(path + "de.json", "w", encoding="utf-8") as out:
        json.dump(j, out, sort_keys=True, indent=0, ensure_ascii=False)

if __name__ == "__main__":
    main()
