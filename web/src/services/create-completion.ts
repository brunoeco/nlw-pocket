import { BASE_URL } from './config'

export function createCompletion(goalId: string) {
  return fetch(`${BASE_URL}/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ goalId }),
  })
}
