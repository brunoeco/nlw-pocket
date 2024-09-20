import { BASE_URL } from './config'

type CreateGoalRequest = {
  title: string
  desiredWeeklyFrequency: number
}

export function createGoal(payload: CreateGoalRequest) {
  return fetch(`${BASE_URL}/goal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })
}
