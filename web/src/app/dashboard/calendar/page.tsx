'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay, parseISO, addHours, setHours, setMinutes } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { appointmentsService, Appointment } from '@/services/appointments'
import { boxesService, Box } from '@/services/boxes'
import { usersService, User } from '@/services/users'
import { authService } from '@/services/auth'
import ConflictModal from '@/components/ConflictModal'
import { MobileDayView } from '@/components/calendar/MobileDayView'
import { useIsMobile } from '@/hooks/useIsMobile'

type ViewMode = 'BOX' | 'MECHANIC'

export default function CalendarPage() {
  const router = useRouter()
  const isMobile = useIsMobile()
  const [currentWeek, setCurrentWeek] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [boxes, setBoxes] = useState<Box[]>([])
  const [mechanics, setMechanics] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>('BOX')

  // Drag & Drop State
  const [draggedAppointment, setDraggedAppointment] = useState<Appointment | null>(null)
  const [conflictModalOpen, setConflictModalOpen] = useState(false)
  const [pendingMove, setPendingMove] = useState<{ id: string, boxId?: string, start: Date, end: Date } | null>(null)
  const [conflicts, setConflicts] = useState<any>({ boxConflicts: [], mechanicConflicts: [] })
  const [cascadeMoves, setCascadeMoves] = useState<any[]>([])

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }) // Segunda-feira
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: 12 }, (_, i) => i + 7) // 7h às 18h

  useEffect(() => {
    loadData()
  }, [currentWeek])

  const loadData = async () => {
    try {
      setLoading(true)
      const weekEnd = addDays(weekStart, 7)

      const [appointmentsData, boxesData, usersData] = await Promise.all([
        appointmentsService.list({
          start: weekStart.toISOString(),
          end: weekEnd.toISOString()
        }),
        boxesService.list(),
        usersService.list()
      ])

      setAppointments(appointmentsData)
      setBoxes(boxesData)
      setMechanics(usersData.filter(u => u.role === 'MECHANIC'))
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const getAppointmentForSlot = (day: Date, hour: number, resourceId: string) => {
    return appointments.find(apt => {
      const aptStart = parseISO(apt.scheduledStart)
      const aptHour = aptStart.getHours()
      const isSameDate = isSameDay(aptStart, day) && aptHour === hour

      if (!isSameDate) return false

      if (viewMode === 'BOX') {
        return apt.boxId === resourceId
      } else {
        return apt.serviceOrder?.mechanicId === resourceId
      }
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500 hover:bg-blue-600'
      case 'CHECKED_IN': return 'bg-yellow-500 hover:bg-yellow-600'
      case 'IN_PROGRESS': return 'bg-purple-500 hover:bg-purple-600'
      case 'COMPLETED': return 'bg-green-500 hover:bg-green-600'
      case 'CANCELLED': return 'bg-red-500 hover:bg-red-600'
      case 'RESCHEDULED': return 'bg-orange-500 hover:bg-orange-600'
      default: return 'bg-gray-500 hover:bg-gray-600'
    }
  }

  const handlePreviousWeek = () => setCurrentWeek(subWeeks(currentWeek, 1))
  const handleNextWeek = () => setCurrentWeek(addWeeks(currentWeek, 1))
  const handleToday = () => setCurrentWeek(new Date())

  // Drag & Drop Handlers
  const handleDragStart = (e: React.DragEvent, appointment: Appointment) => {
    setDraggedAppointment(appointment)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = async (e: React.DragEvent, day: Date, hour: number, resourceId: string) => {
    e.preventDefault()
    if (!draggedAppointment) return

    // Calcular novos horários
    const duration = (new Date(draggedAppointment.scheduledEnd).getTime() - new Date(draggedAppointment.scheduledStart).getTime())
    const newStart = setMinutes(setHours(day, hour), 0)
    const newEnd = new Date(newStart.getTime() + duration)

    // Preparar dados para verificação
    const moveData = {
      id: draggedAppointment.id,
      boxId: viewMode === 'BOX' ? resourceId : draggedAppointment.boxId, // Se arrastar em mecânico, mantém box original por enquanto
      start: newStart,
      end: newEnd
    }

    // Verificar conflitos
    try {
      const result = await appointmentsService.checkConflicts({
        id: moveData.id,
        boxId: moveData.boxId!,
        scheduledStart: moveData.start.toISOString(),
        scheduledEnd: moveData.end.toISOString()
      })

      if (result.hasConflicts) {
        setConflicts(result)
        setPendingMove(moveData)

        // Simular cascata
        try {
          const cascadeResult = await appointmentsService.simulateCascade({
            id: moveData.id,
            boxId: moveData.boxId!,
            scheduledStart: moveData.start.toISOString(),
            scheduledEnd: moveData.end.toISOString()
          })
          setCascadeMoves(cascadeResult)
        } catch (err) {
          console.error('Erro ao simular cascata:', err)
        }

        setConflictModalOpen(true)
      } else {
        // Sem conflitos, atualizar direto
        await updateAppointment(moveData)
      }
    } catch (error) {
      console.error('Erro ao verificar conflitos:', error)
      alert('Erro ao verificar conflitos')
    }

    setDraggedAppointment(null)
  }

  const updateAppointment = async (data: { id: string, boxId?: string, start: Date, end: Date }) => {
    try {
      await appointmentsService.update(data.id, {
        boxId: data.boxId,
        scheduledStart: data.start.toISOString(),
        scheduledEnd: data.end.toISOString()
      })
      loadData() // Recarregar dados
    } catch (error) {
      console.error('Erro ao mover agendamento:', error)
      alert('Erro ao mover agendamento')
    }
  }

  const handleConflictConfirm = async (action: 'FORCE' | 'CASCADE') => {
    if (action === 'CASCADE' && cascadeMoves.length > 0) {
      // Incluir o movimento inicial na lista de batch
      const allMoves = [
        {
          id: pendingMove!.id,
          start: pendingMove!.start,
          end: pendingMove!.end,
          boxId: pendingMove!.boxId
        },
        ...cascadeMoves.map(m => ({
          id: m.id,
          start: m.start,
          end: m.end,
          boxId: m.boxId
        }))
      ]

      try {
        await appointmentsService.batchUpdate(allMoves)
        loadData()
      } catch (error) {
        console.error('Erro ao aplicar cascata:', error)
        alert('Erro ao aplicar cascata')
      }
    } else if (pendingMove) {
      // FORCE
      await updateAppointment(pendingMove)
    }
    setConflictModalOpen(false)
    setPendingMove(null)
    setCascadeMoves([])
  }

  const resources = viewMode === 'BOX' ? boxes : mechanics

  return (
    <div className="min-h-screen bg-gray-50">
      <ConflictModal
        isOpen={conflictModalOpen}
        onClose={() => setConflictModalOpen(false)}
        onConfirm={handleConflictConfirm}
        conflicts={conflicts}
      />

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Calendário Semanal</h1>
            <div className="flex items-center gap-4">
              <button onClick={() => router.push('/dashboard')} className="px-4 py-2 text-gray-600 hover:text-gray-900">← Voltar</button>
              <button onClick={() => { authService.logout(); router.push('/') }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Sair</button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controles de Navegação e Visualização */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-center bg-white rounded-lg shadow p-4 gap-4">
          <div className="flex items-center gap-2">
            <button onClick={handlePreviousWeek} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">←</button>
            <button onClick={handleNextWeek} className="px-3 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">→</button>
            <button onClick={handleToday} className="px-3 py-1 text-primary-600 hover:text-primary-800 text-sm font-medium">Hoje</button>
            <span className="text-lg font-semibold text-gray-900 ml-2">
              {format(weekStart, "d 'de' MMMM", { locale: ptBR })} - {format(addDays(weekStart, 6), "d 'de' MMMM", { locale: ptBR })}
            </span>
          </div>

          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('BOX')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'BOX' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Por Box
            </button>
            <button
              onClick={() => setViewMode('MECHANIC')}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${viewMode === 'MECHANIC' ? 'bg-white text-primary-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Por Mecânico
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">Carregando...</div>
        ) : isMobile ? (
          <MobileDayView
            appointments={appointments}
            onAppointmentClick={(apt) => router.push(`/dashboard/appointments/${apt.id}`)}
          />
        ) : (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Cabeçalho com dias da semana */}
              <div className="grid grid-cols-8 border-b border-gray-200 bg-gray-50">
                <div className="p-3 text-sm font-medium text-gray-500">Horário</div>
                {weekDays.map((day, idx) => (
                  <div key={idx} className="p-3 text-center border-l border-gray-200">
                    <div className="text-sm font-medium text-gray-900">
                      {format(day, 'EEE', { locale: ptBR })}
                    </div>
                    <div className={`text-lg font-bold ${isSameDay(day, new Date()) ? 'text-primary-600' : 'text-gray-700'}`}>
                      {format(day, 'd')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Grade de Horários */}
              {hours.map(hour => (
                <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[80px]">
                  <div className="p-3 text-sm font-medium text-gray-500 bg-gray-50">
                    {hour}:00
                  </div>

                  {weekDays.map((day, dayIdx) => (
                    <div key={dayIdx} className="border-l border-gray-200 p-1">
                      <div className="grid gap-1">
                        {resources.map(resource => {
                          const appointment = getAppointmentForSlot(day, hour, resource.id)

                          if (appointment) {
                            return (
                              <div
                                key={appointment.id}
                                draggable
                                onDragStart={(e) => handleDragStart(e, appointment)}
                                onClick={() => router.push(`/dashboard/appointments/${appointment.id}`)}
                                className={`${getStatusColor(appointment.status)} text-white text-xs p-2 rounded cursor-pointer transition-colors w-full text-left opacity-90 hover:opacity-100`}
                                title={`${resource.name} - ${appointment.customer?.name}`}
                              >
                                <div className="font-semibold truncate">{viewMode === 'BOX' ? resource.name : `Mec: ${resource.name}`}</div>
                                <div className="truncate">{appointment.customer?.name}</div>
                                <div className="truncate text-white/80">{appointment.vehicle?.plate}</div>
                              </div>
                            )
                          }

                          // Slot vazio (Droppable)
                          return (
                            <div
                              key={resource.id}
                              onDragOver={handleDragOver}
                              onDrop={(e) => handleDrop(e, day, hour, resource.id)}
                              className="h-full min-h-[20px] border border-transparent hover:border-dashed hover:border-gray-300 rounded transition-colors"
                            />
                          )
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legenda */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda de Status:</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-blue-500 rounded"></div>
              <span className="text-sm text-gray-600">Agendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-500 rounded"></div>
              <span className="text-sm text-gray-600">Check-in</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-purple-500 rounded"></div>
              <span className="text-sm text-gray-600">Em Andamento</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600">Concluído</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span className="text-sm text-gray-600">Reagendado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600">Cancelado</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
