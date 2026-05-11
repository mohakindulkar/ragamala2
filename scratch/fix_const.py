
import sys

path = 'src/lib/components/AncestryTree.svelte'
with open(path, 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
found_first = False
for line in lines:
    if '{@const offset = getTextOffset(node)}' in line:
        if not found_first:
            # Keep the first one (at the top of the loop)
            new_lines.append(line)
            found_first = True
        else:
            # Skip the second one (the one inside the <g> tag)
            continue
    else:
        new_lines.append(line)

with open(path, 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Fixed!")
