import os
import re

# Diretório dos services
services_dir = r"c:\Users\ismaelr\Desktop\oficina\web\src\services"

# Padrão para encontrar localhost:3001
pattern = r"'http://localhost:3001/api"
replacement = r"'${config.apiUrl}"

# Processar todos os arquivos .ts
for filename in os.listdir(services_dir):
    if filename.endswith('.ts'):
        filepath = os.path.join(services_dir, filename)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Verificar se precisa adicionar import
        needs_import = 'localhost:3001' in content and "import { config } from '@/config'" not in content
        
        # Substituir URLs
        new_content = content.replace("'http://localhost:3001/api", "'${config.apiUrl}")
        new_content = new_content.replace('"http://localhost:3001/api', '"${config.apiUrl}')
        new_content = new_content.replace('`http://localhost:3001/api', '`${config.apiUrl}')
        
        # Adicionar import se necessário
        if needs_import and new_content != content:
            # Encontrar a última linha de import
            lines = new_content.split('\n')
            last_import_idx = 0
            for i, line in enumerate(lines):
                if line.strip().startswith('import '):
                    last_import_idx = i
            
            # Inserir import após o último import
            lines.insert(last_import_idx + 1, "import { config } from '@/config'")
            new_content = '\n'.join(lines)
        
        # Salvar se houve mudanças
        if new_content != content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(new_content)
            print(f"Updated: {filename}")

print("Done!")
