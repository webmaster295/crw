// ================================================================
//  Code.gs — School Website System
//  วิธีตั้งค่า: Project Settings → Script Properties
//  เพิ่ม 3 ค่า:
//    SUPABASE_URL         = https://xxxx.supabase.co
//    SUPABASE_KEY         = eyJhbGci...  (anon key)
//    SUPABASE_SERVICE_KEY = eyJhbGci...  (service_role key) ← สำหรับ admin จัดการ users
// ================================================================

// โหมด A: โหลดจาก URL กลาง (อัปเดตอัตโนมัติทุกโรงเรียน) ← แนะนำ
// โหมด B: ปล่อยว่าง = ใช้ไฟล์ index.html ใน GAS โดยตรง
var APP_HTML_URL = ''

function doGet(e) {
  var props   = PropertiesService.getScriptProperties()
  var url     = props.getProperty('SUPABASE_URL') || ''
  var key     = props.getProperty('SUPABASE_KEY') || ''
  var svcKey  = props.getProperty('SUPABASE_SERVICE_KEY') || ''

  // ยังไม่ตั้งค่า → แสดงหน้า Setup
  if (!url || !key) {
    return HtmlService.createHtmlOutput(getSetupPage())
      .setTitle('ตั้งค่าระบบโรงเรียน')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
  }

  // โหลด HTML
  var html = ''
  if (APP_HTML_URL) {
    try {
      html = UrlFetchApp.fetch(APP_HTML_URL).getContentText()
    } catch (err) {
      return HtmlService.createHtmlOutput('โหลดไม่สำเร็จ: ' + err.message)
    }
  } else {
    html = HtmlService.createHtmlOutputFromFile('index').getContent()
  }

  // Inject Supabase config ก่อน </head>
  var configScript = '<script>'
    + 'window.__SUPABASE_URL__="' + url + '";'
    + 'window.__SUPABASE_KEY__="' + key + '";'
    + 'window.__SUPABASE_SERVICE_KEY__="' + svcKey + '";'
    + '<\/script>'
  html = html.replace('</head>', configScript + '</head>')

  return HtmlService.createHtmlOutput(html)
    .setTitle('ระบบโรงเรียน')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
}

function saveConfig(url, key) {
  PropertiesService.getScriptProperties().setProperties({
    'SUPABASE_URL': url,
    'SUPABASE_KEY': key
  })
}

// ================================================================
//  Ping Supabase เพื่อป้องกัน database pause (free plan)
//  ตั้ง Time-based Trigger รัน pingSupabase() ทุก 2 วัน
// ================================================================
function pingSupabase() {
  var props = PropertiesService.getScriptProperties()
  var url   = props.getProperty('SUPABASE_URL') || ''
  var key   = props.getProperty('SUPABASE_KEY') || ''
  if (!url || !key) return

  try {
    var res = UrlFetchApp.fetch(url + '/rest/v1/', {
      method: 'GET',
      headers: { 'apikey': key },
      muteHttpExceptions: true
    })
    Logger.log('Supabase ping: ' + res.getResponseCode())
  } catch (err) {
    Logger.log('Ping error: ' + err.message)
  }
}

// ================================================================
//  Backup ข้อมูล Supabase → Google Sheet
//  ตั้ง Time-based Trigger รัน backupToSheet() ทุกสัปดาห์
//
//  Script Properties ที่ต้องมี:
//    SUPABASE_URL, SUPABASE_KEY  (มีอยู่แล้ว)
//    BACKUP_SHEET_ID             (ID ของ Google Sheet ที่จะเก็บ backup)
// ================================================================

// ตารางที่จะ backup และ column หลักของแต่ละตาราง
var BACKUP_TABLES = [
  { name: 'news',         select: 'id,title,category,excerpt,content,content_type,cover_image_url,is_published,is_pinned,published_at,views,external_url,created_at' },
  { name: 'media',        select: 'id,title,description,category,media_type,content,thumbnail_url,is_published,is_featured,views,external_url,created_at' },
  { name: 'activities',   select: 'id,title,cover_emoji,link_url,description,activity_date,is_published,views,created_at' },
  { name: 'school_config',select: 'id,name_th,name_en,logo_url,updated_at' },
  { name: 'personnel',    select: 'id,name,position,department,image_url,is_published,sort_order' },
]

function backupToSheet() {
  var props     = PropertiesService.getScriptProperties()
  var url       = props.getProperty('SUPABASE_URL') || ''
  var key       = props.getProperty('SUPABASE_KEY') || ''
  var sheetId   = props.getProperty('BACKUP_SHEET_ID') || ''

  if (!url || !key) { Logger.log('Backup: ไม่พบ Supabase config'); return }
  if (!sheetId)     { Logger.log('Backup: ไม่พบ BACKUP_SHEET_ID'); return }

  var ss        = SpreadsheetApp.openById(sheetId)
  var timestamp = Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm')
  var errors    = []

  BACKUP_TABLES.forEach(function(table) {
    try {
      var res  = UrlFetchApp.fetch(
        url + '/rest/v1/' + table.name + '?select=' + table.select + '&limit=5000',
        { headers: { 'apikey': key, 'Accept': 'application/json' }, muteHttpExceptions: true }
      )
      if (res.getResponseCode() !== 200) {
        errors.push(table.name + ': HTTP ' + res.getResponseCode())
        return
      }
      var rows = JSON.parse(res.getContentText())
      if (!rows || !rows.length) { Logger.log('Backup: ' + table.name + ' — ไม่มีข้อมูล'); return }

      // หา sheet หรือสร้างใหม่
      var sheet = ss.getSheetByName(table.name)
      if (!sheet) sheet = ss.insertSheet(table.name)
      sheet.clearContents()

      // Header row
      var headers = Object.keys(rows[0])
      sheet.getRange(1, 1, 1, headers.length).setValues([headers])
        .setFontWeight('bold').setBackground('#1e40af').setFontColor('#ffffff')

      // Data rows
      var data = rows.map(function(row) {
        return headers.map(function(h) {
          var v = row[h]
          if (v === null || v === undefined) return ''
          if (typeof v === 'object') return JSON.stringify(v)
          return v
        })
      })
      sheet.getRange(2, 1, data.length, headers.length).setValues(data)

      // หมายเหตุ backup timestamp ที่ cell A1
      sheet.getRange(1, headers.length + 2).setValue('Backup: ' + timestamp)
      Logger.log('Backup: ' + table.name + ' — ' + rows.length + ' rows ✅')

    } catch(err) {
      errors.push(table.name + ': ' + err.message)
    }
  })

  // บันทึก log ลง sheet "backup_log"
  var logSheet = ss.getSheetByName('backup_log') || ss.insertSheet('backup_log')
  var status   = errors.length ? '❌ ' + errors.join(', ') : '✅ สำเร็จ'
  logSheet.insertRowBefore(2)
  logSheet.getRange(2, 1, 1, 3).setValues([[timestamp, status, BACKUP_TABLES.map(function(t){ return t.name }).join(', ')]])
  if (logSheet.getLastRow() === 1) {
    logSheet.getRange(1, 1, 1, 3).setValues([['เวลา', 'สถานะ', 'ตาราง']]).setFontWeight('bold')
  }

  Logger.log('Backup เสร็จสิ้น: ' + status)
}

// รัน manual ได้เลย หรือตั้ง trigger รายสัปดาห์
function backupNow() { backupToSheet() }

function getSetupPage() {
  return '<!DOCTYPE html><html><head><meta charset="UTF-8">'
    + '<style>body{font-family:sans-serif;display:flex;align-items:center;'
    + 'justify-content:center;min-height:100vh;background:#EFF6FF}'
    + '.c{background:#fff;padding:2rem;border-radius:1rem;width:460px;'
    + 'max-width:95vw;box-shadow:0 4px 20px rgba(0,0,0,.1)}'
    + 'h2{color:#1D4ED8}p{color:#6B7280;font-size:.9rem}'
    + 'label{display:block;font-size:.8rem;font-weight:700;color:#374151;margin-bottom:.3rem}'
    + 'input{width:100%;padding:.65rem;border:1px solid #D1D5DB;border-radius:.5rem;'
    + 'margin-bottom:1rem;font-size:.85rem;box-sizing:border-box}'
    + 'button{width:100%;padding:.8rem;background:#2563EB;color:#fff;border:none;'
    + 'border-radius:.5rem;font-size:1rem;cursor:pointer;font-weight:600}'
    + '.note{font-size:.75rem;color:#9CA3AF;margin-top:.75rem;text-align:center}'
    + '</style></head><body><div class="c">'
    + '<h2>⚙️ ตั้งค่าระบบโรงเรียน</h2>'
    + '<p>กรอก Supabase Config ของโรงเรียน — ตั้งค่าครั้งเดียว</p>'
    + '<label>SUPABASE URL</label>'
    + '<input id="u" placeholder="https://xxxxxxxxxxxx.supabase.co"/>'
    + '<label>SUPABASE ANON KEY</label>'
    + '<input id="k" placeholder="eyJhbGci..."/>'
    + '<button onclick="save()">💾 บันทึกและเริ่มใช้งาน</button>'
    + '<p class="note">เก็บใน Script Properties อย่างปลอดภัย</p>'
    + '</div><script>'
    + 'function save(){'
    + 'var u=document.getElementById("u").value.trim(),'
    + 'k=document.getElementById("k").value.trim();'
    + 'if(!u||!k){alert("กรุณากรอกให้ครบ");return;}'
    + 'document.querySelector("button").textContent="กำลังบันทึก...";'
    + 'google.script.run.withSuccessHandler(()=>location.reload()).saveConfig(u,k);'
    + '}<\/script></body></html>'
}
