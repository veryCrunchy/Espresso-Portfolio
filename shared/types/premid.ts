export interface PreMIDAssets {
  large_image?: string
  large_text?: string
  small_image?: string
  small_text?: string
}

export interface PreMIDButton {
  label: string
  url: string
}

export interface PreMIDActivity {
  application_id: string
  name: string
  service: string
  api_version: number
  type: 0 | 1 | 2 | 3 | 5
  details?: string
  state?: string
  timestamps?: {
    start?: number
    end?: number
  }
  assets?: PreMIDAssets
  buttons?: PreMIDButton[]
}

export interface PreMIDPayload {
  active_activity: PreMIDActivity | null
  extension: {
    version: string
    user_id: string | null
    api_version: number
  }
}
