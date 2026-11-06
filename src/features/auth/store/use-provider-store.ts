import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SupportedOAuthProvider } from '../config/o-auth-providers'

type ProviderState = {
  provider: SupportedOAuthProvider | null
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (): ProviderState => ({
      provider: null,
    }),
    {
      name: 'last-used-provider-storage',
    },
  ),
)

export const providerActions = {
  setProvider: (provider: SupportedOAuthProvider) => useProviderStore.setState({ provider }),
}
