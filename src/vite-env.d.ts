/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ALCHEMY_ETHEREUM: string
  readonly VITE_ALCHEMY_POLYGON: string
  readonly VITE_ALCHEMY_ARBITRUM: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

