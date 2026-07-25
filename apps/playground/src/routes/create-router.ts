import { createRouter as _createRouter, createWebHashHistory } from 'vue-router'

import { currentComponent, currentCase } from '../shared'
import { allRoutes } from './demo-manifest'

export function createRouter() {
  const router = _createRouter({
    history: createWebHashHistory('/vue-vapor-component/'),
    routes: allRoutes,
  })

  router.afterEach(to => {
    const [, component, caseName] = to.path.split('/')
    if (component) {
      currentComponent.value = component
      currentCase.value = caseName
    } else {
      currentComponent.value = ''
      currentCase.value = ''
    }
  })

  return router
}
