import { BASE_URL } from './config'

type Summary = Record<
  string,
  {
    id: string
    title: string
    completedAt: string
  }[]
>

type SummaryResponse = {
  completed: number
  total: number
  goalsPerDay: Summary
}

export const getSummary = async (): Promise<SummaryResponse> => {
  const response = await fetch(`${BASE_URL}/summary`)
  const data = await response.json()
  return data.summary
}
