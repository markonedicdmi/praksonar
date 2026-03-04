import os

dir_to_scan = r"c:\Users\nedicx\Desktop\praksonar\src"

# Add bg-input to all input/select elements that have border-border or similar form classes
replacements = {
    'className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors"': 'className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"',
    'className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-card"': 'className="block w-full rounded-lg border-border shadow-sm focus:border-sidebar focus:ring-sidebar py-2.5 px-3 border transition-colors bg-input"',
    
    # Homepage search bar?
    'bg-card border text-app-text border-border px-8 py-3.5 rounded-lg': 'bg-input border text-app-text border-border px-8 py-3.5 rounded-lg',
}

for root, dirs, files in os.walk(dir_to_scan):
    for f in files:
        if f.endswith(".tsx"):
            filepath = os.path.join(root, f)
            with open(filepath, "r", encoding="utf-8") as file:
                content = file.read()
            
            new_content = content
            for old, new in replacements.items():
                new_content = new_content.replace(old, new)
            
            # Catch raw <input or <select missing bg
            # This is risky, but let's look for common patterns
            
            if new_content != content:
                print(f"Updated {filepath}")
                with open(filepath, "w", encoding="utf-8") as file:
                    file.write(new_content)
