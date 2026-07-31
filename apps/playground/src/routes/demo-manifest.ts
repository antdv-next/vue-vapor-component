import type { RouteRecordRaw } from 'vue-router'

export interface DemoCase {
  name: string
  label: string
}

export interface DemoGroup {
  component: string
  label: string
  cases: DemoCase[]
}

export const demoManifest: DemoGroup[] = [
  {
    component: 'steps',
    label: 'Steps',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'checkbox',
    label: 'Checkbox',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'switch',
    label: 'Switch',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'input',
    label: 'Input',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'input-number',
    label: 'InputNumber',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'textarea',
    label: 'TextArea',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'rate',
    label: 'Rate',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'segmented',
    label: 'Segmented',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'progress',
    label: 'Progress',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'pagination',
    label: 'Pagination',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'qrcode',
    label: 'QRCode',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'image',
    label: 'Image',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'collapse',
    label: 'Collapse',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'dialog',
    label: 'Dialog',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'drawer',
    label: 'Drawer',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'overflow',
    label: 'Overflow',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'portal',
    label: 'Portal',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'resize-observer',
    label: 'ResizeObserver',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'mutate-observer',
    label: 'MutateObserver',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'upload',
    label: 'Upload',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'trigger',
    label: 'Trigger',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'tooltip',
    label: 'Tooltip',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
  {
    component: 'notification',
    label: 'Notification',
    cases: [{ name: 'basic', label: 'Basic' }],
  },
]

// Auto-generate routes from demoManifest: /<component>/<case>
const demoRoutes: RouteRecordRaw[] = demoManifest.flatMap(
  ({ component, cases }) =>
    cases.map(caseItem => ({
      path: `/${component}/${caseItem.name}`,
      component: () =>
        import(`../demos/vdom/${component}/${caseItem.name}.vue`),
    })),
)

// Single-case components: /<component> redirects to /<component>/basic
const singleCaseRedirects: RouteRecordRaw[] = demoManifest
  .filter(item => item.cases.length === 1)
  .map(item => ({
    path: `/${item.component}`,
    redirect: `/${item.component}/${item.cases[0].name}`,
  }))

export const allRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('../components/Home.vue'),
  },
  ...demoRoutes,
  ...singleCaseRedirects,
]
