import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTaskStore } from '../store/taskStore'
import { getForgettingCurveData, formatDate } from '../utils/ebbinghaus'
import { BarChart2, TrendingUp, Flame } from 'lucide-react'

const CHART_TEXT_COLOR = 'rgba(38, 37, 30, 0.55)'
const BORDER_COLOR = 'rgba(38, 37, 30, 0.1)'

export default function DataAnalytics() {
  const { tasks, dailyLogs, streak } = useTaskStore()

  const mastered = tasks.filter((t) => t.status === 'mastered').length
  const reviewing = tasks.filter((t) => t.status === 'reviewing').length
  const learning = tasks.filter((t) => t.status === 'learning').length
  const total = tasks.length
  const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0

  // ── Memory Curve ──
  const forgettingCurveOption = useMemo(() => {
    const data = getForgettingCurveData()
    return {
      backgroundColor: 'transparent',
      title: {
        text: '记忆曲线',
        left: 'left',
        textStyle: { fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
        top: 8,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 12 },
        formatter: (params: any[]) => {
          const day = params[0].name.replace('第', '').replace('天', '')
          return `${day}天后<br/>` +
            params.map((p) => `<span style="color:${p.color}">${p.seriesName}: ${p.value}%</span>`).join('<br/>')
        },
      },
      legend: {
        data: ['无复习', '有复习'],
        bottom: 4,
        textStyle: { fontSize: 11, color: CHART_TEXT_COLOR },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: { left: 44, right: 16, top: 44, bottom: 44 },
      xAxis: {
        type: 'category',
        data: data.filter((_, i) => i % 5 === 0).map((d) => `第${d.day}天`),
        axisLine: { lineStyle: { color: BORDER_COLOR } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: BORDER_COLOR, type: 'dashed' } },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      series: [
        {
          name: '无复习',
          type: 'line',
          data: data.filter((_, i) => i % 5 === 0).map((d) => d.without),
          smooth: 0.6,
          color: '#cf2d56',
          lineStyle: { type: 'dashed', width: 1.5 },
          symbol: 'none',
        },
        {
          name: '有复习',
          type: 'line',
          data: data.filter((_, i) => i % 5 === 0).map((d) => d.with),
          smooth: 0.6,
          color: '#1f8a65',
          lineStyle: { width: 1.5 },
          symbol: 'none',
        },
      ],
    }
  }, [])

  // ── Mastery Distribution ──
  const masteryOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      title: {
        text: '掌握度分布',
        left: 'left',
        textStyle: {
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
        },
        top: 8,
      },
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 12 },
      },
      legend: { show: false },
      grid: { left: 0, right: 0, top: 44, bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['42%', '72%'],
          center: ['50%', '55%'],
          avoidLabelOverlap: false,
          itemStyle: { borderRadius: 4, borderColor: 'var(--color-cream)', borderWidth: 2 },
          label: { show: false },
          emphasis: {
            label: { show: true, fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
          },
          data: [
            { value: learning, name: '新学', itemStyle: { color: '#9fbbe0' } },
            { value: reviewing, name: '复习中', itemStyle: { color: '#dfa88f' } },
            { value: mastered, name: '已掌握', itemStyle: { color: '#1f8a65' } },
          ].filter((d) => d.value > 0),
          labelLine: { show: false },
        },
      ],
    }
  }, [learning, reviewing, mastered])

  // ── Heatmap ──
  const heatmapOption = useMemo(() => {
    const today = new Date()
    const weeks = 12
    const data: [number, number, number][] = []

    for (let w = weeks - 1; w >= 0; w--) {
      for (let d = 0; d < 7; d++) {
        const date = new Date(today)
        date.setDate(date.getDate() - (w * 7 + (6 - d)))
        const dateStr = formatDate(date)
        const log = dailyLogs.find((l) => l.date === dateStr)
        data.push([w, d, log?.count ?? 0])
      }
    }

    const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
    const maxVal = Math.max(5, ...dailyLogs.map((l) => l.count))

    return {
      backgroundColor: 'transparent',
      title: {
        text: '打卡热力图（近12周）',
        left: 'left',
        textStyle: {
          fontFamily: 'var(--font-display)',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--text-primary)',
        },
        top: 8,
      },
      tooltip: {
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: any) => {
          const [w, d] = params.data
          const date = new Date()
          date.setDate(date.getDate() - ((weeks - 1 - w) * 7 + (6 - d)))
          return `${date.toLocaleDateString('zh-CN')}：${params.data[2]} 个任务`
        },
      },
      grid: { left: 28, right: 10, top: 44, bottom: 28 },
      xAxis: {
        type: 'category',
        data: Array.from({ length: weeks }, (_, i) => `W${i + 1}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 9, color: CHART_TEXT_COLOR },
        splitArea: { show: false },
      },
      yAxis: {
        type: 'category',
        data: dayLabels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 9, color: CHART_TEXT_COLOR },
        splitArea: { show: false },
      },
      visualMap: {
        min: 0,
        max: maxVal,
        calculable: false,
        show: false,
        inRange: {
          color: ['#e6e5e0', '#c6e48b', '#7bc96f', '#239a3b', '#196127'],
        },
      },
      series: [
        {
          type: 'heatmap',
          data: data,
          itemStyle: { borderRadius: 2, borderColor: 'var(--color-cream)', borderWidth: 1 },
          emphasis: { itemStyle: { shadowBlur: 5, shadowColor: 'rgba(0,0,0,0.2)' } },
        },
      ],
    }
  }, [dailyLogs])

  const metrics = [
    {
      label: '掌握率',
      value: `${masteryRate}%`,
      icon: TrendingUp,
      color: 'var(--color-success)',
    },
    { label: '累计学习', value: String(total), icon: BarChart2, color: 'var(--text-primary)' },
    { label: '连续天数', value: String(streak), icon: Flame, color: 'var(--color-gold)' },
  ]

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '16px',
        paddingBottom: '24px',
      }}
    >
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {metrics.map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            style={{
              background: 'var(--color-surface-400)',
              border: '1px solid var(--border-soft)',
              borderRadius: 'var(--radius-lg)',
              padding: '14px 8px',
              textAlign: 'center',
            }}
          >
            <Icon size={16} strokeWidth={2} style={{ color, marginBottom: '6px' }} />
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.25rem',
                fontWeight: 700,
                color,
                lineHeight: 1,
                marginBottom: '4px',
              }}
            >
              {value}
            </div>
            <div
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '0.6875rem',
                fontWeight: 500,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Memory Curve */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          记忆曲线
        </p>
        <div
          style={{
            background: 'var(--color-surface-400)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 8px 8px',
          }}
        >
          <ReactECharts option={forgettingCurveOption} style={{ height: 240 }} />
        </div>
      </div>

      {/* Mastery Distribution */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          掌握度分布
        </p>
        <div
          style={{
            background: 'var(--color-surface-400)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 8px 8px',
          }}
        >
          <ReactECharts option={masteryOption} style={{ height: 220 }} />
        </div>
      </div>

      {/* Heatmap */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: 0 }}>
          打卡热力图
        </p>
        <div
          style={{
            background: 'var(--color-surface-400)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '16px 8px 8px',
          }}
        >
          <ReactECharts option={heatmapOption} style={{ height: 200 }} />
        </div>
      </div>
    </div>
  )
}
