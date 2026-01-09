import React, { useState } from 'react'
import useAIStore from '../stores/useAIStore'
import MdReader from '../utils/MdReader'
import Modal from './Modal'

interface AIResponse {
  content: string
  cost: number
}

interface ModalResponse extends AIResponse {
  name: string
}

const ReplyBox: React.FC = () => {
  const AIcontent = useAIStore(
    (state) => state.AIcontent as Record<string, AIResponse | undefined>
  )
  const checkedAI = useAIStore(
    (state) => state.checkedAI as Record<string, boolean>
  )

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [currentResponse, setCurrentResponse] =
    useState<ModalResponse | null>(null)

  const openModal = (response: AIResponse | undefined, name: string): void => {
    if (!response) return

    const fullcontent: ModalResponse = {
      ...response,
      name,
    }

    setCurrentResponse(fullcontent)
    setIsModalOpen(true)
  }

  const closeModal = (): void => {
    setIsModalOpen(false)
    setCurrentResponse(null)
  }

  return (
    <>
      <h3 className="text-3xl font-ma text-white">AI Reply</h3>

      <div className="flex flex-col md:flex-row md:overflow-x-auto scrollbar-none text-white gap-3 items-start">
        {Object.keys(checkedAI).map((key) => (
          <button
            key={key}
            onClick={() => openModal(AIcontent[key], key)}
            className={`min-h-50 font-ma rounded-lg border p-2 border-gray-600 shrink-0 w-90 flex flex-col scrollbar-none overflow-x-auto gap-1 text-left ${
              !checkedAI[key] && 'hidden'
            }`}
          >
            <h2 className="text-xl font-ma border-b border-gray-600">{key}</h2>

            {AIcontent[key] && (
              <>
                {AIcontent[key]?.cost !== undefined && (
                  <div className="text-m font-ma opacity-50">
                    Cost: {AIcontent[key]!.cost.toFixed(4)}
                  </div>
                )}
                <MdReader text={AIcontent[key]!.content || ''} />
              </>
            )}
          </button>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal}>
        {currentResponse && (
          <div className="flex flex-col">
            <div className="flex justify-between">
              <h2 className="text-2xl font-medium">
                {currentResponse.name}
              </h2>
              <h5 className="bg-white/30 rounded-xl px-1 flex items-center">
                {currentResponse.cost.toFixed(4)}
              </h5>
            </div>

            <div className="overflow-hidden transition-all duration-700 ease-in-out max-h-96">
              <MdReader text={currentResponse.content} />
            </div>
          </div>
        )}
      </Modal>
    </>
  )
}

export default ReplyBox
