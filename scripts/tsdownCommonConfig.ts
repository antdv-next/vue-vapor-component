import Vue from 'unplugin-vue/rolldown'

// 库构建工具 tsdown 配置
export function commonConfig(): any {
  return {
    platform: 'neutral', // 运行平台：node | browser | neutral，前两个见名知意，neutral 与平台无关的目标，不对特定运行时环境做假设
    plugins: [Vue({ isProduction: true })],
    dts: { vue: true }, // 生成 dts 申明文件，需安装 typescript 依赖
    format: {
      esm: {
        target: ['es2015'],
      },
      cjs: {
        target: ['node20'],
      },
    },
  }
}
