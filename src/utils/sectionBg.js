/**
 * 6+1 รูปแบบพื้นหลัง Section หน้าแรก
 */
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

export function getSectionBgStyle(bgStyle, stemColor = '#3b82f6', bgImage = '', bgOverlay = 'light') {
  const c = stemColor || '#3b82f6'

  switch (bgStyle) {
    case 'gray':
      return { background: '#f1f5f9' }

    case 'plaid':
      return {
        backgroundColor: '#f9fafb',
        backgroundImage: [
          'repeating-linear-gradient(45deg,rgba(100,116,139,.07) 0,rgba(100,116,139,.07) 1px,transparent 1px,transparent 14px)',
          'repeating-linear-gradient(-45deg,rgba(100,116,139,.07) 0,rgba(100,116,139,.07) 1px,transparent 1px,transparent 14px)',
          'repeating-linear-gradient(0deg,rgba(100,116,139,.11) 0,rgba(100,116,139,.11) 1px,transparent 1px,transparent 14px)',
          'repeating-linear-gradient(90deg,rgba(100,116,139,.11) 0,rgba(100,116,139,.11) 1px,transparent 1px,transparent 14px)',
        ].join(','),
      }

    case 'corner': {
      const cc = hexToRgba(c, 0.14)
      return {
        background: [
          `radial-gradient(ellipse 65% 65% at 0% 0%, ${cc} 0%, transparent 65%)`,
          `radial-gradient(ellipse 65% 65% at 100% 0%, ${cc} 0%, transparent 65%)`,
          `radial-gradient(ellipse 65% 65% at 0% 100%, ${cc} 0%, transparent 65%)`,
          `radial-gradient(ellipse 65% 65% at 100% 100%, ${cc} 0%, transparent 65%)`,
          '#ffffff',
        ].join(','),
      }
    }

    case 'edge': {
      const ec = hexToRgba(c, 0.14)
      return {
        background: [
          `radial-gradient(ellipse 100% 45% at 50% 0%, ${ec} 0%, transparent 70%)`,
          `radial-gradient(ellipse 100% 45% at 50% 100%, ${ec} 0%, transparent 70%)`,
          `radial-gradient(ellipse 45% 100% at 0% 50%, ${ec} 0%, transparent 70%)`,
          `radial-gradient(ellipse 45% 100% at 100% 50%, ${ec} 0%, transparent 70%)`,
          '#ffffff',
        ].join(','),
      }
    }

    case 'dark':
      return {
        background: 'linear-gradient(135deg,#1e3a5f 0%,#1e3269 50%,#312e81 100%)',
      }

    case 'image': {
      if (!bgImage) return { background: '#f8fafc' }
      const overlayMap = {
        light: 'linear-gradient(rgba(255,255,255,0.32),rgba(255,255,255,0.32)),',
        dark:  'linear-gradient(rgba(0,0,0,0.42),rgba(0,0,0,0.42)),',
        none:  '',
      }
      const ov = overlayMap[bgOverlay] ?? overlayMap.light
      return {
        backgroundImage: `${ov}url('${bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'scroll',
      }
    }

    case 'white':
    default:
      return { background: '#ffffff' }
  }
}

export function isBgDark(bgStyle) {
  return bgStyle === 'dark'
}

/**
 * คำนวณสีข้อความหัวข้อ Section ให้อ่านได้เสมอ
 * - พื้นเข้ม (dark / image+dark overlay) → ใช้ขาว
 * - stemColor อ่อนเกิน (เหลือง, เขียวมะนาว ฯลฯ) → darken 55% อัตโนมัติ
 * - stemColor เข้มพอ → ใช้ stemColor ตรงๆ
 */
export function getTitleColor(stemColor = '#3b82f6', bgStyle = 'white', bgOverlay = 'light') {
  if (bgStyle === 'dark') return '#ffffff'
  if (bgStyle === 'image' && bgOverlay === 'dark') return '#ffffff'

  const hex = (stemColor || '#3b82f6').replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)

  // Perceived luminance (ITU-R BT.601)
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  if (lum > 0.55) {
    // สีอ่อนเกิน → darken 55% ให้อ่านได้บนพื้นขาว/เทา
    const dk = c => Math.round(c * 0.45)
    return '#' + [dk(r), dk(g), dk(b)].map(v => v.toString(16).padStart(2, '0')).join('')
  }

  return stemColor
}
