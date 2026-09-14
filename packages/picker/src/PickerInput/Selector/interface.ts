import type { Ref } from 'vue'

/**
 * A range selector's `id` may be a single string or a per-field pair.
 * RangeSelector 的 `id` 可以是单个字符串，也可以是起/止字段各自的 id。
 */
export type SelectorIdType = string | { start?: string, end?: string }

/**
 * The object a parent receives back from a template ref on `<Input>`.
 * `Input` exposes the `useTemplateRef` refs themselves (repo convention, see
 * `packages/checkbox/src/Checkbox.vue`), so each field needs a second `.value`
 * read to reach the raw DOM node.
 * `<Input>` 模板 ref 返回的对象。`Input` 直接暴露 `useTemplateRef` 的 ref
 * （仓库约定，见 `packages/checkbox/src/Checkbox.vue`），因此需要再读一层
 * `.value` 才能拿到真实的 DOM 节点。
 */
export interface InputRef {
  nativeElement: Ref<HTMLDivElement | undefined>
  inputElement: Ref<HTMLInputElement | undefined>
  focus: (options?: FocusOptions) => void
  blur: () => void
}
