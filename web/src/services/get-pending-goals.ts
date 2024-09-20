import { BASE_URL } from './config'

type PendingGoalsResponse = {
  id: string
  title: string
  desiredWeeklyFrequency: number
  createdAt: Date
  completionsCount: number
}[]

export const getPendingGoals = async (): Promise<PendingGoalsResponse> => {
  const response = await fetch(`${BASE_URL}/pending-goals`)
  const data = await response.json()
  return data
}
