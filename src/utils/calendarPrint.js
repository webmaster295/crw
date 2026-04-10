// ─── Calendar Print Utility ───────────────────────────────────────────────────
// 3 print modes: Monthly (12 pages A4 Landscape), Year Overview (1 page A4 Landscape), Event List (A4 Portrait)

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
]

const TYPE_COLORS = {
  holiday:  { bg: '#fee2e2', text: '#b91c1c', dot: '#ef4444', label: 'วันหยุดราชการ' },
  exam:     { bg: '#f3e8ff', text: '#7e22ce', dot: '#a855f7', label: 'สอบ' },
  activity: { bg: '#dcfce7', text: '#15803d', dot: '#22c55e', label: 'กิจกรรมโรงเรียน' },
  term:     { bg: '#dbeafe', text: '#1d4ed8', dot: '#3b82f6', label: 'เปิด-ปิดภาคเรียน' },
  meeting:  { bg: '#fef3c7', text: '#b45309', dot: '#f59e0b', label: 'ประชุม' },
  other:    { bg: '#f3f4f6', text: '#6b7280', dot: '#9ca3af', label: 'อื่นๆ' },
}

function tc(eventType) {
  return TYPE_COLORS[eventType] || TYPE_COLORS.other
}

function formatDateThai(ds) {
  if (!ds) return ''
  const [y, m, d] = ds.split('-')
  return `${parseInt(d)} ${THAI_MONTHS[parseInt(m) - 1]} ${parseInt(y) + 543}`
}

function getCalendarCells(ceYear, month) {
  // month: 0-11 — Monday-first grid
  const firstDay = new Date(ceYear, month, 1).getDay()
  const offset = firstDay === 0 ? 6 : firstDay - 1
  const daysInMonth = new Date(ceYear, month + 1, 0).getDate()
  const cells = []
  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

function eventsOnDay(events, ceYear, month, day) {
  const ds = `${ceYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  return events.filter(e => {
    const start = e.start_date || ''
    const end = e.end_date || e.start_date || ''
    return ds >= start && ds <= end
  })
}

function legend() {
  const items = Object.values(TYPE_COLORS).map(c =>
    `<span style="display:inline-flex;align-items:center;gap:4px;font-size:7.5pt;color:${c.text}">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${c.dot};flex-shrink:0"></span>${c.label}
    </span>`
  ).join('')
  return `<div style="margin-top:8px;display:flex;gap:14px;flex-wrap:wrap;padding-top:6px;border-top:1px solid #e5e7eb">${items}</div>`
}

function docHeader(schoolName, logoUrl, title) {
  const printed = new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
  return `<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;border-bottom:2px solid #4338ca;padding-bottom:8px">
    ${logoUrl ? `<img src="${logoUrl}" style="height:44px;width:44px;object-fit:contain" onerror="this.style.display='none'">` : ''}
    <div style="flex:1">
      <div style="font-size:13pt;font-weight:700;color:#1e1b4b">${title}</div>
      <div style="font-size:8.5pt;color:#6b7280">${schoolName}</div>
    </div>
    <div style="font-size:7.5pt;color:#9ca3af;text-align:right;line-height:1.5">
      พิมพ์เมื่อ ${printed}
    </div>
  </div>`
}

function openPrintWindow(bodyHtml, orientation = 'portrait') {
  const win = window.open('', '_blank', 'width=960,height=720')
  if (!win) {
    alert('กรุณาอนุญาต Popup สำหรับหน้านี้เพื่อเปิดหน้าต่างพิมพ์')
    return
  }
  win.document.write(`<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<title>ปฏิทินวิชาการ</title>
<link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  @page { size: A4 ${orientation}; margin: 12mm 14mm; }
  * { box-sizing: border-box; font-family: 'Sarabun', 'Noto Sans Thai', sans-serif; margin: 0; padding: 0; }
  body { font-size: 10pt; color: #1f2937; background: #fff; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  }
</style>
</head>
<body>${bodyHtml}</body>
</html>`)
  win.document.close()
  setTimeout(() => { win.focus(); win.print() }, 900)
}

// ─── Mode 1: Monthly — 12 pages A4 Landscape ──────────────────────────────────
export function printMonthly(events, academicYear, schoolName, logoUrl) {
  const ceYear = academicYear - 543
  const DAY_LABELS = ['จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์', 'อาทิตย์']

  const pages = THAI_MONTHS.map((monthName, mi) => {
    const cells = getCalendarCells(ceYear, mi)
    const theadCells = DAY_LABELS.map((d, i) =>
      `<th style="border:1px solid #e5e7eb;padding:5px 4px;text-align:center;background:#eef2ff;font-size:8pt;color:${i >= 5 ? '#ef4444' : '#4338ca'};font-weight:700">${d}</th>`
    ).join('')

    const bodyRows = []
    for (let r = 0; r < Math.ceil(cells.length / 7); r++) {
      const week = cells.slice(r * 7, r * 7 + 7)
      const tds = week.map((day, ci) => {
        const isWeekend = ci === 5 || ci === 6
        const dayEvs = day ? eventsOnDay(events, ceYear, mi, day) : []
        const evHtml = dayEvs.slice(0, 5).map(ev => {
          const c = tc(ev.event_type)
          return `<div style="background:${c.bg};color:${c.text};font-size:6.5pt;padding:1px 4px;border-radius:3px;margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ev.title}</div>`
        }).join('') + (dayEvs.length > 5 ? `<div style="font-size:6pt;color:#6b7280;margin-top:1px;padding-left:2px">+${dayEvs.length - 5} รายการ</div>` : '')
        return `<td style="border:1px solid #e5e7eb;padding:3px 4px;vertical-align:top;width:14.28%;${isWeekend ? 'background:#fff7f7' : ''}">
          ${day ? `<div style="font-size:9pt;font-weight:700;color:${isWeekend ? '#ef4444' : '#374151'};text-align:right;margin-bottom:2px">${day}</div>${evHtml}` : ''}
        </td>`
      }).join('')
      bodyRows.push(`<tr style="height:70px">${tds}</tr>`)
    }

    const isLast = mi === 11
    return `<div style="padding:2mm;${isLast ? '' : 'page-break-after:always'}">
      ${docHeader(schoolName, logoUrl, `${monthName} — ปีการศึกษา ${academicYear}`)}
      <table style="width:100%;border-collapse:collapse;table-layout:fixed">
        <thead><tr>${theadCells}</tr></thead>
        <tbody>${bodyRows.join('')}</tbody>
      </table>
      ${legend()}
    </div>`
  }).join('')

  openPrintWindow(pages, 'landscape')
}

// ─── Mode 2: Year Overview — 1 page A4 Landscape (4×3 mini calendars) ─────────
export function printYearOverview(events, academicYear, schoolName, logoUrl) {
  const ceYear = academicYear - 543
  const DAY_SHORT = ['จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส', 'อา']

  const miniCals = THAI_MONTHS.map((monthName, mi) => {
    const cells = getCalendarCells(ceYear, mi)
    const theadCells = DAY_SHORT.map((d, i) =>
      `<th style="font-size:6pt;padding:1px 2px;color:${i >= 5 ? '#ef4444' : '#4338ca'};text-align:center;font-weight:700">${d}</th>`
    ).join('')
    const bodyRows = []
    for (let r = 0; r < Math.ceil(cells.length / 7); r++) {
      const week = cells.slice(r * 7, r * 7 + 7)
      const tds = week.map((day, ci) => {
        const isWeekend = ci === 5 || ci === 6
        const dayEvs = day ? eventsOnDay(events, ceYear, mi, day) : []
        const dotColor = dayEvs.length ? tc(dayEvs[0].event_type).dot : ''
        return `<td style="padding:1px;text-align:center;width:14.28%">
          ${day ? `<div style="position:relative;font-size:6.5pt;color:${isWeekend ? '#ef4444' : '#374151'};line-height:1.5;${dayEvs.length ? 'font-weight:600' : ''}">
            ${day}
            ${dayEvs.length ? `<span style="position:absolute;bottom:-1px;left:50%;transform:translateX(-50%);width:3px;height:3px;border-radius:50%;background:${dotColor};display:block"></span>` : ''}
          </div>` : ''}
        </td>`
      }).join('')
      bodyRows.push(`<tr>${tds}</tr>`)
    }
    return `<div style="border:1px solid #e5e7eb;border-radius:6px;overflow:hidden">
      <div style="background:#4338ca;color:white;padding:3px 7px;font-size:7.5pt;font-weight:700">${monthName} ${academicYear}</div>
      <div style="padding:4px">
        <table style="width:100%;border-collapse:collapse">
          <thead><tr>${theadCells}</tr></thead>
          <tbody>${bodyRows.join('')}</tbody>
        </table>
      </div>
    </div>`
  }).join('')

  const html = `<div>
    ${docHeader(schoolName, logoUrl, `ปฏิทินกิจกรรมโรงเรียน ปีการศึกษา ${academicYear}`)}
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px">${miniCals}</div>
    ${legend()}
  </div>`
  openPrintWindow(html, 'landscape')
}

// ─── Mode 3: Event List — A4 Portrait ─────────────────────────────────────────
export function printEventList(events, academicYear, schoolName, logoUrl) {
  if (!events.length) { alert('ไม่มีกิจกรรมในปีนี้'); return }
  const ceYear = academicYear - 543

  const sorted = [...events].sort((a, b) => a.start_date.localeCompare(b.start_date))
  const grouped = THAI_MONTHS.map((monthName, mi) => {
    const mStart = `${ceYear}-${String(mi + 1).padStart(2, '0')}-01`
    const dim = new Date(ceYear, mi + 1, 0).getDate()
    const mEnd = `${ceYear}-${String(mi + 1).padStart(2, '0')}-${String(dim).padStart(2, '0')}`
    const evs = sorted.filter(e => {
      const s = e.start_date || ''
      const end = e.end_date || e.start_date || ''
      return s <= mEnd && end >= mStart
    })
    return { monthName, evs }
  }).filter(g => g.evs.length)

  const theadCells = ['#', 'วัน/เดือน/ปี', 'ชื่อกิจกรรม', 'ประเภท', 'รายละเอียด'].map(h =>
    `<th style="border:1px solid #c7d2fe;background:#eef2ff;padding:5px 8px;font-size:8.5pt;color:#3730a3;text-align:left;font-weight:700">${h}</th>`
  ).join('')

  let rows = ''
  let n = 1
  grouped.forEach(({ monthName, evs }) => {
    rows += `<tr><td colspan="5" style="background:#f5f3ff;color:#3730a3;font-weight:700;font-size:8.5pt;padding:5px 10px;border:1px solid #ddd6fe">${monthName}</td></tr>`
    evs.forEach(ev => {
      const c = tc(ev.event_type)
      const dateRange = (ev.end_date && ev.end_date !== ev.start_date)
        ? `${formatDateThai(ev.start_date)} –<br>${formatDateThai(ev.end_date)}`
        : formatDateThai(ev.start_date)
      rows += `<tr>
        <td style="border:1px solid #e5e7eb;padding:4px 6px;text-align:center;font-size:8pt;color:#9ca3af">${n++}</td>
        <td style="border:1px solid #e5e7eb;padding:4px 8px;font-size:8pt;white-space:nowrap">${dateRange}</td>
        <td style="border:1px solid #e5e7eb;padding:4px 8px;font-size:9pt;font-weight:600">${ev.title}</td>
        <td style="border:1px solid #e5e7eb;padding:4px 8px;text-align:center">
          <span style="background:${c.bg};color:${c.text};font-size:7pt;padding:2px 7px;border-radius:10px;white-space:nowrap">${c.label}</span>
        </td>
        <td style="border:1px solid #e5e7eb;padding:4px 8px;font-size:8pt;color:#6b7280">${ev.description || ''}</td>
      </tr>`
    })
  })

  const html = `<div>
    ${docHeader(schoolName, logoUrl, `รายการกิจกรรมทั้งหมด ปีการศึกษา ${academicYear}`)}
    <table style="width:100%;border-collapse:collapse">
      <thead><tr>${theadCells}</tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div style="margin-top:10px;font-size:8pt;color:#9ca3af;text-align:center">
      รวมทั้งหมด ${events.length} กิจกรรม · ปีการศึกษา ${academicYear}
    </div>
  </div>`
  openPrintWindow(html, 'portrait')
}
