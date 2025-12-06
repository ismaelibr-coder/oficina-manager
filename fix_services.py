import os
import re

services_dir = r"c:\Users\ismaelr\Desktop\oficina\web\src\services"

# Lista de arquivos para atualizar
services = [
    'appointments.ts', 'boxes.ts', 'checklist-templates.ts', 'checklists.ts',
    'customers.ts', 'financial.ts', 'maintenance-alerts.ts', 'products.ts',
    'service-orders.ts', 'services.ts', 'users.ts', 'vehicles.ts'
]

for service_file in services:
    filepath = os.path.join(services_dir, service_file)
    
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Substituir URLs
    content = content.replace("'http://localhost:3001/api", "`${config.apiUrl}")
    content = content.replace('"http://localhost:3001/api', '`${config.apiUrl}')
    content = content.replace('`http://localhost:3001/api', '`${config.apiUrl}')
    
    # Adicionar import se necessário
    if 'config.apiUrl' in content and "import { config } from '@/config'" not in content:
        # Encontrar a última linha de import
        lines = content.split('\n')
        last_import_idx = -1
        for i, line in enumerate(lines):
            if line.strip().startswith('import '):
                last_import_idx = i
        
        if last_import_idx >= 0:
            lines.insert(last_import_idx + 1, "import { config } from '@/config'")
            content = '\n'.join(lines)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Updated: {service_file}")

print("\nDone!")
