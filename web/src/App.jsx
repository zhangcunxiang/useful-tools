import React, { useEffect, useMemo, useState } from 'react'
import JSON5 from 'json5'
import './App.css'
import { detectLanguage, getTranslations } from './i18n'

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001'

function SectionTabs({ active, onChange, t }) {
  const tabs = [
    { id: 'timestamp', label: t.tabs.timestamp },
    { id: 'json', label: t.tabs.json },
    { id: 'jwt', label: t.tabs.jwt },
  ]
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 24, justifyContent: 'center' }}>
      {tabs.map(t => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={active === t.id ? 'tab-active' : 'tab-inactive'}
          style={{
            padding: '10px 20px',
            borderRadius: '20px',
            transition: 'all 0.2s ease',
            fontWeight: 600
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

function TimestampTool({ t }) {
  const [now, setNow] = useState({ timestamp_ms: 0, timestamp_s: 0 })
  const [tz1, setTz1] = useState('Asia/Shanghai')
  const [useCustomTz1, setUseCustomTz1] = useState(false)
  const [customTz1, setCustomTz1] = useState('Asia/Shanghai')
  const [unit1, setUnit1] = useState('ms')
  const [tsInput, setTsInput] = useState('')
  const [toDateResult, setToDateResult] = useState(null)
  
  const [tz2, setTz2] = useState('Asia/Shanghai')
  const [useCustomTz2, setUseCustomTz2] = useState(false)
  const [customTz2, setCustomTz2] = useState('Asia/Shanghai')
  const [dateInput, setDateInput] = useState('')
  const [formatInput, setFormatInput] = useState('')
  const [toTsResult, setToTsResult] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchNow = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/timestamp/now`)
        const data = await res.json()
        setNow(data)
      } catch {
        setError(t.common.fetchNowFailed)
      }
    }
    fetchNow()
    const id = setInterval(fetchNow, 1000)
    return () => clearInterval(id)
  }, [])

  const commonZones = useMemo(() => [
    'UTC',
    'Pacific/Midway',      // UTC-11
    'America/Honolulu',    // UTC-10
    'America/Anchorage',   // UTC-9
    'America/Los_Angeles', // UTC-8
    'America/Denver',      // UTC-7
    'America/Chicago',     // UTC-6
    'America/New_York',    // UTC-5
    'America/Halifax',     // UTC-4
    'America/Sao_Paulo',   // UTC-3
    'Atlantic/South_Georgia', // UTC-2
    'Atlantic/Azores',     // UTC-1
    'Europe/London',       // UTC+0
    'Europe/Paris',        // UTC+1
    'Europe/Istanbul',     // UTC+2
    'Asia/Moscow',         // UTC+3
    'Asia/Dubai',          // UTC+4
    'Asia/Karachi',        // UTC+5
    'Asia/Dhaka',          // UTC+6
    'Asia/Bangkok',        // UTC+7
    'Asia/Shanghai',       // UTC+8
    'Asia/Tokyo',          // UTC+9
    'Australia/Sydney',    // UTC+10
    'Pacific/Noumea',      // UTC+11
    'Pacific/Auckland',    // UTC+12
  ], [])

  const handleToDate = async () => {
    setError('')
    setToDateResult(null)
    const val = Number(tsInput)
    if (!Number.isFinite(val)) {
      setError(t.common.timestampNumberRequired)
      return
    }
    const targetTz = useCustomTz1 ? customTz1 : tz1
    try {
      const res = await fetch(`${API_BASE}/api/timestamp/to-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: val, unit: unit1, tz: targetTz })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setToDateResult(data)
      }
    } catch {
      setError(t.common.requestFailed)
    }
  }

  const handleToTimestamp = async () => {
    setError('')
    setToTsResult(null)
    if (!dateInput) {
      setError(t.common.dateStringRequired)
      return
    }
    const targetTz = useCustomTz2 ? customTz2 : tz2
    try {
      const res = await fetch(`${API_BASE}/api/timestamp/from-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateInput, tz: targetTz, format: formatInput || undefined })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setToTsResult(data)
      }
    } catch {
      setError(t.common.requestFailed)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t.timestamp.title}</h2>
      <div style={{ marginBottom: 20, padding: 16, background: '#e8f5e9', borderRadius: 8, display: 'flex', gap: 32, justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2em' }}>{t.common.currentMs}: <code style={{ fontSize: '1.2em', color: '#2e7d32' }}>{now.timestamp_ms}</code></div>
        <div style={{ fontSize: '1.2em' }}>{t.common.currentS}: <code style={{ fontSize: '1.2em', color: '#2e7d32' }}>{now.timestamp_s}</code></div>
      </div>
      <div className="tool-grid">
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>{t.timestamp.toDate}</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder={t.timestamp.timestampPlaceholder}
              value={tsInput}
              onChange={e => setTsInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <label style={{ cursor: 'pointer' }}>
              <input
                type="radio"
                name="unit1"
                checked={unit1 === 'ms'}
                onChange={() => setUnit1('ms')}
              /> <span style={{ marginLeft: 4 }}>{t.common.milliseconds}</span>
            </label>
            <label style={{ marginLeft: 16, cursor: 'pointer' }}>
              <input
                type="radio"
                name="unit1"
                checked={unit1 === 's'}
                onChange={() => setUnit1('s')}
              /> <span style={{ marginLeft: 4 }}>{t.common.seconds}</span>
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <select 
                value={tz1} 
                onChange={e => setTz1(e.target.value)} 
                disabled={useCustomTz1}
                style={{ flex: 1, opacity: useCustomTz1 ? 0.5 : 1 }}
              >
                {commonZones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <label style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                <input 
                  type="checkbox" 
                  checked={useCustomTz1} 
                  onChange={e => setUseCustomTz1(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                Custom
              </label>
            </div>
            {useCustomTz1 && (
              <input
                placeholder={t.common.timezonePlaceholder}
                value={customTz1}
                onChange={e => setCustomTz1(e.target.value)}
                style={{ width: '100%' }}
              />
            )}
          </div>
          <button onClick={handleToDate} style={{ width: '100%' }}>{t.common.convert}</button>
          {toDateResult && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'left' }}>
              <div style={{ marginBottom: 4 }}><strong>{t.timestamp.iso}</strong> <code>{toDateResult.iso}</code></div>
              <div style={{ marginBottom: 4 }}><strong>{t.timestamp.formatted}</strong> <code>{toDateResult.formatted}</code></div>
              <div><strong>{t.timestamp.zone}</strong> <code>{toDateResult.zone}</code></div>
            </div>
          )}
        </div>
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>{t.timestamp.toTimestamp}</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder={t.timestamp.datePlaceholder}
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder={t.timestamp.formatPlaceholder}
              value={formatInput}
              onChange={e => setFormatInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <select 
                value={tz2} 
                onChange={e => setTz2(e.target.value)} 
                disabled={useCustomTz2}
                style={{ flex: 1, opacity: useCustomTz2 ? 0.5 : 1 }}
              >
                {commonZones.map(z => <option key={z} value={z}>{z}</option>)}
              </select>
              <label style={{ cursor: 'pointer', whiteSpace: 'nowrap', fontSize: '0.9em' }}>
                <input 
                  type="checkbox" 
                  checked={useCustomTz2} 
                  onChange={e => setUseCustomTz2(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                Custom
              </label>
            </div>
            {useCustomTz2 && (
              <input
                placeholder={t.common.timezonePlaceholder}
                value={customTz2}
                onChange={e => setCustomTz2(e.target.value)}
                style={{ width: '100%' }}
              />
            )}
          </div>
          <button onClick={handleToTimestamp} style={{ width: '100%' }}>{t.common.convert}</button>
          {toTsResult && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'left' }}>
              <div style={{ marginBottom: 4 }}><strong>{t.timestamp.ms}</strong> <code>{toTsResult.timestamp_ms}</code></div>
              <div style={{ marginBottom: 4 }}><strong>{t.timestamp.s}</strong> <code>{toTsResult.timestamp_s}</code></div>
              <div><strong>{t.timestamp.utcIso}</strong> <code>{toTsResult.iso}</code></div>
            </div>
          )}
        </div>
      </div>
      {error && <div style={{ color: '#d32f2f', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 6 }}>{error}</div>}
    </div>
  )
}

function CodeWithLineNumbers({ text }) {
  const lines = useMemo(() => String(text || '').split('\n'), [text])
  const maxLen = String(lines.length).length
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 8, fontFamily: 'monospace', whiteSpace: 'pre', textAlign: 'left' }}>
      <div>
        {lines.map((_, i) => (
          <div key={i} style={{ opacity: 0.6 }}>{String(i + 1).padStart(maxLen, ' ')}</div>
        ))}
      </div>
      <div>
        {lines.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  )
}

function JsonTreeView({ data }) {
  const [collapsedPaths, setCollapsedPaths] = useState(new Set())

  const toggleCollapse = (path) => {
    const newSet = new Set(collapsedPaths)
    if (newSet.has(path)) {
      newSet.delete(path)
    } else {
      newSet.add(path)
    }
    setCollapsedPaths(newSet)
  }

  const rows = useMemo(() => {
    const result = []
    
    const traverse = (key, value, path, level, isLast) => {
      const isArray = Array.isArray(value)
      const isObject = value !== null && typeof value === 'object'
      
      const rowBase = { path, level, key, isLast }

      if (!isObject) {
        result.push({ ...rowBase, type: 'primitive', value })
        return
      }

      const keys = Object.keys(value)
      const isEmpty = keys.length === 0
      const openChar = isArray ? '[' : '{'
      const closeChar = isArray ? ']' : '}'
      
      if (isEmpty) {
        result.push({ ...rowBase, type: 'empty', openChar, closeChar })
        return
      }

      const isCollapsed = collapsedPaths.has(path)
      if (isCollapsed) {
        result.push({ ...rowBase, type: 'collapsed', openChar, closeChar, itemCount: keys.length })
      } else {
        // Open
        result.push({ ...rowBase, type: 'open', openChar, isCollapsible: true })
        
        // Children
        keys.forEach((k, index) => {
          const childPath = `${path}.${k}`
          const childIsLast = index === keys.length - 1
          traverse(isArray ? null : k, value[k], childPath, level + 1, childIsLast)
        })

        // Close
        result.push({ 
          path: `${path}-close`, 
          level, 
          type: 'close', 
          closeChar, 
          isLast,
          // Close bracket row shouldn't display key again
          key: null 
        })
      }
    }

    traverse(null, data, 'root', 0, true)
    return result
  }, [data, collapsedPaths])

  const maxLineNumWidth = String(rows.length).length

  return (
    <div style={{ fontFamily: 'monospace', fontSize: '14px', lineHeight: '1.5', textAlign: 'left' }}>
      {rows.map((row, index) => (
        <div key={index} style={{ display: 'flex', '&:hover': { backgroundColor: '#f5f5f5' } }}>
          {/* Line Number */}
          <div style={{ 
            width: `${maxLineNumWidth + 2}ch`, 
            textAlign: 'right', 
            marginRight: '16px', 
            color: '#bbb', 
            userSelect: 'none',
            flexShrink: 0
          }}>
            {index + 1}
          </div>

          {/* Content */}
          <div style={{ paddingLeft: row.level * 24, display: 'flex', alignItems: 'flex-start' }}>
            {/* Toggler */}
            {row.isCollapsible || row.type === 'collapsed' ? (
              <span 
                onClick={() => toggleCollapse(row.path)}
                style={{ 
                  cursor: 'pointer', 
                  marginRight: 4, 
                  userSelect: 'none', 
                  color: '#666',
                  width: 12,
                  display: 'inline-block',
                  textAlign: 'center'
                }}
              >
                {row.type === 'collapsed' ? '▶' : '▼'}
              </span>
            ) : <span style={{ width: 16, display: 'inline-block' }}></span>}

            {/* Row Data */}
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
              {row.key && (
                <>
                  <span style={{ color: '#880e4f', fontWeight: 600 }}>"{row.key}"</span>
                  <span style={{ color: '#555' }}>: </span>
                </>
              )}

              {row.type === 'primitive' && (
                <>
                  <span style={{ 
                    color: typeof row.value === 'string' ? '#2e7d32' : 
                           typeof row.value === 'number' ? '#1565c0' : 
                           typeof row.value === 'boolean' ? '#ef6c00' : '#d32f2f'
                  }}>
                    {typeof row.value === 'string' ? `"${row.value}"` : String(row.value)}
                  </span>
                  {!row.isLast && <span style={{ color: '#555' }}>,</span>}
                </>
              )}

              {row.type === 'empty' && (
                <>
                  <span style={{ color: '#333' }}>{row.openChar}{row.closeChar}</span>
                  {!row.isLast && <span style={{ color: '#555' }}>,</span>}
                </>
              )}

              {row.type === 'collapsed' && (
                <>
                  <span style={{ color: '#333' }}>{row.openChar}</span>
                  <span 
                    onClick={() => toggleCollapse(row.path)}
                    style={{ color: '#999', cursor: 'pointer', fontStyle: 'italic', margin: '0 6px' }}
                  >
                    ... {row.itemCount} items
                  </span>
                  <span style={{ color: '#333' }}>{row.closeChar}</span>
                  {!row.isLast && <span style={{ color: '#555' }}>,</span>}
                </>
              )}

              {row.type === 'open' && (
                <span style={{ color: '#333' }}>{row.openChar}</span>
              )}

              {row.type === 'close' && (
                <>
                  <span style={{ color: '#333' }}>{row.closeChar}</span>
                  {!row.isLast && <span style={{ color: '#555' }}>,</span>}
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

function JsonTool({ t }) {
  const [input, setInput] = useState('')
  const [output, setOutput] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [viewMode, setViewMode] = useState('text')
  const [error, setError] = useState('')

  // Auto-format effect
  useEffect(() => {
    if (!input.trim()) {
      return
    }
    const timer = setTimeout(() => {
      try {
        const obj = JSON5.parse(input)
        setParsedData(obj)
        // Only switch to tree view if not already there? 
        // Or maybe just update the data. 
        // User asked "auto format".
        // Let's update output text too just in case they switch.
        setOutput(JSON.stringify(obj, null, 2))
        setError('')
        // If it's the first load or valid input, we might want to default to tree?
        // But let's respect current viewMode.
        // If viewMode is text, it will update the text.
      } catch (e) {
        // Silent fail on auto-format while typing, or maybe show small indicator?
        // Let's not be too aggressive with errors.
      }
    }, 800)
    return () => clearTimeout(timer)
  }, [input])

  const clear = () => {
    setInput('')
    setOutput('')
    setParsedData(null)
    setError('')
  }
  const format = () => {
    setError('')
    try {
      const obj = JSON5.parse(input)
      setOutput(JSON.stringify(obj, null, 2))
      setParsedData(obj)
      setViewMode('tree')
    } catch (e) {
      setError(t.json.parseError + e.message)
    }
  }
  const minify = () => {
    setError('')
    try {
      const obj = JSON5.parse(input)
      setOutput(JSON.stringify(obj))
      setParsedData(null)
      setViewMode('text')
    } catch (e) {
      setError(t.json.parseError + e.message)
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output || input)
    } catch {
      setError(t.common.copyFailed)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t.json.title}</h2>
      <div className="tool-grid">
        <div className="tool-panel">
          <textarea
            placeholder={t.json.placeholder}
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={18}
            style={{ width: '100%', fontFamily: 'monospace', height: '100%', resize: 'none' }}
          />
        </div>
        <div className="tool-panel" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
           <div style={{ background: '#f5f5f5', borderBottom: '1px solid #e0e0e0', padding: '4px 8px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
             <button 
                onClick={() => setViewMode('tree')} 
                disabled={!parsedData}
                style={{ 
                  padding: '2px 8px', 
                  fontSize: '0.8em', 
                  background: viewMode === 'tree' ? '#e0e0e0' : 'transparent',
                  color: '#333',
                  boxShadow: 'none',
                  border: '1px solid transparent',
                  opacity: !parsedData ? 0.5 : 1
                }}
              >{t.common.tree}</button>
             <button 
                onClick={() => setViewMode('text')}
                style={{ 
                  padding: '2px 8px', 
                  fontSize: '0.8em', 
                  background: viewMode === 'text' ? '#e0e0e0' : 'transparent',
                  color: '#333',
                  boxShadow: 'none',
                  border: '1px solid transparent'
                }}
              >{t.common.text}</button>
           </div>
          <div style={{ flex: 1, padding: 8, overflow: 'auto', maxHeight: 400 }}>
            {viewMode === 'tree' && parsedData ? (
               <JsonTreeView data={parsedData} />
            ) : (
               <CodeWithLineNumbers text={output || input} />
            )}
          </div>
        </div>
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'center' }}>
        <button onClick={format}>{t.common.format}</button>
        <button onClick={minify}>{t.common.minify}</button>
        <button onClick={copy}>{t.common.copy}</button>
        <button onClick={clear} style={{ backgroundColor: '#ef5350' }}>{t.common.clear}</button>
      </div>
      {error && <div style={{ color: '#d32f2f', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 6 }}>{error}</div>}
    </div>
  )
}

function JwtTool({ t }) {
  const [tokenInput, setTokenInput] = useState('')
  const [decoded, setDecoded] = useState(null)
  const [payloadInput, setPayloadInput] = useState(`{
  "sub": "123",
  "name": "Alice",
  "admin": true
}`)
  const [secretInput, setSecretInput] = useState('')
  const [encoded, setEncoded] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const decode = async () => {
      setError('')
      setDecoded(null)
      if (!tokenInput) return
      try {
        const res = await fetch(`${API_BASE}/api/jwt/decode`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: tokenInput })
        })
        const data = await res.json()
        if (data.error) {
          setError(data.error)
        } else {
          setDecoded(data)
        }
      } catch {
        setError(t.jwt.decodeError)
      }
    }
    decode()
  }, [tokenInput])

  const handleEncode = async () => {
    setError('')
    setEncoded('')
    try {
      const payload = JSON5.parse(payloadInput)
      const res = await fetch(`${API_BASE}/api/jwt/encode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payload, secret: secretInput, algorithm: 'HS256' })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setEncoded(data.token)
      }
    } catch (e) {
      setError(t.jwt.payloadError + e.message)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>{t.jwt.title}</h2>
      <div className="tool-grid">
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>{t.jwt.decodeTitle}</h3>
          <textarea
            placeholder={t.jwt.tokenPlaceholder}
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            rows={8}
            style={{ width: '100%', fontFamily: 'monospace', marginBottom: 16 }}
          />
          {decoded && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#444' }}>{t.jwt.headerLabel}</div>
              <div style={{ border: '1px solid #ddd', padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                <CodeWithLineNumbers text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <div style={{ fontWeight: 600, marginTop: 12, marginBottom: 4, color: '#444' }}>{t.jwt.payloadLabel}</div>
              <div style={{ border: '1px solid #ddd', padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                <CodeWithLineNumbers text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
            </div>
          )}
        </div>
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>{t.jwt.encodeTitle}</h3>
          <textarea
            placeholder={t.jwt.payloadPlaceholder}
            value={payloadInput}
            onChange={e => setPayloadInput(e.target.value)}
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace', marginBottom: 12 }}
          />
          <input
            placeholder={t.jwt.secretPlaceholder}
            value={secretInput}
            onChange={e => setSecretInput(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 16 }}
          />
          <div>
            <button onClick={handleEncode} style={{ width: '100%' }}>{t.jwt.generate}</button>
          </div>
          {encoded && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#444' }}>{t.common.tokenLabel}</div>
              <div style={{ border: '1px solid #ddd', padding: 12, wordBreak: 'break-all', background: '#f0f4c3', borderRadius: 4, fontFamily: 'monospace' }}>
                {encoded}
              </div>
            </div>
          )}
        </div>
      </div>
      {error && <div style={{ color: '#d32f2f', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 6 }}>{error}</div>}
    </div>
  )
}

function App() {
  const [lang] = useState(() => detectLanguage())
  const t = useMemo(() => getTranslations(lang), [lang])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang
    }
  }, [lang])

  const [active, setActive] = useState('timestamp')
  return (
    <div id="root-app">
      <h1>{t.appTitle}</h1>
      <SectionTabs active={active} onChange={setActive} t={t} />
      {active === 'timestamp' && <TimestampTool t={t} />}
      {active === 'json' && <JsonTool t={t} />}
      {active === 'jwt' && <JwtTool t={t} />}
    </div>
  )
}

export default App
