import { and, count, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

export async function getWeekPendingGoals() {
  const startOfWeek = dayjs().startOf('week').toDate()
  const endOfWeek = dayjs().endOf('week').toDate()

  const golsCreatedUpToWeek = db.$with('gols_created_up_to_week').as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt,
      })
      .from(goals)
      .where(lte(goals.createdAt, endOfWeek))
  )

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

  const pendingGoals = await db
    .with(golsCreatedUpToWeek, goalCompletionsCounts)
    .select({
      id: golsCreatedUpToWeek.id,
      title: golsCreatedUpToWeek.title,
      desiredWeeklyFrequency: golsCreatedUpToWeek.desiredWeeklyFrequency,
      createdAt: golsCreatedUpToWeek.createdAt,
      completionsCount: sql`
        COALESCE(${goalCompletionsCounts.completionsCount}, 0)
      `.mapWith(Number),
    })
    .from(golsCreatedUpToWeek)
    .leftJoin(
      goalCompletionsCounts,
      eq(goalCompletionsCounts.goalId, golsCreatedUpToWeek.id)
    )

  return pendingGoals
}
