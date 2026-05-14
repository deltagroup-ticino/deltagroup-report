// ╔══════════════════════════════════════════════════════════════════╗
// ║  DELTAgroup REPORT — App Collaboratore v1.1                     ║
// ║  Fix: primo accesso maiuscolo, report number, archivio          ║
// ╚══════════════════════════════════════════════════════════════════╝
const SUPABASE_URL = "https://golheevkvfqcpgovnawj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdvbGhlZXZrdmZxY3Bnb3ZuYXdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNDIwODMsImV4cCI6MjA4OTgxODA4M30.M6S4oxVB112VBj9CZ8ZSFW79Kz7rJGs9tk1qpGhneWI";
const APP_VERSION = 'v1.1';
const GREEN = '#1B6B1B';
const GREEN_LIGHT = '#eaf3de';
const REGULATION_VERSION = 1;

import { useState, useEffect, useRef, useCallback } from "react";

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

const SESSION_KEY = 'drCollab';
const SESSION_DAYS = 30;
function getSession() {
  try {
    const s = JSON.parse(localStorage.getItem(SESSION_KEY));
    if (!s) return null;
    if (s.savedAt && Date.now() - s.savedAt > SESSION_DAYS * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY); return null;
    }
    return s;
  } catch { return null; }
}
function saveSession(data) { localStorage.setItem(SESSION_KEY, JSON.stringify({ ...data, savedAt: Date.now() })); }
function clearSession() { localStorage.removeItem(SESSION_KEY); }

const today = () => { const d = new Date(); return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}/${d.getFullYear()}`; };
const toISO = (ddmmyyyy) => { const [d,m,y] = ddmmyyyy.split('/'); return `${y}-${m}-${d}`; };
const fromISO = (iso) => { if(!iso) return '—'; const [y,m,d] = iso.split('-'); return `${d}/${m}/${y}`; };
const isLate = (serviceDateISO) => { const svc = new Date(serviceDateISO + 'T00:00:00'); const now = new Date(); now.setHours(0,0,0,0); return svc < now; };
const MONTHS = ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'];

const GS = {
  header: { background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 },
  headerTitle: { color: '#fff', fontSize: 16, fontWeight: 500 },
  body: { background: '#f5f5f5', minHeight: '100vh' },
  card: { background: '#fff', borderRadius: 12, padding: '14px 16px', marginBottom: 10, border: '0.5px solid #e0e0e0' },
  label: { fontSize: 11, color: '#666', marginBottom: 4, fontWeight: 500 },
  input: { width: '100%', padding: '11px 13px', border: '0.5px solid #ccc', borderRadius: 9, fontSize: 15, boxSizing: 'border-box', background: '#fff', fontFamily: 'inherit', outline: 'none', WebkitAppearance: 'none' },
  btnGreen: { width: '100%', padding: 15, background: GREEN, color: '#fff', border: 'none', borderRadius: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'inherit', touchAction: 'manipulation' },
  btnOutline: { width: '100%', padding: 13, background: 'none', border: `1.5px solid ${GREEN}`, borderRadius: 11, fontSize: 15, fontWeight: 500, cursor: 'pointer', color: GREEN, fontFamily: 'inherit', touchAction: 'manipulation' },
  btnGray: { width: '100%', padding: 13, background: 'none', border: '0.5px solid #ccc', borderRadius: 11, fontSize: 14, cursor: 'pointer', color: '#555', fontFamily: 'inherit', touchAction: 'manipulation' },
  backBtn: { background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: 8, width: 44, height: 44, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 20, WebkitTapHighlightColor: 'transparent' },
  sectionLabel: { fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: '0.5px', margin: '18px 0 8px' },
};

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

function BackBtn({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, minWidth: 44, minHeight: 44, width: 44, height: 44, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 26, touchAction: 'manipulation', cursor: 'pointer', WebkitUserSelect: 'none', userSelect: 'none' }}
    >‹</div>
  );
}

function Logo({ size = 60 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 60 60">
      <rect width="60" height="60" rx="13" fill="rgba(255,255,255,0.12)" />
      <polygon points="30,11 53,49 7,49" fill="none" stroke="white" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

function BottomNav({ active, onHome, onArchive, onRegolamento, hasNewRegolamento }) {
  const btn = (label, icon, isActive, onClick, showDot) => (
    <button onClick={onClick} style={{ flex: 1, background: 'none', border: 'none', cursor: 'pointer', padding: '10px 0 6px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, touchAction: 'manipulation', position: 'relative' }}>
      <span style={{ fontSize: 24, lineHeight: 1, position: 'relative' }}>
        {icon}
        {showDot && <span style={{ position: 'absolute', top: -2, right: -4, width: 9, height: 9, borderRadius: '50%', background: '#e24b4a', border: '1.5px solid #fff' }} />}
      </span>
      <span style={{ fontSize: 11, color: isActive ? GREEN : '#999', fontFamily: 'inherit', fontWeight: isActive ? 600 : 400 }}>{label}</span>
    </button>
  );
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#fff', borderTop: '0.5px solid #e0e0e0', display: 'flex', zIndex: 100, paddingBottom: 'env(safe-area-inset-bottom)' }}>
      {btn('Home', '🏠', active === 'home', onHome, false)}
      {btn('Archivio', '📁', active === 'archive', onArchive, false)}
      {btn('Regolamento', '📄', active === 'regolamento', onRegolamento, hasNewRegolamento)}
    </div>
  );
}

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

  const startDraw = (e) => { e.preventDefault(); isDrawing.current = true; lastPos.current = getPos(e, canvasRef.current); };
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
  const clear = () => { const canvas = canvasRef.current; canvas.getContext('2d').clearRect(0, 0, canvas.offsetWidth, canvas.offsetHeight); };
  const confirm = () => { onConfirm(canvasRef.current.toDataURL('image/png')); };

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

function SplashScreen({ onDone }) {
  useEffect(() => { setTimeout(onDone, 1800); }, []);
  return (
    <div style={{ minHeight: '100vh', background: GREEN, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Logo size={80} />
      <div style={{ marginTop: 20 }}><AppName size="lg" /></div>
    </div>
  );
}

function PinScreen({ onLogin, onBack }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (pin.length < 6) return;
    setLoading(true); setError('');
    try {
      const c = await sb();
      const { data } = await c.from('report_collaborators').select('*').eq('pin', pin).eq('is_active', true).single();
      if (!data) { setError('PIN non riconosciuto. Riprova.'); setPin(''); setLoading(false); return; }
      if (!data.pin_revealed) { setError('PIN reimpostato. Torna indietro e usa "Primo accesso".'); setPin(''); setLoading(false); return; }
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
      <div style={{ background: GREEN, padding: '13px 16px', display: 'flex', alignItems: 'center', gap: 10 }}>
        <BackBtn onClick={onBack} />
        <AppName />
      </div>
      <div style={{ padding: '28px 24px' }}>
        <p style={{ textAlign: 'center', color: '#555', fontSize: 14, marginBottom: 20 }}>Inserisci il tuo PIN personale</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>{dots}</div>
        {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{error}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, maxWidth: 280, margin: '0 auto 20px' }}>
          {numPad.map((n, i) => {
            if (n === '') return <div key={i} />;
            if (n === '⌫') return <button key={i} onClick={() => setPin(p => p.slice(0,-1))} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#f0f0f0', fontSize: 18, cursor: 'pointer', fontFamily: 'inherit' }}>⌫</button>;
            return <button key={i} onClick={() => { if(pin.length < 6) setPin(p => p + String(n)); }} style={{ padding: 16, border: '0.5px solid #ddd', borderRadius: 12, background: '#fff', fontSize: 20, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>{n}</button>;
          })}
        </div>
        {loading && <p style={{ textAlign: 'center', color: GREEN, fontSize: 13 }}>Accesso in corso…</p>}
      </div>
    </div>
  );
}

function LoginScreen({ onLogin, onFirstAccess }) {
  const [screen, setScreen] = useState('welcome');
  if (screen === 'pin') return <PinScreen onLogin={onLogin} onBack={() => setScreen('welcome')} />;
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: GREEN, padding: '50px 24px 40px', textAlign: 'center' }}>
        <Logo size={70} />
        <div style={{ marginTop: 16 }}><AppName size="lg" /></div>
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, marginTop: 8 }}>Filiale Ticino</div>
      </div>
      <div style={{ padding: '32px 24px' }}>
        <div style={{ background: '#fff', borderRadius: 14, padding: '20px 18px', marginBottom: 20, border: '0.5px solid #e0e0e0', textAlign: 'center' }}>
          <p style={{ fontSize: 15, color: '#333', fontWeight: 500, marginBottom: 6 }}>Benvenuto/a nell'app rapporti</p>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.5 }}>Compila e invia i tuoi rapporti di servizio direttamente dal tuo smartphone.</p>
        </div>
        <button onClick={() => setScreen('pin')} style={{ ...GS.btnGreen, marginBottom: 12, fontSize: 16, padding: 17 }}>
          🔐 Accedi con PIN
        </button>
        <button onClick={onFirstAccess} style={{ ...GS.btnOutline }}>Primo accesso</button>
      </div>
    </div>
  );
}

function FirstAccessScreen({ onBack, onPinRevealed }) {
  const [name, setName] = useState('');
  const [step, setStep] = useState('search');
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
      if (!data || data.length === 0) { setError('Nessun collaboratore trovato. Verifica di scrivere COGNOME in maiuscolo seguito dal Nome, esattamente come sei registrato in azienda.'); setLoading(false); return; }
      if (data.length > 1) { setError('Trovati più collaboratori con questo nome. Aggiungi più lettere per precisare la ricerca, oppure contatta l\'ufficio.'); setLoading(false); return; }
      const collab = data[0];
      if (collab.pin_revealed) { setError('Il PIN per questo account è già stato visualizzato. Contatta l\'ufficio se hai dimenticato il PIN.'); setLoading(false); return; }
      setCollabData(collab);
      await c.from('report_collaborators').update({ pin_revealed: true, pin_revealed_at: new Date().toISOString() }).eq('id', collab.id);
      setStep('pin');
    } catch { setError('Errore di connessione. Riprova.'); }
    setLoading(false);
  };

  const confirmPin = () => {
    if (pinInput !== collabData.pin) { setError('PIN errato. Riprova.'); return; }
    setStep('confirm');
  };

  if (step === 'confirm') {
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: GREEN, padding: '13px 16px' }}>
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
    return (
      <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
        <div style={{ background: GREEN, padding: '13px 16px' }}>
          <AppName />
        </div>
        <div style={{ padding: '24px' }}>
          <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: 16, color: '#111' }}>Il tuo PIN personale</h2>
          <div style={{ background: GREEN_LIGHT, borderRadius: 14, padding: '24px 20px', marginBottom: 20, border: `1.5px solid ${GREEN}44`, textAlign: 'center' }}>
            <p style={{ color: '#1a5c1a', fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Il tuo PIN è:</p>
            <p style={{ color: GREEN, fontSize: 48, fontWeight: 700, letterSpacing: 12, margin: '0 0 16px' }}>{collabData.pin}</p>
            <div style={{ background: '#fff', borderRadius: 9, padding: '10px 14px', border: '1px solid #c8e6c8' }}>
              <p style={{ color: '#555', fontSize: 13, fontWeight: 500 }}>⚠️ Annotalo ora — non verrà più mostrato</p>
              <p style={{ color: '#888', fontSize: 12, marginTop: 4 }}>Usalo ad ogni accesso all'app</p>
            </div>
          </div>
          <button onClick={() => setStep('confirm')} style={{ ...GS.btnGreen }}>
            Ho annotato il PIN — Continua
          </button>
        </div>
      </div>
    );
  }

  // FIX 1: istruzioni chiare per formato maiuscolo
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
      <div style={{ background: GREEN, padding: '13px 16px' }}>
        <AppName />
      </div>
      <div style={{ padding: '24px' }}>
        <h2 style={{ fontSize: 17, fontWeight: 500, marginBottom: 6, color: '#111' }}>Primo accesso</h2>
        <div style={{ background: '#fff7e6', border: '1px solid #f0c070', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
          <p style={{ fontSize: 13, color: '#7a5000', fontWeight: 500, marginBottom: 4 }}>📋 Come scrivere il tuo nome:</p>
          <p style={{ fontSize: 13, color: '#7a5000' }}>Scrivi <strong>COGNOME e NOME tutti in MAIUSCOLO</strong>, esattamente come sei registrato in azienda.</p>
          <p style={{ fontSize: 12, color: '#999', marginTop: 6 }}>Esempio: <strong>MANASSERI PAOLO</strong></p>
        </div>
        <div style={{ marginBottom: 10 }}>
          <div style={GS.label}>Cognome e Nome</div>
          <input
            style={GS.input}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Es. STEFANONI MARCO"
            onKeyDown={e => e.key === 'Enter' && searchName()}
            autoCapitalize="words"
          />
        </div>
        {error && <div style={{ background: '#fcebeb', color: '#a32d2d', padding: '10px 14px', borderRadius: 9, fontSize: 13, marginBottom: 14 }}>{error}</div>}
        <button onClick={searchName} disabled={loading || !name.trim()} style={{ ...GS.btnGreen, opacity: loading || !name.trim() ? 0.5 : 1, marginBottom: 10 }}>
          {loading ? 'Ricerca in corso…' : 'Cerca'}
        </button>
        <p style={{ fontSize: 12, color: '#888', textAlign: 'center', marginBottom: 16 }}>Se hai già visualizzato il PIN, usa il login normale oppure contatta l'ufficio.</p>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: GREEN, fontSize: 14, cursor: 'pointer', width: '100%', textAlign: 'center', padding: '8px', fontFamily: 'inherit', touchAction: 'manipulation' }}>← Torna al login</button>
      </div>
    </div>
  );
}

function RegulationScreen({ collab, onAccepted }) {
  const [scrolled, setScrolled] = useState(false);
  const [checked, setChecked] = useState(false);
  const [regulation, setRegulation] = useState('Caricamento regolamento…');
  const [loading, setLoading] = useState(false);

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
      <div onScroll={handleScroll} style={{ flex: 1, overflow: 'auto', margin: 16, background: '#fff', borderRadius: 12, padding: '16px', border: '0.5px solid #e0e0e0', fontSize: 13, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', maxHeight: 'calc(100vh - 260px)' }}>
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

function HomeScreen({ collab, onNew, onArchive, onLogout, onRegolamento, hasNewRegolamento }) {

  return (
    <div style={{ ...GS.body, paddingBottom: 70 }}>
      <div style={{ background: GREEN, padding: '13px 16px' }}>
        <AppName />
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 }}>{collab.agent_name}</div>
      </div>
      <div style={{ padding: '20px 16px 0' }}>
        <p style={{ color: '#888', fontSize: 13, marginBottom: 20, textAlign: 'center' }}>Seleziona il tipo di rapporto da compilare:</p>
        <div onClick={() => onNew('pdf_firma')} style={{ ...GS.card, cursor: 'pointer', border: `2px solid ${GREEN}`, marginBottom: 14, padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>📋</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 3 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 500 }}>PDF – Con firma cliente</div>
            </div>
          </div>
        </div>
        <div onClick={() => onNew('solo_testo')} style={{ ...GS.card, cursor: 'pointer', border: '1.5px solid #ccc', padding: '18px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 50, height: 50, borderRadius: 12, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>📝</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 16, marginBottom: 3 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: '#666', fontWeight: 500 }}>Solo testo · Nessuna firma cliente</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
        <a href="#" onClick={(e) => { e.preventDefault(); onLogout(); }} style={{ fontSize: 13, color: '#aaa', textDecoration: 'underline', fontFamily: 'inherit', touchAction: 'manipulation' }}>Esci dall'app</a>
      </div>
      <BottomNav active="home" onHome={() => {}} onArchive={onArchive} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}

function ReportTypeScreen({ onSelect, onHome, onArchive }) {
  return (
    <div style={{ minHeight: '100vh', background: '#f5f5f5', paddingBottom: 70 }}>
      <div style={{ ...GS.header }}>
        <AppName />
      </div>
      <div style={{ padding: 20 }}>
        <p style={{ color: '#555', fontSize: 14, marginBottom: 20 }}>Seleziona il tipo di rapporto:</p>
        <div onClick={() => onSelect('pdf_firma')} style={{ ...GS.card, cursor: 'pointer', border: `1.5px solid ${GREEN}`, marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: GREEN_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📋</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: GREEN, fontWeight: 500, marginBottom: 4 }}>PDF – Con firma cliente</div>
              <div style={{ fontSize: 12, color: '#777' }}>Rapporto con firma digitale del cliente.</div>
            </div>
          </div>
        </div>
        <div onClick={() => onSelect('solo_testo')} style={{ ...GS.card, cursor: 'pointer', border: '1.5px solid #ccc' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 11, background: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>📝</div>
            <div>
              <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 4 }}>Rapporto di Servizio</div>
              <div style={{ fontSize: 13, color: '#555', fontWeight: 500, marginBottom: 4 }}>Solo testo · Nessuna firma cliente</div>
              <div style={{ fontSize: 12, color: '#777' }}>Senza firma del cliente.</div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="home" onHome={onHome} onArchive={onArchive} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}

function ReportFormScreen({ collab, reportType, onNext, onHome, onArchive, onRegolamento, hasNewRegolamento }) {
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
    if (form.startTime && form.endTime && form.startTime >= form.endTime) e.timeWarning = true;
    setErrors(e);
    return Object.keys(e).length === 0 || (Object.keys(e).length === 1 && e.timeWarning);
  };

  const filteredAgents = allAgents.filter(a => !agents.find(ag => ag.id === a.id) && a.agent_name.toLowerCase().includes(agentSearch.toLowerCase()));

  return (
    <div style={{ ...GS.body, paddingBottom: 70 }}>
      <div style={GS.header}>
        <AppName />
        <span style={{ ...GS.headerTitle, marginLeft: 8, fontSize: 13, opacity: 0.85 }}>{reportType === 'pdf_firma' ? 'PDF – Firma cliente' : 'Solo testo'}</span>
      </div>
      <div style={{ padding: 16 }}>
        <div style={GS.card}>
          <div style={GS.label}>Data servizio *</div>
          <input style={{ ...GS.input, borderColor: errors.serviceDate ? '#e24b4a' : '#ccc' }} type="date" value={form.serviceDate ? toISO(form.serviceDate) : ''} onChange={e => upd('serviceDate', fromISO(e.target.value))} />
          {errors.serviceDate && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.serviceDate}</div>}
        </div>
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
        <div style={GS.card}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
            <div>
              <div style={GS.label}>Inizio *</div>
              <input style={{ ...GS.input, borderColor: errors.startTime ? '#e24b4a' : '#ccc' }} type="time" value={form.startTime} onChange={e => upd('startTime', e.target.value)} />
              {errors.startTime && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.startTime}</div>}
            </div>
            <div>
              <div style={GS.label}>Fine *</div>
              <input style={{ ...GS.input, borderColor: errors.endTime ? '#e24b4a' : '#ccc' }} type="time" value={form.endTime} onChange={e => upd('endTime', e.target.value)} />
              {errors.endTime && <div style={{ color: '#e24b4a', fontSize: 11, marginTop: 3 }}>{errors.endTime}</div>}
            </div>
          </div>
          {form.startTime && form.endTime && form.startTime >= form.endTime && (
            <div style={{ marginBottom: 10, padding: '8px 10px', background: '#faeeda', borderRadius: 7, fontSize: 12, color: '#854f0b', display: 'flex', alignItems: 'center', gap: 6 }}>
              ⚠️ Fine precedente all'inizio — corretto solo per servizio notturno
            </div>
          )}
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
        <div style={GS.card}>
          <div style={GS.label}>Osservazioni</div>
          <textarea style={{ ...GS.input, height: 90, resize: 'none' }} value={form.notes} onChange={e => upd('notes', e.target.value)} placeholder="Note, descrizione del servizio svolto…" />
        </div>
        <button onClick={() => { if (validate()) onNext({ form, agents }); }} style={GS.btnGreen}>
          {reportType === 'pdf_firma' ? 'Anteprima e Firma →' : 'Anteprima →'}
        </button>
      </div>
      <BottomNav active="home" onHome={onHome} onArchive={onArchive} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}

function PreviewScreen({ collab, reportType, formData, reportNumber, onSubmit, onHome, onArchive, onRegolamento, hasNewRegolamento }) {
  const { form, agents } = formData;
  const [agentSig, setAgentSig] = useState(null);
  const [clientSig, setClientSig] = useState(null);
  const [clientSignerName, setClientSignerName] = useState('');
  const [showSigOverlay, setShowSigOverlay] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const canSubmit = reportType === 'pdf_firma' ? agentSig && clientSig && clientSignerName.trim() : agentSig;

  // FIX 2: next_report_number chiamato una sola volta
  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true); setError('');
    try {
      const c = await sb();
      const svcDateISO = toISO(form.serviceDate);
      const { data: num } = await c.rpc('next_report_number');
      const { data: rpt, error: err } = await c.from('dr_reports').insert({
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
    <div style={{ ...GS.body, paddingBottom: 90 }}>
      {showSigOverlay && (
        <SignatureOverlay
          title={showSigOverlay === 'agent' ? 'Firma Agente' : 'Firma Cliente'}
          onConfirm={(dataURL) => { if (showSigOverlay === 'agent') setAgentSig(dataURL); else setClientSig(dataURL); setShowSigOverlay(null); }}
          onCancel={() => setShowSigOverlay(null)}
        />
      )}
      <div style={GS.header}>
        <AppName />
        <span style={{ ...GS.headerTitle, marginLeft: 8, fontSize: 13, opacity: 0.85 }}>Anteprima</span>
      </div>
      <div style={{ padding: 16 }}>
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
          {reportType === 'pdf_firma' ? 'Completa firma agente, firma cliente e nome.' : 'Completa la firma agente.'}
        </p>}
      </div>
      <BottomNav active="home" onHome={onHome} onArchive={onArchive} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}

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

// ── PDF GENERATOR (collab) ─────────────────────────────────────────
async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
  return window.jspdf.jsPDF;
}

async function generateAndSharePDF(report) {
  const JsPDF = await loadJsPDF();
  const doc = new JsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210, M = 18;
  let y = 18;
  doc.setFillColor(27,107,27); doc.rect(0,0,W,28,'F');
  doc.setTextColor(255,255,255); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('DELTA', M, 12); doc.setFontSize(10); doc.setFont('helvetica','normal');
  doc.text('group', M+19.5, 12); doc.setFontSize(16); doc.setFont('helvetica','bold');
  doc.text('REPORT', M+31, 12); doc.setFontSize(12);
  doc.text("N° "+report.report_number, W-M, 12, {align:'right'});
  y=38; doc.setTextColor(27,107,27); doc.setFontSize(13); doc.setFont('helvetica','bold');
  doc.text('RAPPORTO DI SERVIZIO', M, y);
  y+=6; doc.setDrawColor(200,200,200); doc.line(M,y,W-M,y);
  const field=(label,value,x,yw,maxW=80)=>{
    doc.setTextColor(120,120,120); doc.setFontSize(7.5); doc.setFont('helvetica','normal');
    doc.text(label,x,yw); doc.setTextColor(20,20,20); doc.setFontSize(10);
    doc.text(String(value||'--'),x,yw+5,{maxWidth:maxW});
  };
  y+=8;
  field('DATA', fromISO(report.service_date), M, y);
  field('N. RAPPORTO', report.report_number, 70, y);
  y+=14;
  const agenti = Array.isArray(report.agents_json) ? report.agents_json.map(a=>a.name).join(', ') : (report.submitted_by_name||'');
  field('AGENTI', agenti, M, y, 160);
  y+=14; field('CLIENTE', report.client_name, M, y); field('LUOGO', report.location, 110, y);
  y+=14; field('INDIRIZZO', report.address, M, y, 160);
  y+=14; field('INIZIO', report.start_time||'--', M, y); field('FINE', report.end_time||'--', 80, y);
  if(report.has_break){y+=14; field('PAUSA - COPERTA DA',report.break_covered_by||'--',M,y); field('INIZIO',report.break_start||'--',110,y); field('FINE',report.break_end||'--',150,y,30);}
  if(report.notes){y+=18; doc.setDrawColor(230,230,230); doc.roundedRect(M,y-4,W-M*2,22,2,2,'S'); field('OSSERVAZIONI',report.notes,M+3,y,160);}
  y+=28; doc.setDrawColor(200,200,200); doc.line(M,y,W-M,y); y+=8;
  if(report.agent_signature){doc.setTextColor(120,120,120); doc.setFontSize(8); doc.text('FIRMA AGENTE',M,y); try{doc.addImage(report.agent_signature,'PNG',M,y+3,75,20);}catch(e){} doc.rect(M,y+3,75,20);}
  if(report.client_signature){doc.setTextColor(120,120,120); doc.setFontSize(8); doc.text('FIRMA CLIENTE',115,y); if(report.client_signer_name){doc.setTextColor(40,40,40); doc.setFontSize(9); doc.text(report.client_signer_name,115,y+5);} try{doc.addImage(report.client_signature,'PNG',115,y+8,75,18);}catch(e){} doc.rect(115,y+3,75,20);}
  const blob = doc.output('blob');
  const file = new File([blob], "Rapporto_"+report.report_number+".pdf", {type:'application/pdf'});
  if(navigator.canShare && navigator.canShare({files:[file]})){
    await navigator.share({files:[file], title:"Rapporto "+report.report_number});
  } else {
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  }
}

function ReportDetailScreen({ report, onBack, onHome, onRegolamento, hasNewRegolamento }) {
  const [generating, setGenerating] = useState(false);
  const handlePDF = async () => { setGenerating(true); try { await generateAndSharePDF(report); } catch(e){ alert('Errore PDF. Riprova.'); } setGenerating(false); };
  const Row = ({label, value}) => value ? (<div style={{marginBottom:10}}><div style={{fontSize:10,color:'#888',marginBottom:2,textTransform:'uppercase',letterSpacing:0.3}}>{label}</div><div style={{fontSize:14,color:'#111'}}>{value}</div></div>) : null;
  const agenti = Array.isArray(report.agents_json) ? report.agents_json.map(a=>a.name).join(', ') : report.submitted_by_name;
  const sentAt = report.submitted_at ? new Date(report.submitted_at) : null;
  const sentStr = sentAt ? String(sentAt.getDate()).padStart(2,'0')+'/'+String(sentAt.getMonth()+1).padStart(2,'0')+'/'+sentAt.getFullYear()+' alle '+String(sentAt.getHours()).padStart(2,'0')+':'+String(sentAt.getMinutes()).padStart(2,'0') : null;
  return (
    <div style={{...GS.body, paddingBottom:70}}>
      <div style={{background:GREEN,padding:'13px 16px'}}>
        <AppName />
        <div style={{color:'rgba(255,255,255,0.7)',fontSize:11,marginTop:2}}>{report.report_number}</div>
      </div>
      <div style={{padding:16}}>
        {sentStr && <div style={{background:GREEN_LIGHT,borderRadius:9,padding:'8px 13px',marginBottom:14,fontSize:12,color:'#1a5c1a'}}>📤 Inviato il {sentStr}</div>}
        <div style={GS.card}>
          <Row label="Data servizio" value={fromISO(report.service_date)} />
          <Row label="Agenti" value={agenti} />
          <Row label="Cliente" value={report.client_name} />
          <Row label="Luogo" value={report.location} />
          <Row label="Indirizzo" value={report.address} />
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:10}}>
            <div><div style={{fontSize:10,color:'#888',marginBottom:2,textTransform:'uppercase'}}>Inizio</div><div style={{fontSize:14}}>{report.start_time||'--'}</div></div>
            <div><div style={{fontSize:10,color:'#888',marginBottom:2,textTransform:'uppercase'}}>Fine</div><div style={{fontSize:14}}>{report.end_time||'--'}</div></div>
          </div>
          {report.has_break && <Row label="Pausa" value={report.break_start+'--'+report.break_end+' ('+report.break_covered_by+')'} />}
          {report.notes && <Row label="Osservazioni" value={report.notes} />}
          <span style={{fontSize:10,padding:'2px 8px',borderRadius:4,fontWeight:500,background:report.report_type==='pdf_firma'?GREEN_LIGHT:'#f0f0f0',color:report.report_type==='pdf_firma'?'#1a5c1a':'#555'}}>
            {report.report_type==='pdf_firma'?'PDF – Con firma cliente':'Solo testo'}
          </span>
        </div>
        {(report.agent_signature||report.client_signature) && (
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:10}}>
            {report.agent_signature && <div style={GS.card}><div style={{fontSize:10,color:'#888',marginBottom:6}}>FIRMA AGENTE</div><img src={report.agent_signature} style={{width:'100%',height:60,objectFit:'contain',border:'0.5px solid #eee',borderRadius:6}} /></div>}
            {report.client_signature && <div style={GS.card}><div style={{fontSize:10,color:'#888',marginBottom:4}}>FIRMA CLIENTE</div>{report.client_signer_name&&<div style={{fontSize:11,fontWeight:500,marginBottom:4}}>{report.client_signer_name}</div>}<img src={report.client_signature} style={{width:'100%',height:60,objectFit:'contain',border:'0.5px solid #eee',borderRadius:6}} /></div>}
          </div>
        )}
        <button onClick={handlePDF} disabled={generating} style={{...GS.btnGreen,opacity:generating?0.6:1}}>
          {generating?'Generazione PDF...':'📄 Visualizza / Condividi PDF'}
        </button>
      </div>
      <BottomNav active="archive" onHome={onHome} onArchive={onBack} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}

function ArchiveScreen({ collab, onHome, onOpenReport, onRegolamento, hasNewRegolamento }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth()-3);
    sb().then(c => c.from('dr_reports')
      .select('id,report_number,service_date,submitted_at,client_name,address,location,start_time,end_time,report_type,has_break,break_covered_by,break_start,break_end,notes,agent_signature,client_signature,client_signer_name,agents_json,submitted_by_name')
      .eq('submitted_by_id', collab.id)
      .gte('service_date', threeMonthsAgo.toISOString().split('T')[0])
      .order('service_date', {ascending:false})
    ).then(({data}) => { if(data) setReports(data); setLoading(false); });
  }, []);

  const grouped = {};
  reports.forEach(r => {
    const d = new Date(r.service_date+'T12:00:00');
    const key = MONTHS[d.getMonth()]+' '+d.getFullYear();
    if(!grouped[key]) grouped[key]=[];
    grouped[key].push(r);
  });

  const fmtSent = (iso) => {
    if(!iso) return null;
    const d = new Date(iso);
    return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+' '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
  };

  return (
    <div style={{...GS.body,paddingBottom:70}}>
      <div style={GS.header}><AppName /></div>
      <div style={{padding:'16px 16px 0'}}>
        {loading && <p style={{textAlign:'center',color:'#888',padding:30}}>Caricamento...</p>}
        {!loading && Object.keys(grouped).length===0 && <p style={{textAlign:'center',color:'#888',padding:30}}>Nessun rapporto negli ultimi 3 mesi.</p>}
        {Object.entries(grouped).map(([month,rpts]) => (
          <div key={month}>
            <div style={GS.sectionLabel}>{month}</div>
            {rpts.map(r => (
              <div key={r.id} onClick={() => onOpenReport(r)} style={{...GS.card,cursor:'pointer'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:3}}>
                  <div style={{fontWeight:500,fontSize:14}}>{r.client_name}</div>
                  <div style={{fontSize:11,color:'#999'}}>{fromISO(r.service_date)}</div>
                </div>
                <div style={{fontSize:12,color:'#666',marginBottom:6}}>
                  {r.address}{r.start_time&&r.end_time?' · '+r.start_time+'–'+r.end_time:r.start_time?' · '+r.start_time:''}
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:10,color:'#888'}}>📤 {fmtSent(r.submitted_at)}</span>
                  <span style={{fontSize:10,padding:'2px 7px',borderRadius:4,fontWeight:500,background:r.report_type==='pdf_firma'?GREEN_LIGHT:'#f0f0f0',color:r.report_type==='pdf_firma'?'#1a5c1a':'#555'}}>
                    {r.report_type==='pdf_firma'?'PDF':'Testo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ))}
        <p style={{fontSize:11,color:'#bbb',textAlign:'center',marginTop:10}}>Archivio limitato agli ultimi 3 mesi</p>
      </div>
      <BottomNav active="archive" onHome={onHome} onArchive={() => {}} onRegolamento={onRegolamento} hasNewRegolamento={hasNewRegolamento} />
    </div>
  );
}


function RegolamentoReadScreen({ collab, onHome, onArchive, onRegolamento, hasNewRegolamento, onRead }) {
  const [regulation, setRegulation] = useState('Caricamento…');

  useEffect(() => {
    sb().then(c => c.from('report_regulations').select('content,version').order('version', { ascending: false }).limit(1).single()).then(({ data }) => {
      if (data) {
        setRegulation(data.content);
        // Salva in Supabase che il collaboratore ha letto questa versione
        if (data.version > (collab.regulation_version || 0)) {
          sb().then(c2 => c2.from('report_collaborators').update({ regulation_version: data.version }).eq('id', collab.id));
        }
        onRead(data.version);
      }
    });
  }, []);

  return (
    <div style={{ ...GS.body, paddingBottom: 80 }}>
      <div style={{ background: GREEN, padding: '13px 16px' }}>
        <AppName />
        <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, marginTop: 3 }}>Regolamento compilazione rapporti</div>
      </div>
      <div style={{ margin: 16, background: '#fff', borderRadius: 12, padding: 16, border: '0.5px solid #e0e0e0', fontSize: 13, color: '#333', lineHeight: 1.7, whiteSpace: 'pre-wrap', minHeight: 200 }}>
        {regulation}
      </div>
      <BottomNav active="regolamento" onHome={onHome} onArchive={onArchive} onRegolamento={onRegolamento} hasNewRegolamento={false} />
    </div>
  );
}
export default function App() {
  const [screen, setScreen] = useState('splash');
  const [collab, setCollab] = useState(null);
  const [reportType, setReportType] = useState(null);
  const [formData, setFormData] = useState(null);
  const [reportNumber, setReportNumber] = useState(null);
  const [submittedReport, setSubmittedReport] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [latestRegVersion, setLatestRegVersion] = useState(0);

  const checkSession = async () => {
    const session = getSession();
    if(!session){setScreen('login');return;}
    try {
      const c = await sb();
      const {data} = await c.from('report_collaborators').select('*').eq('id',session.collabId).eq('is_active',true).single();
      if(data){
        if(!data.pin_revealed){clearSession();setScreen('login');return;}
        setCollab(data);
        const c2 = await sb();
        const { data: reg } = await c2.from('report_regulations').select('version').order('version',{ascending:false}).limit(1).single();
        if (reg) setLatestRegVersion(reg.version);
        if(!data.regulation_accepted||data.regulation_version<REGULATION_VERSION) setScreen('regulation');
        else setScreen('home');
      } else{clearSession();setScreen('login');}
    } catch{clearSession();setScreen('login');}
  };

  const handleLogin=(data)=>{setCollab(data); if(!data.regulation_accepted||data.regulation_version<REGULATION_VERSION) setScreen('regulation'); else setScreen('home');};
  const handleLogout=()=>{clearSession();setCollab(null);setScreen('login');};
  const handleFormNext=async(fd)=>{setFormData(fd);const c=await sb();const{data:num}=await c.rpc('next_report_number');setReportNumber(num);setScreen('preview');};
  const handleSubmitted=(rpt)=>{setSubmittedReport(rpt);setScreen('success');};
  const goHome=()=>setScreen('home');
  const goArchive=()=>setScreen('archive');
  const goRegolamento=()=>setScreen('regolamento');
  const hasNewReg = collab ? latestRegVersion > (collab.regulation_version||0) : false;

  if(screen==='splash') return <SplashScreen onDone={checkSession} />;
  if(screen==='login') return <LoginScreen onLogin={handleLogin} onFirstAccess={()=>setScreen('firstAccess')} />;
  if(screen==='firstAccess') return <FirstAccessScreen onBack={()=>setScreen('login')} onPinRevealed={(data)=>{setCollab(data);setScreen('regulation');}} />;
  if(screen==='regulation') return <RegulationScreen collab={collab} onAccepted={()=>{saveSession({collabId:collab.id,collabName:collab.agent_name,regulationVersion:REGULATION_VERSION});setScreen('home');}} />;
  if(screen==='home') return <HomeScreen collab={collab} onNew={(t)=>{setReportType(t);setScreen('form');}} onArchive={goArchive} onLogout={handleLogout} onRegolamento={goRegolamento} hasNewRegolamento={hasNewReg} />;
  if(screen==='form') return <ReportFormScreen collab={collab} reportType={reportType} onNext={handleFormNext} onHome={goHome} onArchive={goArchive} onRegolamento={goRegolamento} hasNewRegolamento={hasNewReg} />;
  if(screen==='preview') return <PreviewScreen collab={collab} reportType={reportType} formData={formData} reportNumber={reportNumber} onSubmit={handleSubmitted} onHome={goHome} onArchive={goArchive} onRegolamento={goRegolamento} hasNewRegolamento={hasNewReg} />;
  if(screen==='success') return <SuccessScreen report={submittedReport} onHome={goHome} onArchive={goArchive} />;
  if(screen==='archive') return <ArchiveScreen collab={collab} onHome={goHome} onOpenReport={(r)=>{setSelectedReport(r);setScreen('reportDetail');}} onRegolamento={goRegolamento} hasNewRegolamento={hasNewReg} />;
  if(screen==='regolamento') return <RegolamentoReadScreen collab={collab} onHome={goHome} onArchive={goArchive} onRegolamento={goRegolamento} hasNewRegolamento={false} onRead={(v) => { setCollab(c => ({...c, regulation_version: v})); }} />;
  if(screen==='reportDetail') return <ReportDetailScreen report={selectedReport} onBack={goArchive} onHome={goHome} onRegolamento={goRegolamento} hasNewRegolamento={hasNewReg} />;
  return null;
}
