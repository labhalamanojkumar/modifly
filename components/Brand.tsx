import React from 'react'

export default function Brand({ size = 'base' }: { size?: 'sm' | 'base' | 'lg' }) {
  const sizeClass = size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-lg' : 'text-xl'
  return (
    <div className="flex flex-col items-start">
      <div className={`font-extrabold tracking-tight ${sizeClass} brand-gradient`} style={{ backgroundImage: 'linear-gradient(90deg,#6366F1,#F472B6,#F59E0B)' }}>
        Modifly
      </div>
      <div className="text-xs text-gray-500 -mt-1">By Testcraft.in</div>
    </div>
  )
}
