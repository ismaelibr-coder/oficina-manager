import { useState, useEffect } from 'react'

/**
 * Hook para detectar se o dispositivo é mobile
 * @param breakpoint - Largura em pixels para considerar mobile (padrão: 768px)
 * @returns boolean indicando se é mobile
 */
export const useIsMobile = (breakpoint: number = 768): boolean => {
    const [isMobile, setIsMobile] = useState(false)

    useEffect(() => {
        // Função para verificar se é mobile
        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint)
        }

        // Verificar no mount
        checkMobile()

        // Adicionar listener para resize
        window.addEventListener('resize', checkMobile)

        // Cleanup
        return () => window.removeEventListener('resize', checkMobile)
    }, [breakpoint])

    return isMobile
}

/**
 * Hook para detectar tamanho específico da tela
 * @returns objeto com flags para diferentes breakpoints
 */
export const useBreakpoint = () => {
    const [breakpoint, setBreakpoint] = useState({
        isMobile: false,      // < 768px
        isTablet: false,      // 768px - 1024px
        isDesktop: false,     // > 1024px
        isSmallMobile: false, // < 375px
    })

    useEffect(() => {
        const checkBreakpoint = () => {
            const width = window.innerWidth
            setBreakpoint({
                isMobile: width < 768,
                isTablet: width >= 768 && width < 1024,
                isDesktop: width >= 1024,
                isSmallMobile: width < 375,
            })
        }

        checkBreakpoint()
        window.addEventListener('resize', checkBreakpoint)
        return () => window.removeEventListener('resize', checkBreakpoint)
    }, [])

    return breakpoint
}
