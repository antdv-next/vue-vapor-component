<script setup vapor lang="ts">
  import type { Ref } from 'vue'

  import type { CollapseProps, Key } from './interface'

  import { clsx } from '@v-c/util'
  import useMergedState from '@v-c/util/dist/hooks/useMergedState'
  import omit from '@v-c/util/dist/omit'
  import pickAttrs from '@v-c/util/dist/pickAttrs'
  import { computed, ref, toRef, useAttrs } from 'vue'

  import { provideCollapseContext } from './context'
  import Panel from './Panel.vue'

  defineOptions({ name: 'VcCollapse', inheritAttrs: false })

  const props = withDefaults(defineProps<CollapseProps>(), {
    prefixCls: 'vc-collapse',
  })

  const attrs = useAttrs()
  const refWrapper = ref<HTMLDivElement>()

  function getActiveKeysArray(activeKey: Key | Key[]) {
    let current = activeKey
    if (!Array.isArray(current)) {
      const t = typeof current
      current =
        t === 'number' || t === 'string' || t === 'bigint' ? [current] : []
    }
    return current.map(key => String(key))
  }

  const [activeKey, setActiveKey] = useMergedState<Key | Key[], Ref<Key[]>>(
    [],
    {
      value: toRef(props, 'activeKey') as Ref<Key | Key[]>,
      onChange: v => props.onChange?.(v as Key[]),
      defaultValue: props.defaultActiveKey,
      postState: getActiveKeysArray,
    },
  )

  function getActiveKey(key: Key) {
    const k = String(key)
    if (props.accordion) {
      return activeKey.value[0] === k ? [] : [k]
    }
    const index = activeKey.value.indexOf(k)
    if (index > -1) {
      return activeKey.value.filter(item => item !== k)
    }
    return [...activeKey.value, k]
  }

  function onItemClick(key: Key) {
    setActiveKey(getActiveKey(key))
  }

  provideCollapseContext({
    get prefixCls() {
      return props.prefixCls ?? 'vc-collapse'
    },
    get activeKeys() {
      return activeKey.value as Key[]
    },
    get accordion() {
      return props.accordion
    },
    get collapsible() {
      return props.collapsible
    },
    get openMotion() {
      return props.openMotion
    },
    get destroyOnHidden() {
      return props.destroyOnHidden
    },
    get expandIcon() {
      return props.expandIcon
    },
    get classNames() {
      return props.classNames
    },
    get styles() {
      return props.styles
    },
    onItemClick,
  })

  defineExpose({ ref: refWrapper })

  // ===== items -> Panel configs (replaces useItems/convertItemsToNodes) =====
  const panels = computed(() =>
    (props.items ?? []).map((item, index) => {
      const { label, key, ref: _ref, ...rest } = item
      const panelKey = String(key ?? index)
      return { panelKey, bind: { ...rest, panelKey, header: label } }
    }),
  )

  const collapseCls = computed(() => clsx(props.prefixCls, attrs.class as any))
  const pickedAttrs = computed(() =>
    pickAttrs(omit(attrs, ['class', 'style']), { aria: true, data: true }),
  )
</script>

<template>
  <div
    ref="refWrapper"
    :class="collapseCls"
    :style="attrs.style"
    :role="accordion ? 'tablist' : undefined"
    v-bind="pickedAttrs"
  >
    <Panel v-for="p in panels" :key="p.panelKey" v-bind="p.bind" />
    <slot></slot>
  </div>
</template>
