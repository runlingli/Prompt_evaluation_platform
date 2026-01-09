import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Session {
  user_prompt: string
  sys_prompt: string
  AIcontent: Record<string, unknown>
  createdAt: number
}

type SessionMap = Record<string, Session>

interface SessionStore {
  sessions: SessionMap
  createSession: (
    user_prompt: string,
    sys_prompt: string,
    AIcontent: Record<string, unknown>
  ) => void
  deleteSession: (id: string) => void
}

const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      sessions: {},

      createSession: (user_prompt, sys_prompt, AIcontent) => {
        const id = Date.now().toString()

        const newSessions: SessionMap = {
          ...get().sessions,
          [id]: {
            user_prompt,
            sys_prompt,
            AIcontent,
            createdAt: Date.now(),
          },
        }

        set({ sessions: newSessions })
      },

      deleteSession: (id) => {
        const { [id]: _d, ...deletedSession } = get().sessions
        set({ sessions: deletedSession })
      },
    }),
    {
      name: 'ai_sessions',
      // storage: createJSONStorage(() => sessionStorage),
    }
  )
)

export default useSessionStore
