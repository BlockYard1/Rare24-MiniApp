import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.BASE_SEPOLIA_RPC),
  },
  connectors: [
    injected(),
    miniAppConnector()
  ]
})