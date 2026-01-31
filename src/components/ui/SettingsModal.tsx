import { BaseModal } from './BaseModal'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title="Settings" width="w-[340px]">
      <div className="flex flex-col items-center justify-center py-10">
        <div className="w-14 h-14 rounded-full bg-kol-surface border border-kol-border flex items-center justify-center mb-4">
          <i className="ri-settings-3-line text-2xl text-kol-text-muted" />
        </div>
        <p className="text-sm text-kol-text-muted font-medium">Coming Soon</p>
        <p className="text-[11px] text-kol-text-muted/60 mt-1">Advanced settings are under development</p>
      </div>
    </BaseModal>
  )
}
