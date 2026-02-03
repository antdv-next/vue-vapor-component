import { defineProject, mergeConfig } from 'vitest/config'
import { commonConfig } from '../../scripts/vitestCommonConfig'

export default mergeConfig(
  commonConfig(),
  defineProject({
    test: {
      environment: 'jsdom',
    },
  }),
)
