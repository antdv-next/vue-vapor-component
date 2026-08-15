<script setup lang="ts">
  import { ref } from 'vue'
  import { useRouter } from 'vue-router'

  import { useParticleCanvas } from '@/composables/useParticleCanvas'
  import { demoManifest } from '@/routes'

  const router = useRouter()
  const total = demoManifest.length
  const canvasRef = ref<HTMLCanvasElement | null>(null)
  useParticleCanvas(canvasRef)

  function onStart() {
    router.push('/steps/basic')
  }
</script>

<template>
  <div class="home">
    <canvas ref="canvasRef" class="bg-canvas" />
    <div class="content">
      <div class="badge">Mix Mode</div>
      <h1 class="title">
        <span class="gradient">vue-vapor-component</span>
      </h1>
      <p class="subtitle">VDOM + Vapor 混合模式</p>

      <div class="stats">
        <div class="stat">
          <span class="num">{{ total }}</span>
          <span class="label">Components</span>
        </div>
        <div class="divider" />
        <div class="stat">
          <span class="num">2</span>
          <span class="label">Runtime Modes</span>
        </div>
        <div class="divider" />
        <div class="stat">
          <span class="num">vapor</span>
          <span class="label">Compilation</span>
        </div>
      </div>

      <div class="card card-left">
        <h3 class="card-title">
          <svg class="card-icon" viewBox="0 0 128 128">
            <path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z"></path>
            <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z"></path>
          </svg>
          混合模式优势
        </h3>
        <ul class="card-list">
          <li><span class="dot" />vdom + vaporInteropPlugin 无缝共存</li>
          <li><span class="dot" />已有 vdom 项目可渐进迁移</li>
          <li><span class="dot" />第三方组件库直接复用</li>
          <li><span class="dot" />开发期享受完整 Vue 生态</li>
        </ul>
      </div>

      <div class="actions">
        <button class="btn primary" @click="onStart">
          <svg class="icon" viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
          开始体验
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .home {
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

  .stats {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24px;
    margin-bottom: 24px;
  }

  .stat {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .num {
    font-size: 28px;
    font-weight: 700;
    color: #fff;
    font-variant-numeric: tabular-nums;
  }

  .label {
    font-size: 12px;
    color: #888;
    letter-spacing: 1px;
  }

  .divider {
    width: 1px;
    height: 32px;
    background: rgba(255, 255, 255, 0.1);
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

  .card-left .card-title {
    color: #69b1ff;
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

  .card-left .dot {
    background: #69b1ff;
  }

  .actions .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 24px;
    border-radius: 8px;
    border: none;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn.primary {
    color: #fff;
    background: linear-gradient(135deg, #1890ff, #6f42c1);
    box-shadow: 0 4px 16px rgba(24, 144, 255, 0.3);
  }

  .btn.primary:hover {
    box-shadow: 0 6px 24px rgba(24, 144, 255, 0.5);
    transform: translateY(-2px);
  }

  .icon {
    width: 14px;
    height: 14px;
  }
</style>
