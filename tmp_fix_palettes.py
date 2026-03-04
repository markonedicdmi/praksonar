import os

filepath = r"c:\Users\nedicx\Desktop\praksonar\src\lib\palettes.ts"
with open(filepath, "r", encoding="utf-8") as f:
    lines = f.readlines()

new_lines = []
in_palette = False
current_palette = ""

for line in lines:
    if "'Teal Gold': {" in line: current_palette = "Teal Gold"
    elif "'Burgundy Study': {" in line: current_palette = "Burgundy Study"
    elif "'Forest Ink': {" in line: current_palette = "Forest Ink"
    elif "'Slate Dust': {" in line: current_palette = "Slate Dust"
    elif "'Ochre Archive': {" in line: current_palette = "Ochre Archive"
    elif "'Smoked Plum': {" in line: current_palette = "Smoked Plum"
    
    if "sidebarMuted:" in line and "input:" not in line:
        new_lines.append(line)
        spacing = line[:line.find("sidebarMuted:")]
        if current_palette == "Smoked Plum":
            new_lines.append(f"{spacing}input: '#3d2e52'\n")
        else:
            new_lines.append(f"{spacing}input: '#ffffff'\n")
    else:
        new_lines.append(line)

with open(filepath, "w", encoding="utf-8") as f:
    f.writelines(new_lines)

print("Fixed palettes.ts")
