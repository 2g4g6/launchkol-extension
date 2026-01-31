export interface VolumeSliderProps {
  value: number
  onChange: (volume: number) => void
}

export function VolumeSlider({ value, onChange }: VolumeSliderProps) {
  return (
    <div className="flex items-center gap-3 flex-1">
      <i className={`ri-volume-${value === 0 ? 'mute' : value < 50 ? 'down' : 'up'}-line text-kol-text-muted`} />
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1 h-1.5 max-sm:h-2.5 bg-kol-surface-elevated rounded-full appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3
          max-sm:[&::-webkit-slider-thumb]:w-5 max-sm:[&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-kol-blue [&::-webkit-slider-thumb]:cursor-pointer
          [&::-webkit-slider-thumb]:shadow-[0_0_6px_var(--kol-blue-glow)]
          [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 max-sm:[&::-moz-range-thumb]:w-5 max-sm:[&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-kol-blue [&::-moz-range-thumb]:border-0"
        style={{
          background: `linear-gradient(to right, var(--kol-blue) ${value}%, var(--kol-surface-elevated) ${value}%)`
        }}
      />
      <span className="text-xs max-sm:text-sm text-kol-text-muted w-8 text-right">{value}%</span>
    </div>
  )
}
