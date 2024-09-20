import { and, count, desc, eq, gte, lte, sql } from 'drizzle-orm'
import { db } from '../db'
import { goalCompletions, goals } from '../db/schema'
import dayjs from 'dayjs'

type Summary = Record<
  string,
  {
    id: string
    title: string
    createdAt: string
  }[]
>

export async function getWeekSummary() {
  const endOfWeek = dayjs().endOf('week').toDate()
  const startOfWeek = dayjs().startOf('week').toDate()

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

  const goalsCompletedInWeek = db.$with('gols_completed_in_week').as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql`
          DATE(${goalCompletions.createdAt})
        `.as('completedAtDate'),
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goals.id, goalCompletions.goalId))
      .where(
        and(
          lte(goalCompletions.createdAt, endOfWeek),
          gte(goalCompletions.createdAt, startOfWeek)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  )

  const goalsCompletedByWeekDay = db.$with('gols_completed_by_week_day').as(
    db
      .select({
        completions: sql`
          JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'title', ${goalsCompletedInWeek.title},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )
        `.as('completions'),
        completedAtDate: goalsCompletedInWeek.completedAtDate,
      })
      .from(goalsCompletedInWeek)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
      .groupBy(goalsCompletedInWeek.completedAtDate)
  )

  const summary = await db
    .with(golsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql`(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`.mapWith(
        Number
      ),
      total:
        sql`(SELECT SUM(${golsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${golsCreatedUpToWeek})`.mapWith(
          Number
        ),
      goalsPerDay: sql<Summary>`
          JSON_OBJECT_AGG(
            ${goalsCompletedByWeekDay.completedAtDate}, ${goalsCompletedByWeekDay.completions}
          )  
        `,
    })
    .from(goalsCompletedByWeekDay)

  return {
    summary: summary[0],
  }
}
