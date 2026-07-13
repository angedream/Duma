import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
// import fs from 'fs'
import Components from 'unplugin-vue-components/vite'
import { VantResolver } from 'unplugin-vue-components/resolvers'
// https://vite.dev/config/
export default defineConfig({
  server: {
    host: '0.0.0.0',
    port: 8080,
    // https: {
    //   key: fs.readFileSync('C:/Users/zilong/Desktop/angerdream21.top/privkey.pem'),   // 私钥文件路径
    //   cert: fs.readFileSync('C:/Users/zilong/Desktop/angerdream21.top/cert.pem'), // 证书文件路径
    // },
    strictPort: true,
    allowedHosts: true  // 允许所有主机访问（开发环境）

  },
  plugins: [
    vue(),
    vueJsx(),
    // vueDevTools(),
    Components({
      resolvers: [VantResolver()],
      dts: true,  // 生成类型声明文件，方便 TS 识别
  dirs: ['src/components'],  // 自动导入你自定义的组件
    })
  ],
  base:'./',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
})
