import { Tooltip } from '../../../ui/Tooltip'

export interface InheritedIndicatorProps {
  show: boolean
}

export function InheritedIndicator({ show }: InheritedIndicatorProps) {
  if (!show) return null
  return (
    <Tooltip content="Inherited from group" position="top">
      <span className="w-1.5 h-1.5 rounded-full bg-kol-text-muted/50 flex-shrink-0" />
    </Tooltip>
  )
}
