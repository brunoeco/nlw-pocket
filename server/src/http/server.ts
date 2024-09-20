import fastify from 'fastify'
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { createGoalCompletionRoute } from './routes/create-completion'
import { createGoalRoute } from './routes/create-goal'
import { getWeekPendingGoalRoute } from './routes/get-peding-goal'
import { getWeekSummaryRoute } from './routes/get-week-summary'
import fastifyCors from '@fastify/cors'

const app = fastify().withTypeProvider<ZodTypeProvider>()

app.setValidatorCompiler(validatorCompiler)
app.setSerializerCompiler(serializerCompiler)

app.register(fastifyCors, {
  origin: '*',
})

app.register(createGoalCompletionRoute)
app.register(createGoalRoute)
app.register(getWeekPendingGoalRoute)
app.register(getWeekSummaryRoute)

app.listen({ port: 3333 }).then(() => {
  console.log('HTTP Server Running!')
})
