import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline'

interface Conflict {
    id: string
    customer: { name: string }
    vehicle: { plate: string; model: string }
    scheduledStart: string
    scheduledEnd: string
    box?: { name: string }
}

interface ConflictModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (action: 'FORCE' | 'CASCADE') => void
    conflicts: {
        boxConflicts: Conflict[]
        mechanicConflicts: Conflict[]
    }
    cascadeMoves?: any[]
}

export default function ConflictModal({ isOpen, onClose, onConfirm, conflicts, cascadeMoves }: ConflictModalProps) {
    const hasBoxConflicts = conflicts.boxConflicts.length > 0
    const hasMechanicConflicts = conflicts.mechanicConflicts.length > 0
    const hasCascadeSolution = cascadeMoves && cascadeMoves.length > 0

    return (
        <Transition.Root show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                </Transition.Child>

                <div className="fixed inset-0 z-10 overflow-y-auto">
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                            enterTo="opacity-100 translate-y-0 sm:scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                        >
                            <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                                <div className="sm:flex sm:items-start">
                                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                                    </div>
                                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                                        <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                                            Conflito de Agendamento Detectado
                                        </Dialog.Title>
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">
                                                A alteração solicitada gera conflitos com os seguintes agendamentos:
                                            </p>

                                            {hasBoxConflicts && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-900">Conflitos de Box:</h4>
                                                    <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                                                        {conflicts.boxConflicts.map((c) => (
                                                            <li key={c.id} className="p-2 text-sm">
                                                                <span className="font-medium">{c.customer.name}</span> - {c.vehicle.model} ({c.vehicle.plate})
                                                                <br />
                                                                <span className="text-xs text-gray-500">Local: {c.box?.name || 'Box Desconhecido'}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {hasMechanicConflicts && (
                                                <div className="mt-4">
                                                    <h4 className="text-sm font-medium text-gray-900">Conflitos de Mecânico:</h4>
                                                    <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
                                                        {conflicts.mechanicConflicts.map((c) => (
                                                            <li key={c.id} className="p-2 text-sm">
                                                                <span className="font-medium">{c.customer.name}</span> - {c.vehicle.model} ({c.vehicle.plate})
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            {hasCascadeSolution && (
                                                <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-100">
                                                    <h4 className="text-sm font-medium text-blue-900 flex items-center gap-2">
                                                        ✨ Solução Automática (Cascata)
                                                    </h4>
                                                    <p className="text-xs text-blue-700 mt-1 mb-2">
                                                        O sistema pode reagendar automaticamente os itens afetados:
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {cascadeMoves!.map((move, idx) => (
                                                            <li key={idx} className="text-xs text-blue-800 flex justify-between">
                                                                <span>{move.customer?.name || 'Agendamento'} ({move.vehicle?.plate})</span>
                                                                <span className="font-mono">
                                                                    {new Date(move.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                    {' -> '}
                                                                    {new Date(move.end).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <p className="mt-4 text-sm text-gray-500">
                                                Como deseja prosseguir?
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-2">
                                    {hasCascadeSolution && (
                                        <button
                                            type="button"
                                            className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:w-auto"
                                            onClick={() => onConfirm('CASCADE')}
                                        >
                                            Aplicar Cascata
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        className="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:w-auto"
                                        onClick={() => onConfirm('FORCE')}
                                    >
                                        Forçar (Ignorar Conflito)
                                    </button>
                                    <button
                                        type="button"
                                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                                        onClick={onClose}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition.Root>
    )
}
