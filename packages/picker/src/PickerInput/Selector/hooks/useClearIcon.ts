import type { VueNode } from '@v-c/util/dist/type'
import { warning } from '@v-c/util'

/**
 * Resolve the clear-icon node.
 *
 * Returns a bare tag string instead of `h('span', ...)`: a vdom `VNode` cannot
 * be rendered in vapor without `vaporInteropPlugin`. `ClearIcon.vue` turns this
 * marker back into `<span class="{-clear-btn}">`, whose `×` is drawn by CSS.
 * 解析清除图标节点。
 *
 * 返回标签字符串而非 `h('span', ...)`：vdom 的 `VNode` 在 vapor 下无法渲染
 * （需要 `vaporInteropPlugin`）。`ClearIcon.vue` 会把这个标记还原成
 * `<span class="{-clear-btn}">`，其中的 `×` 由 CSS 绘制。
 */
export function fillClearIcon(
  allowClear?: boolean | { clearIcon?: VueNode },
  clearIcon?: VueNode,
): VueNode {
  if (process.env.NODE_ENV !== 'production' && clearIcon) {
    warning(false, '`clearIcon` will be removed in future. Please use `allowClear` instead.')
  }

  // Vapor note (skill rule 7/28): `allowClear?: boolean | {...}` makes vapor
  // coerce an unpassed `undefined` into `false`, so `=== false` cannot
  // distinguish "explicitly disabled" from "not passed". We keep the guard
  // anyway — an unpassed `allowClear` therefore means "no clear button", which
  // matches Ant Design's own default. Callers must opt in with
  // `:allow-clear="true"`.
  // vapor 会把缺省的 `allowClear`（`boolean | {...}`）强制成 `false`，因此
  // `=== false` 无法区分"显式禁用"和"未传入"。这里仍保留该判断：未传
  // `allowClear` 即"不显示清除按钮"，与 Ant Design 默认一致；调用方需用
  // `:allow-clear="true"` 显式开启。
  if (allowClear === false) {
    return null
  }

  const config = allowClear && typeof allowClear === 'object' ? allowClear : {}

  return config.clearIcon || clearIcon || 'span'
}
