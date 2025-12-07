import { useState, useRef, useEffect } from 'react'

interface FilterDropdownProps {
    label: string
    options: { value: string; label: string }[]
    selectedValues: string[]
    onChange: (values: string[]) => void
    placeholder?: string
}

export function FilterDropdown({ label, options, selectedValues, onChange, placeholder }: FilterDropdownProps) {
    const [isOpen, setIsOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const toggleOption = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value))
        } else {
            onChange([...selectedValues, value])
        }
    }

    const selectedCount = selectedValues.length
    const displayText = selectedCount === 0
        ? (placeholder || 'Selecione')
        : selectedCount === 1
            ? options.find(o => o.value === selectedValues[0])?.label
            : `${selectedCount} selecionados`

    return (
        <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full md:w-64 px-4 py-2 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
                <div className="flex items-center justify-between">
                    <span className={selectedCount === 0 ? 'text-gray-400' : 'text-gray-900'}>
                        {displayText}
                    </span>
                    <svg
                        className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-2 w-full md:w-64 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <div className="p-2">
                        {options.map((option) => (
                            <label
                                key={option.value}
                                className="flex items-center px-3 py-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                                <input
                                    type="checkbox"
                                    checked={selectedValues.includes(option.value)}
                                    onChange={() => toggleOption(option.value)}
                                    className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                                />
                                <span className="ml-3 text-sm text-gray-900">{option.label}</span>
                            </label>
                        ))}
                    </div>
                    {selectedCount > 0 && (
                        <div className="border-t border-gray-200 p-2">
                            <button
                                onClick={() => {
                                    onChange([])
                                    setIsOpen(false)
                                }}
                                className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded"
                            >
                                Limpar seleção
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
