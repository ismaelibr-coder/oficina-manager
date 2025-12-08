import type { Metadata } from 'next'
// import { Inter } from 'next/font/google' // Temporariamente desabilitado devido a erro de certificado SSL
import './globals.css'
import { ReactQueryProvider } from '@/providers/ReactQueryProvider'

// const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'Sistema de Gestão de Oficina',
    description: 'Sistema completo para gestão de oficina mecânica',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="pt-BR" suppressHydrationWarning={true}>
            <body className="font-sans" suppressHydrationWarning={true}>
                <ReactQueryProvider>
                    {children}
                </ReactQueryProvider>
            </body>
        </html>
    )
}
