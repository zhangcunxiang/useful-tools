const translations = {
  en: {
    appTitle: 'My Toolkit',
    tabs: {
      timestamp: 'Timestamp',
      json: 'JSON Formatter',
      jwt: 'JWT',
      diff: 'Set Diff',
    },
    common: {
      currentMs: 'Current timestamp (ms)',
      currentS: 'Current timestamp (s)',
      milliseconds: 'Milliseconds',
      seconds: 'Seconds',
      timezonePlaceholder: 'Custom timezone, e.g. Asia/Shanghai',
      convert: 'Convert',
      format: 'Format',
      minify: 'Minify',
      copy: 'Copy',
      clear: 'Clear',
      tree: 'Tree',
      text: 'Text',
      tokenLabel: 'Token:',
      requestFailed: 'Request failed',
      fetchNowFailed: 'Unable to fetch current timestamp',
      timestampNumberRequired: 'Timestamp must be a number',
      dateStringRequired: 'Please enter a date string',
      copyFailed: 'Copy failed',
      invalidTimezoneList: 'Timezone must be selected from the supported list',
    },
    timestamp: {
      title: 'Timestamp Tool',
      toDate: 'Timestamp → Date',
      toTimestamp: 'Date → Timestamp',
      timestampPlaceholder: 'Enter timestamp',
      datePlaceholder: 'e.g. 2024-12-26 12:00:00 or ISO string',
      formatPlaceholder: 'Optional format, e.g. yyyy-LL-dd HH:mm:ss',
      iso: 'ISO:',
      formatted: 'Formatted:',
      zone: 'Timezone:',
      ms: 'Milliseconds:',
      s: 'Seconds:',
      utcIso: 'UTC ISO:',
    },
    json: {
      title: 'JSON Formatter',
      placeholder: 'Paste JSON here',
      parseError: 'JSON parse failed: ',
    },
    jwt: {
      title: 'JWT Tool',
      decodeTitle: 'Decode Token',
      encodeTitle: 'Generate Token',
      tokenPlaceholder: 'Paste JWT Token',
      payloadPlaceholder: 'payload JSON',
      secretPlaceholder: 'Secret',
      generate: 'Generate',
      decodeError: 'Decode request failed',
      payloadError: 'payload must be valid JSON: ',
      headerLabel: 'Header:',
      payloadLabel: 'Payload:',
    },
    diff: {
      title: 'Set Difference',
      original: 'Original Set (Mother)',
      subset: 'Subset (Child)',
      difference: 'Difference',
      placeholder: 'Enter items, one per line',
      compute: 'Compute Difference',
    },
  },
  zh: {
    appTitle: '我的工具集',
    tabs: {
      timestamp: '时间戳',
      json: 'JSON 格式化',
      jwt: 'JWT',
      diff: '差集计算',
    },
    common: {
      currentMs: '当前时间戳 (ms)',
      currentS: '当前时间戳 (s)',
      milliseconds: '毫秒',
      seconds: '秒',
      timezonePlaceholder: '自定义时区，例如 Asia/Shanghai',
      convert: '转换',
      format: '格式化',
      minify: '压缩',
      copy: '复制',
      clear: '清空',
      tree: 'Tree',
      text: 'Text',
      tokenLabel: 'Token:',
      requestFailed: '请求失败',
      fetchNowFailed: '无法获取当前时间戳',
      timestampNumberRequired: '时间戳必须是数字',
      dateStringRequired: '请输入日期字符串',
      copyFailed: '复制失败',
      invalidTimezoneList: '请选择列表中的合法时区',
    },
    timestamp: {
      title: '时间戳工具',
      toDate: '时间戳 → 日期',
      toTimestamp: '日期 → 时间戳',
      timestampPlaceholder: '输入时间戳',
      datePlaceholder: '例如 2024-12-26 12:00:00 或 ISO 字符串',
      formatPlaceholder: '可选格式，例如 yyyy-LL-dd HH:mm:ss',
      iso: 'ISO:',
      formatted: '格式化:',
      zone: '时区:',
      ms: '毫秒:',
      s: '秒:',
      utcIso: 'UTC ISO:',
    },
    json: {
      title: 'JSON 格式化',
      placeholder: '在此粘贴 JSON',
      parseError: 'JSON 解析失败: ',
    },
    jwt: {
      title: 'JWT 工具',
      decodeTitle: '解码 Token',
      encodeTitle: '生成 Token',
      tokenPlaceholder: '粘贴 JWT Token',
      payloadPlaceholder: 'payload JSON',
      secretPlaceholder: '密钥',
      generate: '生成',
      decodeError: '解码请求失败',
      payloadError: 'payload 需要合法的 JSON: ',
      headerLabel: 'Header:',
      payloadLabel: 'Payload:',
    },
    diff: {
      title: '差集计算',
      original: '母集',
      subset: '子集',
      difference: '差集',
      placeholder: '输入内容，每行一项',
      compute: '计算差集',
    },
  }
}

const FALLBACK_LANG = 'en'

function normalizeLang(lang) {
  if (!lang || typeof lang !== 'string') return ''
  return lang.toLowerCase()
}

export function detectLanguage() {
  if (typeof navigator !== 'undefined') {
    const langs = navigator.languages || [navigator.language]
    for (const lang of langs) {
      const normalized = normalizeLang(lang)
      if (normalized.startsWith('zh')) return 'zh'
      if (normalized.startsWith('en')) return 'en'
    }
  }
  return FALLBACK_LANG
}

export function getTranslations(lang) {
  return translations[lang] || translations[FALLBACK_LANG]
}

export default translations
