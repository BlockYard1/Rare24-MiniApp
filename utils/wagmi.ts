import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { baseAccount, injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
  },
  connectors: [
    baseAccount({
      appName: 'Rare24',
      appLogoUrl: 'https://rare24.vercel.app/icon.png', // Optional but recommended
    }),
    injected(),
  ]
})