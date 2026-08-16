<script setup vapor lang="ts">
  import useNotification from '@vapor-component/notification'

  import '@/styles/notification.less'

  const { api, ContextHolder, configRef, onReady } = useNotification({
    duration: 5,
    placement: 'topRight',
  })
</script>

<template>
  <div class="notification-demo">
    <h4>Notification (Vapor)</h4>

    <div class="demo-actions">
      <button
        @click="
          api.open({
            title: 'Notification',
            description: 'This is a basic notification message.',
            closable: true,
          })
        "
      >
        Open Notification
      </button>

      <button
        @click="
          api.open({
            title: 'Bottom Left',
            description: 'This notification appears at bottom-left.',
            placement: 'bottomLeft',
            duration: 3,
            closable: true,
          })
        "
      >
        Bottom Left
      </button>

      <button
        @click="
          api.open({
            title: 'Never Auto-Close',
            description: 'This notification will not close automatically.',
            placement: 'topLeft',
            duration: false,
            closable: true,
          })
        "
      >
        No Auto-Close
      </button>

      <button
        @click="
          api.open({
            title: 'With Progress',
            description: 'This notification shows a progress bar.',
            showProgress: true,
            closable: true,
          })
        "
      >
        Show Progress
      </button>
    </div>

    <ContextHolder :config="configRef" @ready="onReady" />
  </div>
</template>

<style scoped>
  .notification-demo {
    padding: 16px;
  }
  .demo-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .demo-actions button {
    padding: 6px 16px;
    border: 1px solid #111;
    border-radius: 4px;
    background: #fff;
    cursor: pointer;
    font-size: 14px;
  }
  .demo-actions button:hover {
    background: #f4f9ff;
  }
</style>
