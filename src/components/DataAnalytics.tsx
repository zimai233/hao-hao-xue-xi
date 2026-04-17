import { useMemo } from 'react'
import ReactECharts from 'echarts-for-react'
import { useTaskStore } from '../store/taskStore'
import { formatDate, getFutureReviewDates, getDaysUntil, getForgettingCurveData } from '../utils/ebbinghaus'
import { TrendingUp, Flame, Brain } from 'lucide-react'

const CHART_TEXT_COLOR = 'rgba(38, 37, 30, 0.55)'
const BORDER_COLOR = 'rgba(38, 37, 30, 0.1)'

export default function DataAnalytics() {
  const { tasks, dailyLogs, streak } = useTaskStore()

  const mastered = tasks.filter((t) => t.status === 'mastered').length
  const reviewing = tasks.filter((t) => t.status === 'reviewing').length
  const learning = tasks.filter((t) => t.status === 'learning').length
  const total = tasks.length
  const masteryRate = total > 0 ? Math.round((mastered / total) * 100) : 0

  const today = formatDate(new Date())

  // ── 复习日历：未来30天待复习数量 ──
  const reviewCalendarOption = useMemo(() => {
    const next30Days: { date: string; count: number; day: number }[] = []
    for (let i = 0; i < 30; i++) {
      const d = new Date()
      d.setDate(d.getDate() + i)
      const dateStr = formatDate(d)
      next30Days.push({ date: dateStr, count: 0, day: i })
    }

    // 统计每个任务未来的复习日期
    tasks.forEach((task) => {
      if (task.status === 'mastered') return
      // 从今天开始的未来复习日期
      const futureDates = getFutureReviewDates(task.nextReview, 1, task.intensity, 8)
      futureDates.forEach((dateStr) => {
        const idx = next30Days.findIndex((d) => d.date === dateStr)
        if (idx !== -1) {
          next30Days[idx].count++
        }
      })
      // 如果下次复习在30天内且今天或之前
      const daysUntil = getDaysUntil(task.nextReview)
      if (daysUntil >= 0 && daysUntil < 30 && task.lastCheckIn !== today) {
        const idx = next30Days.findIndex((d) => d.date === task.nextReview)
        if (idx !== -1) next30Days[idx].count++
      }
    })

    const weekdays = ['一', '二', '三', '四', '五', '六', '日']
    const maxCount = Math.max(5, ...next30Days.map((d) => d.count))

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: any) => {
          const idx = params.dataIndex
          const dayData = next30Days[idx]
          if (!dayData) return ''
          const date = new Date()
          date.setDate(date.getDate() + dayData.day)
          const dateStr = `${date.getMonth() + 1}/${date.getDate()}`
          return `${dateStr}<br/>待复习: <b>${dayData.count}</b> 个任务`
        },
      },
      grid: { left: 32, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: 'category',
        data: weekdays,
        axisLine: { lineStyle: { color: BORDER_COLOR } },
        axisTick: { show: false },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      yAxis: {
        type: 'value',
        min: 0,
        max: maxCount,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: BORDER_COLOR, type: 'dashed' } },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      series: [
        {
          type: 'bar',
          data: next30Days.slice(0, 28).map((d) => d.count),
          itemStyle: {
            color: (params: any) => {
              const val = params.value
              if (val === 0) return 'rgba(38, 37, 30, 0.08)'
              if (val <= 2) return 'rgba(31, 138, 101, 0.5)'
              if (val <= 4) return 'rgba(31, 138, 101, 0.75)'
              return '#1f8a65'
            },
            borderRadius: [3, 3, 0, 0],
          },
          barWidth: '60%',
        },
      ],
    }
  }, [tasks, today])

  // ── 记忆曲线 ──
  const forgettingCurveOption = useMemo(() => {
    const data = getForgettingCurveData()
    return {
      backgroundColor: 'transparent',
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
        textStyle: { fontSize: 10, color: CHART_TEXT_COLOR },
        icon: 'circle',
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: { left: 36, right: 16, top: 16, bottom: 40 },
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

  // ── 学习进度：环形进度 ──
  const progressOption = useMemo(() => {
    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: '{b}: {c} ({d}%)',
      },
      legend: { show: false },
      grid: { left: 0, right: 0, top: 8, bottom: 0 },
      series: [
        {
          type: 'pie',
          radius: ['55%', '80%'],
          center: ['50%', '58%'],
          avoidLabelOverlap: true,
          startAngle: 90,
          itemStyle: { borderRadius: 4, borderColor: 'var(--color-cream)', borderWidth: 2 },
          label: {
            show: true,
            position: 'center',
            formatter: () => `{val|${masteryRate}%}\n{sub|掌握率}`,
            rich: {
              val: { fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' },
              sub: { fontSize: 11, color: CHART_TEXT_COLOR, fontFamily: 'var(--font-display)' },
            },
          },
          labelLine: { show: false },
          data: [
            { value: mastered, name: '已掌握', itemStyle: { color: '#1f8a65' } },
            { value: reviewing, name: '复习中', itemStyle: { color: '#c08532' } },
            { value: learning, name: '新学', itemStyle: { color: '#9fbbe0' } },
          ].filter((d) => d.value > 0),
        },
      ],
    }
  }, [mastered, reviewing, learning, masteryRate])

  // ── 打卡趋势：近14天 ──
  const trendOption = useMemo(() => {
    const days = 14
    const data: { date: string; count: number; label: string }[] = []
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      const dateStr = formatDate(d)
      const log = dailyLogs.find((l) => l.date === dateStr)
      const dayStr = `${d.getMonth() + 1}/${d.getDate()}`
      data.push({ date: dateStr, count: log?.count ?? 0, label: dayStr })
    }

    const avgCount = dailyLogs.length > 0
      ? Math.round(dailyLogs.reduce((sum, l) => sum + l.count, 0) / dailyLogs.length)
      : 0

    return {
      backgroundColor: 'transparent',
      tooltip: {
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: any) => `${params.name}<br/>打卡: <b>${params.value}</b> 个任务`,
      },
      grid: { left: 32, right: 16, top: 16, bottom: 28 },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.label),
        axisLine: { lineStyle: { color: BORDER_COLOR } },
        axisTick: { show: false },
        axisLabel: {
          fontSize: 9,
          color: CHART_TEXT_COLOR,
          interval: Math.floor(days / 7),
        },
      },
      yAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: BORDER_COLOR, type: 'dashed' } },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.count),
          itemStyle: {
            color: (params: any) => {
              const idx = params.dataIndex
              const isToday = idx === data.length - 1
              return isToday ? '#f54e00' : 'rgba(38, 37, 30, 0.35)'
            },
            borderRadius: [3, 3, 0, 0],
          },
          barWidth: '55%',
          markLine: avgCount > 0 ? {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#c08532', type: 'dashed', width: 1 },
            data: [{ yAxis: avgCount }],
            label: { formatter: `均值 ${avgCount}`, position: 'end', fontSize: 9, color: '#c08532' },
          } : undefined,
        },
      ],
    }
  }, [dailyLogs])

  // ── 打卡热力图 ──
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
      grid: { left: 28, right: 10, top: 8, bottom: 24 },
      xAxis: {
        type: 'category',
        data: Array.from({ length: weeks }, (_, i) => `W${i + 1}`),
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 8, color: CHART_TEXT_COLOR },
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

  // ── 状态分布 ──
  const statusOption = useMemo(() => {
    const labels = ['新学', '复习中', '已掌握']
    const values = [learning, reviewing, mastered]
    const colors = ['#9fbbe0', '#c08532', '#1f8a65']

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'var(--color-dark)',
        borderColor: 'var(--color-dark)',
        textStyle: { color: '#fff', fontSize: 11 },
        formatter: (params: any[]) => {
          const total = values.reduce((a, b) => a + b, 0)
          return params.map((p) => `${p.marker} ${p.name}: ${p.value} (${total > 0 ? Math.round(p.value / total * 100) : 0}%)`).join('<br/>')
        },
      },
      grid: { left: 48, right: 24, top: 16, bottom: 28 },
      xAxis: {
        type: 'value',
        min: 0,
        axisLine: { show: false },
        axisTick: { show: false },
        splitLine: { lineStyle: { color: BORDER_COLOR, type: 'dashed' } },
        axisLabel: { fontSize: 10, color: CHART_TEXT_COLOR },
      },
      yAxis: {
        type: 'category',
        data: labels,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { fontSize: 11, color: CHART_TEXT_COLOR },
      },
      series: [
        {
          type: 'bar',
          data: values,
          itemStyle: {
            color: (params: any) => colors[params.dataIndex],
            borderRadius: [0, 4, 4, 0],
          },
          barWidth: '50%',
          label: {
            show: true,
            position: 'right',
            fontSize: 11,
            color: CHART_TEXT_COLOR,
            formatter: '{c}',
          },
        },
      ],
    }
  }, [learning, reviewing, mastered])

  const metrics = [
    {
      label: '掌握率',
      value: `${masteryRate}%`,
      icon: Brain,
      color: 'var(--color-success)',
      sub: `已掌握 ${mastered} 个`,
    },
    { label: '总目标', value: String(total), icon: TrendingUp, color: 'var(--text-primary)', sub: `新学 ${learning} 个` },
    { label: '连续天数', value: String(streak), icon: Flame, color: 'var(--color-gold)', sub: '保持学习' },
  ]

  return (
    <div
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        paddingTop: '16px',
        paddingBottom: '100px',
      }}
    >
      {/* Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
        {metrics.map(({ label, value, icon: Icon, color, sub }) => (
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
            {sub && (
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.5625rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {sub}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 记忆曲线 */}
      <div
        style={{
          background: 'var(--color-surface-400)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 12px 8px',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          记忆曲线
        </p>
        <ReactECharts option={forgettingCurveOption} style={{ height: 180 }} />
      </div>

      {/* 复习日历 & 学习进度 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        {/* 复习日历 */}
        <div
          style={{
            background: 'var(--color-surface-400)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 12px 8px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
            复习日历（未来30天）
          </p>
          <ReactECharts option={reviewCalendarOption} style={{ height: 190 }} />
        </div>

        {/* 学习进度 */}
        <div
          style={{
            background: 'var(--color-surface-400)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-lg)',
            padding: '12px 12px 8px',
          }}
        >
          <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
            学习进度
          </p>
          <ReactECharts option={progressOption} style={{ height: 190 }} />
        </div>
      </div>

      {/* 打卡趋势 */}
      <div
        style={{
          background: 'var(--color-surface-400)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 12px 8px',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          打卡趋势（近14天）
        </p>
        <ReactECharts option={trendOption} style={{ height: 170 }} />
      </div>

      {/* 打卡热力图 */}
      <div
        style={{
          background: 'var(--color-surface-400)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 12px 8px',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          打卡热力图（近12周）
        </p>
        <ReactECharts option={heatmapOption} style={{ height: 180 }} />
      </div>

      {/* 目标状态 */}
      <div
        style={{
          background: 'var(--color-surface-400)',
          border: '1px solid var(--border-soft)',
          borderRadius: 'var(--radius-lg)',
          padding: '12px 12px 8px',
        }}
      >
        <p style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 8px 0', letterSpacing: '-0.01em' }}>
          目标状态
        </p>
        <ReactECharts option={statusOption} style={{ height: 150 }} />
      </div>
    </div>
  )
}
