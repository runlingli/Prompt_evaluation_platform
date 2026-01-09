import { create } from 'zustand'
import { combine } from 'zustand/middleware'

interface AIReply {
  content: string
  cost: number
}

type AIContentMap = Record<string, AIReply>

type CheckedAIMap = Record<string, boolean>

interface AIStoreActions {
  updateRepl: (aiName: string, aiReply: AIReply) => void
  updateAI: (AIlist: CheckedAIMap) => void
}

const useAIStore = create(
  combine(
    {
      AIcontent: {} as AIContentMap,
      checkedAI: {
        'OpenAI-4-mini': true,
        'OpenAI-5-mini': true,
        'Deepseek-chat': true,
        'Deepseek-reasoner': true,
        'Claude-haiku-3': true,
        'Claude-sonnet-4': true,
        'Gemini-3-pro': true,
        'Gemini-3-flash': true,
      } as CheckedAIMap,
    },
    (set): AIStoreActions => ({
      updateRepl: (aiName, aiReply) =>
        set((state) => ({
          ...state,
          AIcontent: {
            ...state.AIcontent,
            [aiName]: {
              content: aiReply.content,
              cost: aiReply.cost,
            },
          },
        })),

      updateAI: (AIlist) =>
        set((state) => ({
          ...state,
          checkedAI: AIlist,
        })),
    })
  )
)

export default useAIStore
