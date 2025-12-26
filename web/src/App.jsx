import React, { useEffect, useMemo, useState } from 'react'
import JSON5 from 'json5'
import './App.css'

const API_BASE = import.meta.env.PROD ? '' : 'http://localhost:3001'

function SectionTabs({ active, onChange }) {
  const tabs = [
    { id: 'timestamp', label: 'Timestamp' },
    { id: 'json', label: 'JSON 格式化' },
    { id: 'jwt', label: 'JWT' },
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

function TimestampTool() {
  const [now, setNow] = useState({ timestamp_ms: 0, timestamp_s: 0 })
  const [tz1, setTz1] = useState('Asia/Shanghai')
  const [unit1, setUnit1] = useState('ms')
  const [tsInput, setTsInput] = useState('')
  const [toDateResult, setToDateResult] = useState(null)
  const [tz2, setTz2] = useState('Asia/Shanghai')
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
        setError('无法获取当前时间戳')
      }
    }
    fetchNow()
    const id = setInterval(fetchNow, 1000)
    return () => clearInterval(id)
  }, [])

  const commonZones = useMemo(() => [
    'UTC', 'Asia/Shanghai', 'Asia/Tokyo', 'Europe/London', 'America/New_York'
  ], [])

  const handleToDate = async () => {
    setError('')
    setToDateResult(null)
    const val = Number(tsInput)
    if (!Number.isFinite(val)) {
      setError('时间戳必须是数字')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/timestamp/to-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timestamp: val, unit: unit1, tz: tz1 })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setToDateResult(data)
      }
    } catch {
      setError('请求失败')
    }
  }

  const handleToTimestamp = async () => {
    setError('')
    setToTsResult(null)
    if (!dateInput) {
      setError('请输入日期字符串')
      return
    }
    try {
      const res = await fetch(`${API_BASE}/api/timestamp/from-date`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: dateInput, tz: tz2, format: formatInput || undefined })
      })
      const data = await res.json()
      if (data.error) {
        setError(data.error)
      } else {
        setToTsResult(data)
      }
    } catch {
      setError('请求失败')
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>时间戳工具</h2>
      <div style={{ marginBottom: 20, padding: 16, background: '#e8f5e9', borderRadius: 8, display: 'flex', gap: 32, justifyContent: 'center' }}>
        <div style={{ fontSize: '1.2em' }}>当前时间戳 (ms): <code style={{ fontSize: '1.2em', color: '#2e7d32' }}>{now.timestamp_ms}</code></div>
        <div style={{ fontSize: '1.2em' }}>当前时间戳 (s): <code style={{ fontSize: '1.2em', color: '#2e7d32' }}>{now.timestamp_s}</code></div>
      </div>
      <div className="tool-grid">
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>时间戳 → 日期</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="输入时间戳"
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
              /> <span style={{ marginLeft: 4 }}>毫秒</span>
            </label>
            <label style={{ marginLeft: 16, cursor: 'pointer' }}>
              <input
                type="radio"
                name="unit1"
                checked={unit1 === 's'}
                onChange={() => setUnit1('s')}
              /> <span style={{ marginLeft: 4 }}>秒</span>
            </label>
          </div>
          <div style={{ marginBottom: 16 }}>
            <select value={tz1} onChange={e => setTz1(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              {commonZones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <input
              placeholder="自定义时区，例如 Asia/Shanghai"
              value={tz1}
              onChange={e => setTz1(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button onClick={handleToDate} style={{ width: '100%' }}>转换</button>
          {toDateResult && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'left' }}>
              <div style={{ marginBottom: 4 }}><strong>ISO:</strong> <code>{toDateResult.iso}</code></div>
              <div style={{ marginBottom: 4 }}><strong>格式化:</strong> <code>{toDateResult.formatted}</code></div>
              <div><strong>时区:</strong> <code>{toDateResult.zone}</code></div>
            </div>
          )}
        </div>
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>日期 → 时间戳</h3>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="例如 2024-12-26 12:00:00 或 ISO 字符串"
              value={dateInput}
              onChange={e => setDateInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 12 }}>
            <input
              placeholder="可选格式，例如 yyyy-LL-dd HH:mm:ss"
              value={formatInput}
              onChange={e => setFormatInput(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <select value={tz2} onChange={e => setTz2(e.target.value)} style={{ width: '100%', marginBottom: 8 }}>
              {commonZones.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
            <input
              placeholder="自定义时区，例如 Asia/Shanghai"
              value={tz2}
              onChange={e => setTz2(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>
          <button onClick={handleToTimestamp} style={{ width: '100%' }}>转换</button>
          {toTsResult && (
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 6, textAlign: 'left' }}>
              <div style={{ marginBottom: 4 }}><strong>毫秒:</strong> <code>{toTsResult.timestamp_ms}</code></div>
              <div style={{ marginBottom: 4 }}><strong>秒:</strong> <code>{toTsResult.timestamp_s}</code></div>
              <div><strong>UTC ISO:</strong> <code>{toTsResult.iso}</code></div>
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

function JsonTool() {
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
      setError('JSON 解析失败: ' + e.message)
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
      setError('JSON 解析失败: ' + e.message)
    }
  }
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output || input)
    } catch {
      setError('复制失败')
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>JSON 格式化</h2>
      <div className="tool-grid">
        <div className="tool-panel">
          <textarea
            placeholder='在此粘贴 JSON'
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
              >Tree</button>
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
              >Text</button>
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
        <button onClick={format}>格式化</button>
        <button onClick={minify}>压缩</button>
        <button onClick={copy}>复制</button>
        <button onClick={clear} style={{ backgroundColor: '#ef5350' }}>清空</button>
      </div>
      {error && <div style={{ color: '#d32f2f', marginTop: 16, padding: 12, background: '#ffebee', borderRadius: 6 }}>{error}</div>}
    </div>
  )
}

function JwtTool() {
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
        setError('解码请求失败')
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
      setError('payload 需要合法的 JSON: ' + e.message)
    }
  }

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>JWT 工具</h2>
      <div className="tool-grid">
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>解码 Token</h3>
          <textarea
            placeholder="粘贴 JWT Token"
            value={tokenInput}
            onChange={e => setTokenInput(e.target.value)}
            rows={8}
            style={{ width: '100%', fontFamily: 'monospace', marginBottom: 16 }}
          />
          {decoded && (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#444' }}>Header:</div>
              <div style={{ border: '1px solid #ddd', padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                <CodeWithLineNumbers text={JSON.stringify(decoded.header, null, 2)} />
              </div>
              <div style={{ fontWeight: 600, marginTop: 12, marginBottom: 4, color: '#444' }}>Payload:</div>
              <div style={{ border: '1px solid #ddd', padding: 8, background: '#f9f9f9', borderRadius: 4 }}>
                <CodeWithLineNumbers text={JSON.stringify(decoded.payload, null, 2)} />
              </div>
            </div>
          )}
        </div>
        <div className="tool-panel">
          <h3 style={{ marginTop: 0 }}>生成 Token</h3>
          <textarea
            placeholder="payload JSON"
            value={payloadInput}
            onChange={e => setPayloadInput(e.target.value)}
            rows={10}
            style={{ width: '100%', fontFamily: 'monospace', marginBottom: 12 }}
          />
          <input
            placeholder="密钥"
            value={secretInput}
            onChange={e => setSecretInput(e.target.value)}
            style={{ width: '100%', padding: 8, marginBottom: 16 }}
          />
          <div>
            <button onClick={handleEncode} style={{ width: '100%' }}>生成</button>
          </div>
          {encoded && (
            <div style={{ marginTop: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 4, color: '#444' }}>Token:</div>
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
  const [active, setActive] = useState('timestamp')
  return (
    <div id="root-app">
      <h1>我的工具集</h1>
      <SectionTabs active={active} onChange={setActive} />
      {active === 'timestamp' && <TimestampTool />}
      {active === 'json' && <JsonTool />}
      {active === 'jwt' && <JwtTool />}
    </div>
  )
}

export default App
