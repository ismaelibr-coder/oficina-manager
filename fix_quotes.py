import os
import re

services_dir = r"c:\Users\ismaelr\Desktop\oficina\web\src\services"

services = [
    'appointments.ts', 'boxes.ts', 'checklist-templates.ts', 'checklists.ts',
    'customers.ts', 'financial.ts', 'maintenance-alerts.ts', 'products.ts',
    'service-orders.ts', 'services.ts', 'users.ts', 'vehicles.ts'
]

for service_file in services:
    filepath = os.path.join(services_dir, service_file)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Corrigir aspas simples não fechadas após config.apiUrl}
    # Padrão: config.apiUrl}/algo' -> config.apiUrl}/algo`
    content = re.sub(r"config\.apiUrl\}/([^'`\r\n]+)'", r'config.apiUrl}/\1`', content)
    
    # Padrão: config.apiUrl}' -> config.apiUrl}`
    content = re.sub(r"config\.apiUrl\}'", r'config.apiUrl}`', content)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Fixed: {service_file}")

print("\nDone!")
