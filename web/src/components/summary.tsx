import { CheckCircle2, Plus } from 'lucide-react'
import { Button } from './ui/button'
import { DialogTrigger } from './ui/dialog'
import { InOrbitIcon } from './in-orbit-icon'
import { Progress, ProgressIndicator } from './ui/progress-bar'
import { Separator } from './ui/separator'
import { useQuery } from '@tanstack/react-query'
import { getSummary } from '../services/get-summary'
import 'dayjs/locale/pt-br'
import dayjs from 'dayjs'
import { PendingGoals } from './pending-goals'

dayjs.locale('pt-br')

export function Summary() {
  const { data } = useQuery({
    queryKey: ['summary'],
    queryFn: getSummary,
    staleTime: 1000 * 60,
  })

  if (!data) {
    return null
  }

  const startOfWeek = dayjs().startOf('week').format('DD MMM')
  const endOfWeek = dayjs().endOf('week').format('DD MMM')

  const goalsPercent =
    data?.total > 0 ? Math.round((data?.completed / data?.total) * 100) : 0

  return (
    <div className="py-10 px-5 max-w-[480px] mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <InOrbitIcon />
          <span className="text-lg font-semibold capitalize">
            {startOfWeek} - {endOfWeek}
          </span>
        </div>
        <DialogTrigger asChild>
          <Button type="button" size="sm">
            <Plus className="size-4" />
            Cadastrar meta
          </Button>
        </DialogTrigger>
      </div>

      <div className="flex flex-col gap-3">
        <Progress>
          <ProgressIndicator style={{ width: `${goalsPercent}%` }} />
        </Progress>

        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>
            Você completou{' '}
            <span className="text-zinc-100">{data.completed}</span> de{' '}
            <span className="text-zinc-100">{data.total}</span> metas nessa
            semana.
          </span>
          <span>{goalsPercent}%</span>
        </div>
      </div>

      <Separator />

      <PendingGoals />

      <div className="flex flex-col gap-6">
        <h2>Sua semana</h2>

        {Object.entries(data.goalsPerDay).map(([date, goals]) => {
          return (
            <div key={date} className="flex flex-col gap-4">
              <h3 className="font-medium capitalize">
                {dayjs(date).format('dddd')}{' '}
                <span className="text-zinc-400 text-xs normal-case">
                  ({dayjs(date).format('DD [de] MMMM')})
                </span>
              </h3>

              <ul className="flex flex-col gap-3">
                {goals.map(goal => {
                  return (
                    <li key={goal.id} className="flex items-center gap-2">
                      <CheckCircle2 className="size-4 text-pink-500" />
                      <span className="text-sm text-zinc-400">
                        Você completou "
                        <span className="text-zinc-100">{goal.title}</span>" às{' '}
                        <span className="text-zinc-100">
                          {dayjs(goal.completedAt).format('HH:mm')}h
                        </span>
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )
        })}
      </div>
    </div>
  )
}
