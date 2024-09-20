import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

interface CreateGoalCompletionRequest {
  goalId: string
}

export async function createGoalCompletion(
  request: CreateGoalCompletionRequest
) {
  const startOfWeek = dayjs().startOf('week').toDate()
  const endOfWeek = dayjs().endOf('week').toDate()

  const goalCompletionsCounts = db.$with('gols_completions_counts').as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionsCount: count(goalCompletions.id).as('completionsCount'),
      })
      .from(goalCompletions)
      .where(
        and(
          lte(goalCompletions.createdAt, endOfWeek),
          gte(goalCompletions.createdAt, startOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  )

  const { goalId } = request

  const result = await db
    .with(goalCompletionsCounts)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionsCount: sql`
        COALESCE(${goalCompletionsCounts.completionsCount}, 0)
      `.mapWith(Number),
    })
    .from(goals)
    .leftJoin(goalCompletionsCounts, eq(goals.id, goalCompletionsCounts.goalId))
    .where(eq(goals.id, goalId))
    .limit(1)

  const { completionsCount, desiredWeeklyFrequency } = result[0]

  if (completionsCount >= desiredWeeklyFrequency) {
    throw new Error('Goal already completed this week!')
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning()

  const goalCompletion = insertResult[0]

  return {
    goalCompletion,
  }
}
