import React, { useState, useEffect } from 'react'
import axios from 'axios'
import useAIStore from '../stores/useAIStore'
import CheckBox from './CheckBox'	
import useSessionStore from '../stores/useSessionStore'

interface AIReply {
  content: string
  cost: number
}

type AIReplyMap = Record<string, AIReply>

const Prompt: React.FC = () => {
  const [sprompt, setSysPrompt] = useState<string>('You are a helpful assistant.')
  const [uprompt, setUsrPrompt] = useState<string>('')
	const [websiteMode, setWebsiteMode] = useState<boolean>(false)

  const updateRepl = useAIStore((state) => state.updateRepl)
  const AIcontent = useAIStore(
    (state) => state.AIcontent as AIReplyMap
  )
  const checkedAI = useAIStore(
    (state) => state.checkedAI as Record<string, boolean>
  )

  const [loading, setLoading] = useState<boolean>(false)
  const [time, setTime] = useState<number>(0)
  const [contentGenerated, setContentGenerated] =
    useState<boolean>(false)

  const createSession = useSessionStore(
    (state) => state.createSession
  )

  const saveLocal = (): void => {
    createSession(uprompt, sprompt, AIcontent)
    setContentGenerated(false)
  }

  useEffect(() => {
    if (!loading) return

    const intervalId = setInterval(() => {
      setTime((prev) => prev + 0.1)
    }, 100)

    return () => clearInterval(intervalId)
  }, [loading])

  const handleSend = async (): Promise<void> => {
    if (!uprompt.trim()) return

    setLoading(true)
    setTime(0)

    try {
      const { data } = await axios.post<AIReplyMap>(
        'http://127.0.0.1:8000/chat',
        {
		  mode: websiteMode ? 'website_summary' : 'standard_chat',
          sys_prompt: sprompt,
          user_prompt: uprompt,
          enable: checkedAI,
        }
      )
	  console.log({data})

      Object.keys(data).forEach((key) => {
        updateRepl(key, data[key])
      })
    } catch (err) {
      if (err instanceof Error) {
        updateRepl('Fetch error', {
          content: err.message,
          cost: 0,
        })
      }
    } finally {
      setLoading(false)
      setContentGenerated(true)
    }
  }

  return (
    <>
      <h1 className="text-3xl font-ma text-white">
        Prompt Evaluation Platform
      </h1>

      <div className="flex flex-col gap-2 w-full md:flex-row mb-2">
        <div className="flex flex-col w-full gap-1">
          <h2 className="text-xl font-ma text-white max-sm:self-center">
            User prompt
          </h2>
		  
          <textarea
            className="border border-gray-600 min-h-50 rounded-2xl scrollbar-none p-2 text-white font-ma focus:outline-1 focus:outline-white"
            value={uprompt}
            onChange={(e) => setUsrPrompt(e.target.value)}
            placeholder={`${websiteMode ? "e.g. https://example.com" : "Type your message here..."}`}
          />

					<label
							key="website"
							className="relative flex items-center cursor-pointer gap-2"
						>
							<input
								type="checkbox"
								checked={websiteMode}
								onChange={() => setWebsiteMode(!websiteMode)}
								className="appearance-none cursor-pointer w-6 h-6 rounded-full border-2 relative border-[rgba(75,85,99,0.5)]"
							/>
							<span
								className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-gray-600 pointer-events-none transition-all duration-200 
								${
									websiteMode
										? 'scale-100 opacity-60'
										: 'scale-0 opacity-0'
								}`}
							/>
							<span className="text-white font-ma">Analyze website content (input url)</span>
						</label>
        </div>

        <div className="flex flex-col w-full gap-1">
          <h2 className="text-xl font-ma text-white max-sm:self-center">
            System prompt
          </h2>
          <textarea
            className="border border-gray-600 min-h-50 rounded-2xl scrollbar-none p-2 text-white font-ma focus:outline-1 focus:outline-white"
            value={sprompt}
            onChange={(e) => setSysPrompt(e.target.value)}
          />
        </div>
      </div>

      <CheckBox />

      {contentGenerated ? (
        <div className="flex justify-center gap-2 w-full">
          <button
            className="bg-white text-indigo-950 text-lg px-2 cursor-pointer rounded-3xl w-25 font-ma"
            onClick={saveLocal}
          >
            Save
          </button>
          <button
            className="bg-white text-indigo-950 text-lg opacity-70 px-2 cursor-pointer rounded-3xl w-25 font-ma"
            onClick={() => setContentGenerated(false)}
          >
            Discard
          </button>
        </div>
      ) : (
        <button
          className="bg-white text-indigo-950 text-lg px-2 rounded-3xl w-25 self-center font-ma cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSend}
          disabled={
            loading ||
            !sprompt.trim() ||
            !uprompt.trim() ||
            Object.values(checkedAI).every(
              (value) => value === false
            )
          }
        >
          {loading ? `${time.toFixed(1)}s` : 'Send'}
        </button>
      )}
    </>
  )
}

export default Prompt
