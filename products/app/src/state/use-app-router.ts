import { is, object, string, optional } from 'valibot'
import { computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { MicrocosmSchema, type MicrocosmID } from '@nodenogg.in/schema'
import { DEFAULT_VIEW, type ViewType } from '@/views'

const queryParamsSchema = object({
  with: optional(string()),
  view: optional(string())
})

const { isValidMicrocosmID } = MicrocosmSchema.utils

const parseQuery = (q: unknown) => {
  if (is(queryParamsSchema, q)) {
    const parts = q.with?.split(',') || []
    return parts.filter(isValidMicrocosmID)
  } else {
    return []
  }
}

export const paramToString = <T extends string>(param: string | string[]): T =>
  Array.isArray(param) ? (param.join('') as T) : (param as T)

export const useAppRouter = () => {
  const route = useRoute()
  const router = useRouter()

  const handleRoute = () => {
    const microcosm_id = route.params.microcosm_id as string
    if (microcosm_id && !isValidMicrocosmID(paramToString(microcosm_id))) {
      // app.telemetry.log({
      //   name: 'useAppRouter',
      //   message: `${microcosm_id} is not a valid Microcosm ID`,
      //   level: 'warn'
      // })

      router.push({
        name: 'NotFound',
        query: {
          message: `${microcosm_id} is not a valid Microcosm ID`
        }
      })
    }
  }

  watch(route, handleRoute)

  handleRoute()

  return computed(() => {
    const microcosm_id = paramToString(route.params.microcosm_id)
    const viewType = route.query.view as ViewType | undefined

    return {
      microcosm_id:
        MicrocosmSchema.utils.isValidMicrocosmID(microcosm_id) && (microcosm_id as MicrocosmID),
      subviews: parseQuery(route.query),
      viewType: viewType || DEFAULT_VIEW
    }
  })
}
