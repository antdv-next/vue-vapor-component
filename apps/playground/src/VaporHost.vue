<script setup vapor lang="ts">
  import VaporIntro from './components/VaporIntro.vue'
  import CheckboxBasic from './demos/vapor/checkbox/basic.vue'
  import CollapseBasic from './demos/vapor/collapse/basic.vue'
  import DialogBasic from './demos/vapor/dialog/basic.vue'
  import DrawerBasic from './demos/vapor/drawer/basic.vue'
  import ImageBasic from './demos/vapor/image/basic.vue'
  import InputNumberBasic from './demos/vapor/input-number/basic.vue'
  import InputBasic from './demos/vapor/input/basic.vue'
  import MutateObserverBasic from './demos/vapor/mutate-observer/basic.vue'
  import OverflowBasic from './demos/vapor/overflow/basic.vue'
  import PaginationBasic from './demos/vapor/pagination/basic.vue'
  import PortalBasic from './demos/vapor/portal/basic.vue'
  import ProgressBasic from './demos/vapor/progress/basic.vue'
  import QRCodeBasic from './demos/vapor/qrcode/basic.vue'
  import RateBasic from './demos/vapor/rate/basic.vue'
  import ResizeObserverBasic from './demos/vapor/resize-observer/basic.vue'
  import SegmentedBasic from './demos/vapor/segmented/basic.vue'
  import SlickBasic from './demos/vapor/slick/basic.vue'
  import SliderBasic from './demos/vapor/slider/basic.vue'
  import TourBasic from './demos/vapor/tour/basic.vue'
  import StepsBasic from './demos/vapor/steps/basic.vue'
  import SwitchBasic from './demos/vapor/switch/basic.vue'
  import TextAreaBasic from './demos/vapor/textarea/basic.vue'
  import TooltipBasic from './demos/vapor/tooltip/basic.vue'
  import TriggerBasic from './demos/vapor/trigger/basic.vue'
  import UploadBasic from './demos/vapor/upload/basic.vue'
  import NotificationBasic from './demos/vapor/notification/basic.vue'
  import VirtualListBasic from './demos/vapor/virtual-list/basic.vue'
  import ListyBasic from './demos/vapor/listy/basic.vue'
  import { currentComponent, currentCase } from './shared'
</script>

<template>
  <div class="vapor-host">
    <VaporIntro v-if="!currentComponent" />
    <template v-else>
      <h4 class="vapor-title">
        vapor mode — {{ currentComponent }} / {{ currentCase }}
      </h4>

      <StepsBasic
        v-if="currentComponent === 'steps' && currentCase === 'basic'"
      />
      <CheckboxBasic
        v-if="currentComponent === 'checkbox' && currentCase === 'basic'"
      />
      <SwitchBasic
        v-if="currentComponent === 'switch' && currentCase === 'basic'"
      />
      <InputBasic
        v-if="currentComponent === 'input' && currentCase === 'basic'"
      />
      <InputNumberBasic
        v-if="currentComponent === 'input-number' && currentCase === 'basic'"
      />
      <TextAreaBasic
        v-if="currentComponent === 'textarea' && currentCase === 'basic'"
      />
      <RateBasic
        v-if="currentComponent === 'rate' && currentCase === 'basic'"
      />
      <SegmentedBasic
        v-if="currentComponent === 'segmented' && currentCase === 'basic'"
      />
      <ProgressBasic
        v-if="currentComponent === 'progress' && currentCase === 'basic'"
      />
      <PaginationBasic
        v-if="currentComponent === 'pagination' && currentCase === 'basic'"
      />
      <QRCodeBasic
        v-if="currentComponent === 'qrcode' && currentCase === 'basic'"
      />
      <ImageBasic
        v-if="currentComponent === 'image' && currentCase === 'basic'"
      />
      <CollapseBasic
        v-if="currentComponent === 'collapse' && currentCase === 'basic'"
      />
      <DialogBasic
        v-if="currentComponent === 'dialog' && currentCase === 'basic'"
      />
      <DrawerBasic
        v-if="currentComponent === 'drawer' && currentCase === 'basic'"
      />
      <OverflowBasic
        v-if="currentComponent === 'overflow' && currentCase === 'basic'"
      />
      <PortalBasic
        v-if="currentComponent === 'portal' && currentCase === 'basic'"
      />
      <ResizeObserverBasic
        v-if="currentComponent === 'resize-observer' && currentCase === 'basic'"
      />
      <MutateObserverBasic
        v-if="currentComponent === 'mutate-observer' && currentCase === 'basic'"
      />
      <UploadBasic
        v-if="currentComponent === 'upload' && currentCase === 'basic'"
      />
      <TriggerBasic
        v-if="currentComponent === 'trigger' && currentCase === 'basic'"
      />
      <TooltipBasic
        v-if="currentComponent === 'tooltip' && currentCase === 'basic'"
      />
      <NotificationBasic
        v-if="currentComponent === 'notification' && currentCase === 'basic'"
      />
      <SlickBasic
        v-if="currentComponent === 'slick' && currentCase === 'basic'"
      />
      <SliderBasic
        v-if="currentComponent === 'slider' && currentCase === 'basic'"
      />
      <TourBasic
        v-if="currentComponent === 'tour' && currentCase === 'basic'"
      />
      <VirtualListBasic
        v-if="currentComponent === 'virtual-list' && currentCase === 'basic'"
      />
      <ListyBasic
        v-if="currentComponent === 'listy' && currentCase === 'basic'"
      />
    </template>
  </div>
</template>

<style scoped>
  .vapor-host {
    height: 100vh;
    padding: 16px;
    overflow-y: auto;
  }
  .vapor-title {
    margin: 0 0 16px 0;
    font-size: 14px;
    color: #666;
  }
</style>
