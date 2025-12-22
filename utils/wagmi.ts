import { http, createConfig } from 'wagmi'
import { baseSepolia } from 'wagmi/chains'
import { baseAccount } from 'wagmi/connectors'
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector'

// Detect environment
// const isFarcaster = typeof window !== 'undefined' && 
//   (window.location.ancestorOrigins?.contains('warpcast.com') ||
//    window.location.ancestorOrigins?.contains('farcaster.xyz') ||
//    // @ts-ignore
//    window.parent !== window && window.parent?.frames?.length > 0);
  
const isFarcaster = typeof window !== 'undefined' && 
// @ts-ignore
(window.fc !== undefined || window.farcaster !== undefined);

const getConnectors = () => {
  if (isFarcaster) {
    return [miniAppConnector()];
  }
  // For Base App
  return [baseAccount({
    appName: 'Rare24',
    appLogoUrl: 'https://rare24.vercel.app/icon.png'
  })];
};

export const config = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC),
  },
  connectors: getConnectors()
})

