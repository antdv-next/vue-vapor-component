<script setup vapor lang="ts">
  import { ref } from 'vue'

  import { useParticleCanvas } from '@/composables/useParticleCanvas'

  defineOptions({ name: 'VaporIntro' })

  const canvasRef = ref<HTMLCanvasElement | null>(null)
  useParticleCanvas(canvasRef)
</script>

<template>
  <div class="vapor-intro">
    <canvas ref="canvasRef" class="bg-canvas" />
    <div class="content">
      <div class="badge">Vapor Mode · Zero-vdom</div>
      <h1 class="title">
        <span class="gradient">vue-vapor-component</span>
      </h1>
      <p class="subtitle">Vapor Mode 无虚拟 DOM模式</p>

      <div class="card card-right">
        <h3 class="card-title">
          <svg class="card-icon" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09Z"
            />
          </svg>
          Vapor 模式优势
        </h3>
        <ul class="card-list">
          <li><span class="dot" />零虚拟 DOM，运行时体积更小</li>
          <li><span class="dot" />编译期生成原生 DOM 操作</li>
          <li><span class="dot" />渲染性能显著提升</li>
          <li><span class="dot" />纯 vapor 组件 bundle 最小化</li>
        </ul>
      </div>

      <p class="hint">← 左侧 Home 页展示对应组件，即时对比双模式效果</p>
    </div>
  </div>
</template>

<style scoped>
  .vapor-intro {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    background:
      radial-gradient(
        ellipse at 20% 20%,
        rgba(24, 144, 255, 0.08),
        transparent 50%
      ),
      radial-gradient(
        ellipse at 80% 80%,
        rgba(102, 16, 242, 0.08),
        transparent 50%
      ),
      #0a0a0a;
  }

  .bg-canvas {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }

  .content {
    position: relative;
    z-index: 1;
    text-align: center;
    width: 100%;
  }

  .badge {
    display: inline-block;
    padding: 4px 14px;
    border-radius: 100px;
    border: 1px solid rgba(24, 144, 255, 0.4);
    background: rgba(24, 144, 255, 0.08);
    color: #69b1ff;
    font-size: 12px;
    letter-spacing: 1px;
    margin-bottom: 20px;
  }

  .title {
    font-size: 34px;
    font-weight: 700;
    margin: 0 0 12px 0;
  }

  .gradient {
    background: linear-gradient(135deg, #1890ff 0%, #69b1ff 50%, #6f42c1 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .subtitle {
    color: #666;
    font-size: 13px;
    letter-spacing: 2px;
    margin: 0 0 24px 0;
  }

  .card {
    text-align: left;
    padding: 18px 16px;
    margin-bottom: 24px;
    max-width: 360px;
    margin-left: auto;
    margin-right: auto;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .card-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 12px 0;
    font-size: 14px;
    font-weight: 600;
  }

  .card-right .card-title {
    color: #b37feb;
  }

  .card-icon {
    width: 14px;
    height: 14px;
  }

  .card-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .card-list li {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 4px 0;
    font-size: 12px;
    color: #999;
    line-height: 1.5;
  }

  .dot {
    flex-shrink: 0;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    margin-top: 6px;
  }

  .card-right .dot {
    background: #b37feb;
  }

  .hint {
    color: #888;
    font-size: 13px;
    margin: 0;
  }
</style>
