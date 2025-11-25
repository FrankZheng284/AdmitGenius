/// <reference types="vite/client" />

// 声明.env文件中的环境变量类型
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // 可以添加更多环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
} 