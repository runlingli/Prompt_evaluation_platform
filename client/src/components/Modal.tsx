import React, { ReactNode, MouseEvent } from 'react'
import CloseIcon from '../assets/close-button.svg'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  // 防止点击 overlay 触发 onClose
  const handleOverlayClick = (e: MouseEvent<HTMLDivElement>) => {
    onClose()
  }

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    e.stopPropagation()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        className="bg-white/10 rounded-xl shadow-lg max-w-240 relative p-2 m-4"
        onClick={handleContentClick}
      >
        <div className="p-6 scrollbar-none overflow-y-auto max-h-[70vh]">
          <button
            className="absolute top-2 right-2 text-white rounded"
            onClick={onClose}
          >
            <img
              src={CloseIcon}
              alt="Close"
              className="w-5 h-5 cursor-pointer"
            />
          </button>
          <div className="text-white font-ma">{children}</div>
        </div>
      </div>
    </div>
  )
}

export default Modal
