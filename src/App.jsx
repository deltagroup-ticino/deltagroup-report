// ╔══════════════════════════════════════════════════════════════════╗
// ║  DELTAgroup REPORT — App Collaboratore v1.0                     ║
// ║  PWA mobile-first · Verde #1B6B1B                               ║
// ║  Supabase: golheevkvfqcpgovnawj                                  ║
// ╚══════════════════════════════════════════════════════════════════╝
const SUPABASE_URL = "https://golheevkvfqcpgovnawj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGhlZXZrdmZxY3Bnb3ZuYXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDIwODMsImV4cCI6MjA4OTgxODA4M30.M6S4oxVB112VBj9CZ8ZSFW79Kz7rJGs9tk1qpGhneWI";
const APP_VERSION = 'v1.0';
const GREEN = '#1B6B1B';
const GREEN_LIGHT = '#eaf3de';
const REGULATION_VERSION = 1; // Incrementare quando si aggiorna il regolamento

import { useState, useEffect, useRef, useCallback } from "react";

// ── SUPABASE CLIENT ────────────────────────────────────────────────
let _sb = null;
async function sb() {
  if (_sb) return _sb;
  if (!window.supabase) {
    await new Promise((res, rej) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js';
      s.onload = res; s.onerror = rej;
      document.head.appendChild(s);
    });
  }
  _sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  return _sb;
}

// ── SESSION STORAGE ────────────────────────────────────────────────
const SESSION_KEY = 'drCollab';
function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; } }
function saveSession(data) { localStorage.setItem(SESSION_KEY, JSON.stringify(data)); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

// ── UTILS ──────────────────────────────────────────────────────────
const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const toISO = (ddmmyyyy) => { const [d,m,y] = ddmmyyyy.split('/'); return `${y}-${m}-${d}`; };
const fromISO = (iso) => { const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
const isLate = (serviceDateISO) => { const svc = new Date(serviceDateISO + 'T00:00:00'); const now = new Date(); now.setHours(0,0,0,0); return svc < now; };
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

// ── STILI GLOBALI ─────────────────────────────────────────────────
const GS = {
  header: { background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 500 },
  body: { background: '#f5f5f5', minHeight: '100vh' },
  card: { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '0.5px solid #e0e0e0' },
  label: { fontSize: 11, color: '#666', marginBottom: 4, fontWeight: 500 },
  input: { width: '100%', padding: '11px 13px', border: '0.5px solid #ccc', borderRadius: 9, fontSize: 15, boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit', outline: 'none', WebkitAppearance: 'none' },
  btnGreen: { width: '100%', padding: 15, background: GREEN, color: '#fff', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit' },
  btnOutline: { width: '100%', padding: 13, background: 'none', border: `1.5px solid ${GREEN}`, borderRadius: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer', color: GREEN, fontFamily: 'inherit' },
  btnGray: { width: '100%', padding: 13, background: 'none', border: '0.5px solid #ccc', borderRadius: 11, fontSize: 14, cursor: 'pointer', color: '#555', fontFamily: 'inherit' },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '18px 0 8px' },
};

// ── APP NAME ───────────────────────────────────────────────────────
function AppName({ size = 'md' }) {
  const big = size === 'lg' ? 20 : 16;
  const small = size === 'lg' ? 14 : 11;
  const gap = size === 'lg' ? 10 : 7;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 0 }}>
      <span style={{ fontSize: big, fontWeight: 700, color: '#fff', letterSpacing: 0.5 }}>DELTA</span>
      <span style={{ fontSize: small, fontWeight: 400, color: 'rgba(255,255,255,0.85)' }}>group</span>
      <span style={{ fontSize: big, fontWeight: 700, color: '#fff', letterSpacing: 1.5, marginLeft: gap }}>REPORT</span>
    </span>
  );
}

// ── LOGO TRIANGOLO ────────────────────────────────────────────────
function Logo({ size = 60, bg = 'rgba(255,255,255,0.12)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill={bg} />
      <polygon points="30,11 53,49 7,49" fill="none" stroke="white" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// ── BOTTOM NAV ────────────────────────────────────────────────────
function BottomNav({ active, onHome, onNew, onArchive }) {
  const btn = (label, icon, isActive, onClick) => (
    <button onClick={onClick} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0 4px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
      <span style={{ fontSize: 22, lineHeight: 1 }}>{icon}</span>
      <span style={{ fontSize: 10, color: isActive ? GREEN : '#999', fontFamily: 'inherit', fontWeight: isActive ? 600 : 400 }}>{label}</span>
    </button>
  );
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid #e0e0e0', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {btn('Home', '🏠', active === 'home', onHome)}
      {btn('Rapporto', '📋', active === 'new', onNew)}
      {btn('Archivio', '📁', active === 'archive', onArchive)}
    </div>
  );
}

// ── SIGNATURE CANVAS (fullscreen, scroll bloccato) ─────────────────
function SignatureOverlay({ title, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPos = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      ctx.strokeStyle = '#111';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
    };
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches ? e.touches[0] : e;
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top };
  };

  const startDraw = (e) => {
    e.preventDefault();
    isDrawing.current = true;
    const canvas = canvasRef.current;
    lastPos.current = getPos(e, canvas);
  };

  const draw = (e) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = (e) => { e.preventDefault(); isDrawing.current = false; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight);
  };

  const confirm = () => {
    const canvas = canvasRef.current;
    const dataURL = canvas.toDataURL('image/png');
    onConfirm(dataURL);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: '#fff', zIndex: 9999, display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: GREEN, padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#fff', fontSize: 16, fontWeight: 500 }}>{title}</span>
        <button onClick={onCancel} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, color: '#fff', padding: '6px 12px', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Annulla</button>
      </div>
      <div style={{ padding: '10px 16px', display: 'flex', justifyContent: 'flex-end' }}>
        <button onClick={clear} style={{ background: 'none', border: '0.5px solid #ccc', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13, color: '#555', fontFamily: 'inherit' }}>Cancella</button>
      </div>
      <canvas
        ref={canvasRef}
        style={{ flex: 1, touchAction: 'none', cursor: 'crosshair', display: 'block', width: '100%', borderTop: '1px solid #eee', borderBottom: '1px solid #eee' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw}
      />
      <div style={{ padding: '12px 16px', paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
        <button onClick={confirm} style={{ ...GS.btnGreen }}>Conferma firma</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: SPLASH
// ═══════════════════════════════════════════════════════════════════
function SplashScreen({ onDone }) {
  useEffect(() => { setTimeout(onDone, 1800); }, []);
  return (
    <div style={{ minHeight: '100vh', background: GREEN, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Logo size={80} />
      <div style={{ marginTop: 20 }}><AppName size="lg" /></div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: LOGIN (PIN)
// ═══════════════════════════════════════════════════════════════════
function LoginScreen({ onLogin, onFirstAccess }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const addDigit = (d) => { if (pin.length < 6) setPin(p => p + d); };
  const delDigit = () => setPin(p => p.slice(0, -1));

  const handleLogin = async () => {
    if (pin.length < 6) return;
    setLoading(true); setError('');
    try {
      const c = await sb();
      const { data } = await c.from('report_collaborators').select('*').eq('pin', pin).eq('is_active', true).single();
      if (!data) { setError('PIN non riconosciuto. Riprova.'); setPin(''); setLoading(false); return; }
      if (!data.pin_revealed) { setError('Accesso non completato. Usa "Primo accesso".'); setPin(''); setLoading(false); return; }
      saveSession({ collabId: data.id, collabName: data.agent_name, regulationVersion: data.regulation_version });
      onLogin(data);
    } catch { setError('Errore di connessione. Riprova.'); setLoading(false); }
  };

  useEffect(() => { if (pin.length === 6) handleLogin(); }, [pin]);

  const dots = Array(6).fill(0).map((_, i) => (
    <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: i < pin.length ? GREEN : '#ddd' }} />
  ));

  const numPad = [1,2,3,4,5,6,7,8,9,'',0,'⌫'];

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: GREEN, padding: '44px 24px 32px', textAlign: 'center' }}>
        <Logo size={64} />
        <div style={{ marginTop: 14 }}><AppName size="lg" /></div>
      </div>
      <div style={{ padding: '28px 24px' }}>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 20 }}>Inserisci il tuo PIN personale</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>{dots}</div>
        {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 280, margin: '0 auto 20px' }}>
          {numPad.map((n, i) => {
            if (n === '') return <div key={i} />;
            if (n === '⌫') return (
              <button key={i} onClick={delDigit} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#f0f0f0', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit' }}>⌫</button>
            );
            return (
              <button key={i} onClick={() => addDigit(String(n))} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#fff', fontSize: 20, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>
            );
          })}
        </div>
        {loading && <p style={{ textAlign: 'center', color: GREEN, fontSize: 13 }}>Accesso in corso…</p>}
        <button onClick={onFirstAccess} style={{ ...GS.btnOutline, marginTop: 8 }}>Primo accesso</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: PRIMO ACCESSO
// ═══════════════════════════════════════════════════════════════════
function FirstAccessScreen({ onBack, onPinRevealed }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState('search'); // search | pin | confirm
  const [collabData, setCollabData] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const searchName = async () => {
    if (!name.trim()) return;
    setLoading(true); setError('');
    try {
      const c = await sb();
      const { data } = await c.from('report_collaborators').select('*').ilike('agent_name', `%${name.trim()}%`).eq('is_active', true);
      if (!data || data.length === 0) { setError('Nessun collaboratore trovato con questo nome. Contatta l\'ufficio.'); setLoading(false); return; }
      if (data.length > 1) { setError('Più collaboratori trovati con questo nome. Contatta l\'ufficio per il tuo PIN.'); setLoading(false); return; }
      const collab = data[0];
      if (collab.pin_revealed) { setError('Il PIN per questo account è già stato visualizzato. Contatta l\'ufficio se hai dimenticato il PIN.'); setLoading(false); return; }
      setCollabData(collab);
      await c.from('report_collaborators').update({ pin_revealed: true, pin_revealed_at: new Date().toISOString() }).eq('id', collab.id);
      setStep('pin');
    } catch { setError('Errore di connessione. Riprova.'); }
    setLoading(false);
  };

  const confirmPin = async () => {
    if (pinInput !== collabData.pin) { setError('PIN errato. Riprova.'); return; }
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={GS.backBtn}>←</button>
          <AppName />
        </div>
        <div style={{ padding: '40px 24px', textAlign: 'center' }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: 30 }}>✅</div>
          <h2 style={{ fontSize: 18, fontWeight: 500, marginBottom: 8, color: '#111' }}>Accesso configurato</h2>
          <p style={{ color: '#555', fontSize: 14, marginBottom: 24 }}>Benvenuto/a, <strong>{collabData.agent_name}</strong></p>
          <button onClick={() => onPinRevealed(collabData)} style={GS.btnGreen}>Continua</button>
        </div>
      </div>
    );
  }

  if (step === 'pin') {
    const dots = Array(6).fill(0).map((_, i) => (
      <div key={i} style={{ width: 13, height: 13, borderRadius: '50%', background: i < pinInput.length ? GREEN : '#ddd' }} />
    ));
    const numPad = [1,2,3,4,5,6,7,8,9,'',0,'⌫'];
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <button onClick={onBack} style={GS.backBtn}>←</button>
          <AppName />
        </div>
        <div style={{ padding: '24px' }}>
          <div style={{ background: GREEN_LIGHT, borderRadius: 12, padding: '16px 18px', marginBottom: 24, border: `1px solid ${GREEN}33` }}>
            <p style={{ color: '#1a5c1a', fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Il tuo PIN è:</p>
            <p style={{ color: GREEN, fontSize: 36, fontWeight: 700, letterSpacing: 8, margin: '8px 0' }}>{collabData.pin}</p>
            <p style={{ color: '#555', fontSize: 12 }}>⚠️ Annotalo subito — non verrà mostrato di nuovo.</p>
          </div>
          <p style={{ textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 18 }}>Inserisci il PIN per confermare</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 20 }}>{dots}</div>
          {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{error}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 280, margin: '0 auto 16px' }}>
            {numPad.map((n, i) => {
              if (n === '') return <div key={i} />;
              if (n === '⌫') return <button key={i} onClick={() => setPinInput(p => p.slice(0,-1))} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#f0f0f0', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit' }}>⌫</button>;
              return <button key={i} onClick={() => { if(pinInput.length < 6) setPinInput(p => p + n); }} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#fff', fontSize: 20, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>;
            })}
          </div>
          <button onClick={confirmPin} disabled={pinInput.length < 6} style={{ ...GS.btnGreen, opacity: pinInput.length < 6 ? 0.5 : 1 }}>Conferma</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button onClick={onBack} style={GS.backBtn}>←</button>
        <AppName />
      </div>
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: 6, color: '#111' }}>Primo accesso</h2>
        <p style={{ color: '#666', fontSize: 13, marginBottom: 20 }}>Inserisci il tuo Cognome e Nome come registrato in azienda.</p>
        <div style={{ marginBottom: 10 }}>
          <div style={GS.label}>Cognome e Nome</div>
          <input style={GS.input} value={name} onChange={e => setName(e.target.value)} placeholder="Es. STEFANONI Marco" onKeyDown={e => e.key === 'Enter' && searchName()} />
        </div>
        {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <button onClick={searchName} disabled={loading || !name.trim()} style={{ ...GS.btnGreen, opacity: loading || !name.trim() ? 0.5 : 1, marginBottom: 10 }}>
          {loading ? 'Ricerca in corso…' : 'Cerca'}
        </button>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>Se hai già visualizzato il PIN, usa il login normale oppure contatta l'ufficio.</p>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: REGOLAMENTO
// ═══════════════════════════════════════════════════════════════════
function RegulationScreen({ collab, onAccepted }) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [regulation, setRegulation] = useState('Caricamento regolamento…');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    sb().then(c => c.from('report_regulations').select('content').order('version', { ascending: false }).limit(1).single()).then(({ data }) => {
      if (data) setRegulation(data.content);
    });
  }, []);

  const handleScroll = (e) => {
    const el = e.target;
    if (el.scrollHeight - el.scrollTop <= el.clientHeight + 30) setScrolled(true);
  };

  const accept = async () => {
    setLoading(true);
    const c = await sb();
    await c.from('report_collaborators').update({ regulation_accepted: true, regulation_accepted_at: new Date().toISOString(), regulation_version: REGULATION_VERSION }).eq('id', collab.id);
    saveSession({ collabId: collab.id, collabName: collab.agent_name, regulationVersion: REGULATION_VERSION });
    onAccepted();
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column' }}>
      <div style={{ background: GREEN, padding: '13px 16px' }}>
        <AppName />
        <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 4 }}>Regolamento compilazione rapporti</div>
      </div>
      <div style={{ padding: '16px 16px 0', color: '#555', fontSize: 13 }}>
        <strong style={{ color: '#111' }}>Prima di continuare, leggi e accetta il regolamento.</strong> Scorri fino in fondo per abilitare il pulsante.
      </div>
      <div ref={scrollRef} onScroll={handleScroll} style={{ flex: 1, overflow: 'auto', margin: 16, background: '#fff', borderRadius: 12, padding: '16px', border: '0.5px solid #e0e0e0', fontSize: 13, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 'calc(100vh - 260px)' }}>
        {regulation}
      </div>
      <div style={{ padding: '0 16px 16px', paddingBottom: 'calc(16px + env(safe-area-inset-bottom))' }}>
        {!scrolled && <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 10 }}>↓ Scorri fino in fondo per continuare</p>}
        {scrolled && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, cursor: 'pointer' }}>
            <input type="checkbox" checked={checked} onChange={e => setChecked(e.target.checked)} style={{ width: 20, height: 20, accentColor: GREEN }} />
            <span style={{ fontSize: 13, color: '#333' }}>Ho letto e accetto il regolamento</span>
          </label>
        )}
        <button onClick={accept} disabled={!scrolled || !checked || loading} style={{ ...GS.btnGreen, opacity: !scrolled || !checked || loading ? 0.4 : 1 }}>
          {loading ? 'Salvataggio…' : 'Accetta e continua'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: HOME
// ═══════════════════════════════════════════════════════════════════
function HomeScreen({ collab, onNew, onArchive, onLogout }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    sb().then(c => c.from('dr_reports').select('id,report_number,service_date,client_name,address,report_type').eq('submitted_by_id', collab.id).order('service_date', { ascending: false }).limit(5)).then(({ data }) => {
      if (data) setRecent(data);
    });
  }, []);

  return (
    <div style={{ ...GS.body, paddingBottom: 70 }}>
      <div style={{ background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <AppName />
          <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 }}>{collab.agent_name}</div>
        </div>
        <button onClick={onLogout} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, color: '#fff', padding: '5px 10px', cursor: 'pointer', fontSize: 12, fontFamily: 'inherit' }}>Esci</button>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <button onClick={onNew} style={{ ...GS.btnGreen, marginBottom: 20, fontSize: 16, padding: 17 }}>
          <span style={{ fontSize: 22 }}>📋</span> Nuovo Rapporto
        </button>

        <div style={GS.sectionLabel}>Ultimi rapporti inviati</div>
        {recent.length === 0 && <p style={{ color: '#888', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Nessun rapporto ancora inviato.</p>}
        {recent.map(r => (
          <div key={r.id} style={GS.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
              <div style={{ fontWeight: 500, fontSize: 14 }}>{r.client_name}</div>
              <div style={{ fontSize: 11, color: '#999' }}>{fromISO(r.service_date)}</div>
            </div>
            <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>{r.address}</div>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 500, background: r.report_type === 'pdf_firma' ? GREEN_LIGHT : '#f0f0f0', color: r.report_type === 'pdf_firma' ? '#1a5c1a' : '#555' }}>
              {r.report_type === 'pdf_firma' ? 'PDF – Firma cliente' : 'Solo testo'}
            </span>
          </div>
        ))}
        {recent.length > 0 && <button onClick={onArchive} style={{ ...GS.btnGray, marginTop: 4 }}>Vedi archivio completo →</button>}
      </div>

      <BottomNav active="home" onHome={() => {}} onNew={onNew} onArchive={onArchive} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: SCELTA TIPO RAPPORTO
// ═══════════════════════════════════════════════════════════════════
function ReportTypeScreen({ onBack, onSelect }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ ...GS.header }}>
        <button onClick={onBack} style={GS.backBtn}>←</button>
        <span style={GS.headerTitle}>Nuovo Rapporto</span>
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>Seleziona il tipo di rapporto da compilare:</p>
        <div onClick={() => onSelect('pdf_firma')} style={{ ...GS.card, cursor: 'pointer', border: `1.5px solid ${GREEN}`, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📋</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 500, marginBottom: 4 }}>PDF – Con firma cliente</div>
              <div style={{ fontSize: 12, color: '#777' }}>Genera un rapporto in formato PDF con firma digitale del cliente.</div>
            </div>
          </div>
        </div>
        <div onClick={() => onSelect('solo_testo')} style={{ ...GS.card, cursor: 'pointer', border: '1.5px solid #ccc' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📝</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: '#555', fontWeight: 500, marginBottom: 4 }}>Solo testo · Nessuna firma cliente</div>
              <div style={{ fontSize: 12, color: '#777' }}>Comunicazione del servizio svolto senza firma del cliente.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: FORM RAPPORTO
// ═══════════════════════════════════════════════════════════════════
function ReportFormScreen({ collab, reportType, onBack, onNext }) {
  const [agents, setAgents] = useState([]);
  const [allAgents, setAllAgents] = useState([]);
  const [agentSearch, setAgentSearch] = useState('');
  const [showAgentSearch, setShowAgentSearch] = useState(false);
  const [form, setForm] = useState({ serviceDate: today(), clientName: '', location: '', address: '', startTime: '', endTime: '', hasBreak: false, breakCoveredBy: '', breakStart: '', breakEnd: '', notes: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    sb().then(c => c.from('report_collaborators').select('id,agent_name').eq('is_active', true).order('agent_name')).then(({ data }) => {
      if (data) {
        setAllAgents(data);
        const me = data.find(a => a.id === collab.id);
        if (me) setAgents([me]);
      }
    });
  }, []);

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const addAgent = (ag) => { if (!agents.find(a => a.id === ag.id)) setAgents(p => [...p, ag]); setShowAgentSearch(false); setAgentSearch(''); };
  const removeAgent = (id) => { if (id !== collab.id) setAgents(p => p.filter(a => a.id !== id)); };

  const validate = () => {
    const e = {};
    if (!form.serviceDate) e.serviceDate = 'Obbligatorio';
    if (!form.clientName.trim()) e.clientName = 'Obbligatorio';
    if (!form.location.trim()) e.location = 'Obbligatorio';
    if (!form.address.trim()) e.address = 'Obbligatorio';
    if (!form.startTime) e.startTime = 'Obbligatorio';
    if (!form.endTime) e.endTime = 'Obbligatorio';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const filteredAgents = allAgents.filter(a => !agents.find(ag => ag.id === a.id) && a.agent_name.toLowerCase().includes(agentSearch.toLowerCase()));

  return (
    <div style={{ ...GS.body, paddingBottom: 20 }}>
      <div style={GS.header}>
        <button onClick={onBack} style={GS.backBtn}>←</button>
        <span style={GS.headerTitle}>
          {reportType === 'pdf_firma' ? 'Rapporto PDF – Firma cliente' : 'Rapporto Solo testo'}
        </span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Data */}
        <div style={GS.card}>
          <div style={GS.label}>Data servizio *</div>
          <input style={{ ...GS.input, borderColor: errors.serviceDate ? '#e24b4a' : '#ccc' }} type="date" value={form.serviceDate ? toISO(form.serviceDate) : ''} onChange={e => upd('serviceDate', fromISO(e.target.value))} />
          {errors.serviceDate && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.serviceDate}</div>}
        </div>

        {/* Agenti */}
        <div style={GS.card}>
          <div style={GS.label}>Agenti *</div>
          {agents.map(ag => (
            <div key={ag.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 11px', background: '#f5f5f5', borderRadius: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 14 }}>{ag.agent_name}</span>
              {ag.id !== collab.id && <button onClick={() => removeAgent(ag.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', fontSize: 16, padding: '0 4px' }}>✕</button>}
            </div>
          ))}
          <button onClick={() => setShowAgentSearch(true)} style={{ width: '100%', padding: '8px', border: '0.5px dashed #aaa', borderRadius: 8, background: 'none', color: GREEN, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>+ Aggiungi agente</button>
          {showAgentSearch && (
            <div style={{ marginTop: 8 }}>
              <input style={GS.input} value={agentSearch} onChange={e => setAgentSearch(e.target.value)} placeholder="Cerca agente…" autoFocus />
              <div style={{ maxHeight: 180, overflowY: 'auto', border: '0.5px solid #ddd', borderRadius: 8, marginTop: 4 }}>
                {filteredAgents.slice(0, 20).map(ag => (
                  <div key={ag.id} onClick={() => addAgent(ag)} style={{ padding: '10px 13px', cursor: 'pointer', fontSize: 13, borderBottom: '0.5px solid #f0f0f0' }}>{ag.agent_name}</div>
                ))}
                {filteredAgents.length === 0 && <div style={{ padding: '10px 13px', color: '#888', fontSize: 12 }}>Nessun risultato</div>}
              </div>
              <button onClick={() => setShowAgentSearch(false)} style={{ ...GS.btnGray, marginTop: 6, padding: 8, fontSize: 12 }}>Annulla</button>
            </div>
          )}
        </div>

        {/* Cliente, Luogo, Indirizzo */}
        <div style={GS.card}>
          <div style={{ marginBottom: 12 }}>
            <div style={GS.label}>Cliente *</div>
            <input style={{ ...GS.input, borderColor: errors.clientName ? '#e24b4a' : '#ccc' }} value={form.clientName} onChange={e => upd('clientName', e.target.value)} placeholder="Nome cliente" />
            {errors.clientName && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.clientName}</div>}
          </div>
          <div style={{ marginBottom: 12 }}>
            <div style={GS.label}>Luogo *</div>
            <input style={{ ...GS.input, borderColor: errors.location ? '#e24b4a' : '#ccc' }} value={form.location} onChange={e => upd('location', e.target.value)} placeholder="Città / Comune" />
            {errors.location && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.location}</div>}
          </div>
          <div>
            <div style={GS.label}>Indirizzo *</div>
            <input style={{ ...GS.input, borderColor: errors.address ? '#e24b4a' : '#ccc' }} value={form.address} onChange={e => upd('address', e.target.value)} placeholder="Via e numero civico" />
            {errors.address && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.address}</div>}
          </div>
        </div>

        {/* Orari */}
        <div style={GS.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: form.hasBreak ? 14 : 0 }}>
            <div>
              <div style={GS.label}>Inizio servizio *</div>
              <input style={{ ...GS.input, borderColor: errors.startTime ? '#e24b4a' : '#ccc' }} type="time" value={form.startTime} onChange={e => upd('startTime', e.target.value)} />
              {errors.startTime && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.startTime}</div>}
            </div>
            <div>
              <div style={GS.label}>Fine servizio *</div>
              <input style={{ ...GS.input, borderColor: errors.endTime ? '#e24b4a' : '#ccc' }} type="time" value={form.endTime} onChange={e => upd('endTime', e.target.value)} />
              {errors.endTime && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.endTime}</div>}
            </div>
          </div>

          <div style={{ borderTop: form.hasBreak ? '0.5px solid #eee' : 'none', paddingTop: form.hasBreak ? 14 : 0 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input type="checkbox" checked={form.hasBreak} onChange={e => upd('hasBreak', e.target.checked)} style={{ width: 18, height: 18, accentColor: GREEN }} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Pausa effettuata</span>
            </label>
            {form.hasBreak && (
              <div style={{ marginTop: 12 }}>
                <div style={{ marginBottom: 10 }}>
                  <div style={GS.label}>Coperta da (nome agente)</div>
                  <input style={GS.input} value={form.breakCoveredBy} onChange={e => upd('breakCoveredBy', e.target.value)} placeholder="Nome agente" />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div><div style={GS.label}>Inizio pausa</div><input style={GS.input} type="time" value={form.breakStart} onChange={e => upd('breakStart', e.target.value)} /></div>
                  <div><div style={GS.label}>Fine pausa</div><input style={GS.input} type="time" value={form.breakEnd} onChange={e => upd('breakEnd', e.target.value)} /></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Osservazioni */}
        <div style={GS.card}>
          <div style={GS.label}>Osservazioni</div>
          <textarea style={{ ...GS.input, height: 90, resize: 'none' }} value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Note, descrizione del servizio svolto…" />
        </div>

        <button onClick={() => { if (validate()) onNext({ form, agents }); }} style={GS.btnGreen}>
          {reportType === 'pdf_firma' ? 'Anteprima e Firma →' : 'Anteprima →'}
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: ANTEPRIMA + FIRMA
// ═══════════════════════════════════════════════════════════════════
function PreviewScreen({ collab, reportType, formData, reportNumber, onBack, onSubmit }) {
  const { form, agents } = formData;
  const [agentSig, setAgentSig] = useState(null);
  const [clientSig, setClientSig] = useState(null);
  const [clientSignerName, setClientSignerName] = useState('');
  const [showSigOverlay, setShowSigOverlay] = useState(null); // 'agent' | 'client'
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = reportType === 'pdf_firma'
    ? agentSig && clientSig && clientSignerName.trim()
    : agentSig;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const c = await sb();
      const svcDateISO = toISO(form.serviceDate);
      const { data: rpt, error: err } = await c.rpc('next_report_number').then(async () => {
        const { data: num } = await c.rpc('next_report_number');
        return c.from('dr_reports').insert({
          report_number: num,
          report_type: reportType,
          service_date: svcDateISO,
          is_late: isLate(svcDateISO),
          submitted_by_id: collab.id,
          submitted_by_name: collab.agent_name,
          agents_json: agents.map(a => ({ id: a.id, name: a.agent_name })),
          client_name: form.clientName,
          location: form.location,
          address: form.address,
          start_time: form.startTime,
          end_time: form.endTime,
          has_break: form.hasBreak,
          break_covered_by: form.breakCoveredBy || null,
          break_start: form.breakStart || null,
          break_end: form.breakEnd || null,
          notes: form.notes || null,
          agent_signature: agentSig,
          client_signature: reportType === 'pdf_firma' ? clientSig : null,
          client_signer_name: reportType === 'pdf_firma' ? clientSignerName : null,
          status: 'submitted',
        }).select().single();
      });
      if (err) throw err;
      onSubmit(rpt);
    } catch (e) { setError('Errore durante l\'invio. Riprova.'); console.error(e); }
    setSubmitting(false);
  };

  const Row = ({ label, value }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: '#888', marginBottom: 1 }}>{label}</div>
      <div style={{ fontSize: 13, color: '#111' }}>{value || '—'}</div>
    </div>
  );

  return (
    <div style={{ ...GS.body, paddingBottom: 20 }}>
      {showSigOverlay && (
        <SignatureOverlay
          title={showSigOverlay === 'agent' ? 'Firma Agente' : 'Firma Cliente'}
          onConfirm={(dataURL) => {
            if (showSigOverlay === 'agent') setAgentSig(dataURL);
            else setClientSig(dataURL);
            setShowSigOverlay(null);
          }}
          onCancel={() => setShowSigOverlay(null)}
        />
      )}

      <div style={GS.header}>
        <button onClick={onBack} style={GS.backBtn}>←</button>
        <span style={GS.headerTitle}>Anteprima</span>
      </div>

      <div style={{ padding: 16 }}>
        {/* Riepilogo rapporto */}
        <div style={{ ...GS.card, background: '#fafafa' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, paddingBottom: 10, borderBottom: '0.5px solid #eee' }}>
            <div>
              <div style={{ fontSize: 10, color: '#888', letterSpacing: 0.5 }}>RAPPORTO DI SERVIZIO</div>
              <div style={{ fontSize: 13, fontWeight: 500 }}>DELTAgroup REPORT</div>
            </div>
            <div style={{ fontSize: 13, color: '#888' }}>#{reportNumber || '…'}</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            <Row label="Data" value={form.serviceDate} />
            <Row label="Agenti" value={agents.map(a => a.agent_name).join(', ')} />
            <div style={{ gridColumn: '1/-1' }}><Row label="Cliente" value={form.clientName} /></div>
            <Row label="Luogo" value={form.location} />
            <Row label="Indirizzo" value={form.address} />
            <Row label="Inizio" value={form.startTime} />
            <Row label="Fine" value={form.endTime} />
            {form.hasBreak && <Row label="Pausa" value={`${form.breakStart}–${form.breakEnd} (${form.breakCoveredBy})`} />}
            {form.notes && <div style={{ gridColumn: '1/-1' }}><Row label="Osservazioni" value={form.notes} /></div>}
          </div>
          <div style={{ marginTop: 8 }}>
            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 5, fontWeight: 500, background: reportType === 'pdf_firma' ? GREEN_LIGHT : '#f0f0f0', color: reportType === 'pdf_firma' ? '#1a5c1a' : '#555' }}>
              {reportType === 'pdf_firma' ? 'PDF – Con firma cliente' : 'Solo testo'}
            </span>
          </div>
        </div>

        {/* Firma agente */}
        <div style={GS.card}>
          <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Firma Agente</div>
          {agentSig
            ? <div style={{ position: 'relative' }}>
                <img src={agentSig} style={{ width: '100%', height: 80, objectFit: 'contain', border: '0.5px solid #eee', borderRadius: 8 }} />
                <button onClick={() => { setAgentSig(null); setShowSigOverlay('agent'); }} style={{ position: 'absolute', top: 4, right: 4, background: '#fff', border: '0.5px solid #ddd', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Rifai</button>
              </div>
            : <button onClick={() => setShowSigOverlay('agent')} style={{ width: '100%', height: 80, border: '1.5px dashed #ccc', borderRadius: 9, background: '#fafafa', cursor: 'pointer', color: '#888', fontSize: 13, fontFamily: 'inherit' }}>Tocca per firmare</button>
          }
        </div>

        {/* Firma cliente (solo pdf_firma) */}
        {reportType === 'pdf_firma' && (
          <div style={{ ...GS.card, border: `1px solid ${GREEN}33` }}>
            <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 10 }}>Firma Cliente</div>
            <div style={{ marginBottom: 10 }}>
              <div style={GS.label}>Nome e Cognome in stampatello</div>
              <input style={GS.input} value={clientSignerName} onChange={e => setClientSignerName(e.target.value.toUpperCase())} placeholder="Es. ROSSI MARIO" />
            </div>
            {clientSig
              ? <div style={{ position: 'relative' }}>
                  <img src={clientSig} style={{ width: '100%', height: 80, objectFit: 'contain', border: '0.5px solid #eee', borderRadius: 8 }} />
                  <button onClick={() => { setClientSig(null); setShowSigOverlay('client'); }} style={{ position: 'absolute', top: 4, right: 4, background: '#fff', border: '0.5px solid #ddd', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', fontSize: 11 }}>Rifai</button>
                </div>
              : <button onClick={() => setShowSigOverlay('client')} style={{ width: '100%', height: 80, border: '1.5px dashed #aaa', borderRadius: 9, background: '#fafafa', cursor: 'pointer', color: '#666', fontSize: 13, fontFamily: 'inherit' }}>Il cliente firma qui</button>
            }
            <div style={{ fontSize: 10, color: '#999', textAlign: 'center', marginTop: 6 }}>Con la firma si conferma l'impiego svolto e l'esattezza dei dati</div>
          </div>
        )}

        {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <button onClick={handleSubmit} disabled={!canSubmit || submitting} style={{ ...GS.btnGreen, opacity: !canSubmit || submitting ? 0.5 : 1 }}>
          {submitting ? 'Invio in corso…' : '📤 Invia Rapporto'}
        </button>
        {!canSubmit && <p style={{ fontSize: 11, color: '#888', textAlign: 'center', marginTop: 8 }}>
          {reportType === 'pdf_firma' ? 'Completa firma agente, firma cliente e nome prima di inviare.' : 'Completa la firma agente prima di inviare.'}
        </p>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: SUCCESSO INVIO
// ═══════════════════════════════════════════════════════════════════
function SuccessScreen({ report, onHome, onArchive }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: 70, height: 70, borderRadius: '50%', background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 18 }}>✅</div>
      <div style={{ fontSize: 20, fontWeight: 500, marginBottom: 6, color: '#111' }}>Rapporto inviato</div>
      <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>{report?.report_number}</div>
      <div style={{ background: '#fff', borderRadius: 12, padding: '14px 18px', width: '100%', maxWidth: 340, border: '0.5px solid #e0e0e0', marginBottom: 24, textAlign: 'center' }}>
        <div style={{ fontWeight: 500 }}>{report?.client_name}</div>
        <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{report?.address} · {report?.location}</div>
      </div>
      <button onClick={onHome} style={{ ...GS.btnGreen, maxWidth: 340, marginBottom: 10 }}>Torna alla home</button>
      <button onClick={onArchive} style={{ ...GS.btnGray, maxWidth: 340 }}>Vedi archivio</button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// SCHERMATA: ARCHIVIO
// ═══════════════════════════════════════════════════════════════════
function ArchiveScreen({ collab, onBack, onHome, onNew }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    sb().then(c => c.from('dr_reports').select('id,report_number,service_date,client_name,address,location,start_time,end_time,report_type,submitted_at').eq('submitted_by_id', collab.id).gte('service_date', threeMonthsAgo.toISOString().split('T')[0]).order('service_date', { ascending: false })).then(({ data }) => {
      if (data) setReports(data);
      setLoading(false);
    });
  }, []);

  // Raggruppa per mese
  const grouped = {};
  reports.forEach(r => {
    const d = new Date(r.service_date + 'T12:00:00');
    const key = `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(r);
  });

  return (
    <div style={{ ...GS.body, paddingBottom: 70 }}>
      <div style={GS.header}>
        <button onClick={onBack} style={GS.backBtn}>←</button>
        <span style={GS.headerTitle}>Archivio Rapporti</span>
      </div>
      <div style={{ padding: '16px 16px 0' }}>
        {loading && <p style={{ textAlign: 'center', color: '#888', padding: 30 }}>Caricamento…</p>}
        {!loading && Object.keys(grouped).length === 0 && <p style={{ textAlign: 'center', color: '#888', padding: 30 }}>Nessun rapporto negli ultimi 3 mesi.</p>}
        {Object.entries(grouped).map(([month, rpts]) => (
          <div key={month}>
            <div style={GS.sectionLabel}>{month}</div>
            {rpts.map(r => (
              <div key={r.id} style={GS.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 3 }}>
                  <div style={{ fontWeight: 500, fontSize: 14 }}>{r.client_name}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{fromISO(r.service_date)}</div>
                </div>
                <div style={{ fontSize: 12, color: '#666', marginBottom: 5 }}>{r.address} · {r.start_time && r.endTime ? `${r.start_time}–${r.end_time}` : r.start_time || ''}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 10, color: '#999' }}>{r.report_number}</span>
                  <span style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, fontWeight: 500, background: r.report_type === 'pdf_firma' ? GREEN_LIGHT : '#f0f0f0', color: r.report_type === 'pdf_firma' ? '#1a5c1a' : '#555' }}>
                    {r.report_type === 'pdf_firma' ? 'PDF' : 'Testo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <p style={{ fontSize: 11, color: '#bbb', textAlign: 'center', marginTop: 10 }}>Archivio limitato agli ultimi 3 mesi</p>
      </div>
      <BottomNav active="archive" onHome={onHome} onNew={onNew} onArchive={() => {}} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// APP ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [screen, setScreen] = useState('splash');
  const [collab, setCollab] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [formData, setFormData] = useState(null);
  const [reportNumber, setReportNumber] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);

  // Check sessione esistente
  useEffect(() => {
    const session = getSession();
    if (session) {
      sb().then(c => c.from('report_collaborators').select('*').eq('id', session.collabId).eq('is_active', true).single()).then(({ data }) => {
        if (data) {
          setCollab(data);
          if (!data.regulation_accepted || data.regulation_version < REGULATION_VERSION) {
            setScreen('regulation');
          } else {
            setScreen('home');
          }
        } else {
          clearSession();
          setScreen('login');
        }
      });
    }
  }, []);

  const handleLogin = (data) => {
    setCollab(data);
    if (!data.regulation_accepted || data.regulation_version < REGULATION_VERSION) setScreen('regulation');
    else setScreen('home');
  };

  const handleLogout = () => { clearSession(); setCollab(null); setScreen('login'); };

  // Pre-fetch report number on form entry
  const handleFormNext = async (fd) => {
    setFormData(fd);
    const c = await sb();
    const { data: num } = await c.rpc('next_report_number');
    setReportNumber(num);
    setScreen('preview');
  };

  const handleSubmitted = (rpt) => { setSubmittedReport(rpt); setScreen('success'); };

  const goHome = () => setScreen('home');
  const goArchive = () => setScreen('archive');
  const goNew = () => setScreen('type');

  if (screen === 'splash') return <SplashScreen onDone={() => setScreen(getSession() ? 'checkSession' : 'login')} />;
  if (screen === 'checkSession') return <SplashScreen onDone={() => {}} />;
  if (screen === 'login') return <LoginScreen onLogin={handleLogin} onFirstAccess={() => setScreen('firstAccess')} />;
  if (screen === 'firstAccess') return <FirstAccessScreen onBack={() => setScreen('login')} onPinRevealed={(data) => { setCollab(data); setScreen('regulation'); }} />;
  if (screen === 'regulation') return <RegulationScreen collab={collab} onAccepted={() => { saveSession({ collabId: collab.id, collabName: collab.agent_name, regulationVersion: REGULATION_VERSION }); setScreen('home'); }} />;
  if (screen === 'home') return <HomeScreen collab={collab} onNew={goNew} onArchive={goArchive} onLogout={handleLogout} />;
  if (screen === 'type') return <ReportTypeScreen onBack={goHome} onSelect={(t) => { setReportType(t); setScreen('form'); }} />;
  if (screen === 'form') return <ReportFormScreen collab={collab} reportType={reportType} onBack={() => setScreen('type')} onNext={handleFormNext} />;
  if (screen === 'preview') return <PreviewScreen collab={collab} reportType={reportType} formData={formData} reportNumber={reportNumber} onBack={() => setScreen('form')} onSubmit={handleSubmitted} />;
  if (screen === 'success') return <SuccessScreen report={submittedReport} onHome={goHome} onArchive={goArchive} />;
  if (screen === 'archive') return <ArchiveScreen collab={collab} onBack={goHome} onHome={goHome} onNew={goNew} />;

  return null;
}
