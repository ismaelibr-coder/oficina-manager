async function testAuthError() {
    console.log('🧪 Testando erro de autenticação...')
    try {
        const response = await fetch('http://localhost:3001/api/service-orders/alerts', {
            headers: { 'Authorization': 'Bearer invalid-token-123' }
        })

        if (!response.ok) {
            const data = await response.json()
            console.log('Status:', response.status)
            console.log('Body:', data)

            if (data.message === 'Token inválido') {
                console.log('✅ Mensagem de erro confirmada: "Token inválido"')
            } else {
                console.log('❌ Mensagem de erro diferente do esperado!')
            }
        } else {
            console.log('❌ Requisição não falhou como esperado!')
        }
    } catch (error: any) {
        console.error('Erro na requisição:', error.message)
    }
}

testAuthError()
