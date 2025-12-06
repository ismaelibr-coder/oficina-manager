import { useSwipeable } from 'react-swipeable'

/**
 * Hook para implementar gestos de swipe
 * @param onSwipeLeft - Callback para swipe para esquerda
 * @param onSwipeRight - Callback para swipe para direita
 * @returns handlers para aplicar no elemento
 */
export const useSwipe = (
    onSwipeLeft?: () => void,
    onSwipeRight?: () => void
) => {
    const handlers = useSwipeable({
        onSwipedLeft: () => onSwipeLeft?.(),
        onSwipedRight: () => onSwipeRight?.(),
        trackMouse: false, // Apenas touch
        trackTouch: true,
        delta: 50, // Mínimo de 50px para considerar swipe
        preventScrollOnSwipe: true,
    })

    return handlers
}
