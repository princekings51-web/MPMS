import { useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell,
  CalendarDays, Check, ChevronDown, ClipboardList, Clock3, FileBarChart,
  HeartPulse, LayoutDashboard, Menu, Moon, MoreHorizontal, Plus, Search,
  Settings, ShieldCheck, Stethoscope, UserRound, Users, X, Pill, FlaskConical,
  LogOut, ChevronRight
} from "lucide-react";
import type { FollowUp, Patient, Visit } from "./types";
import { getFollowUps, getPatients, getVisits, saveFollowUps, savePatients, saveVisits } from "./storage";

type Page = "Dashboard" | "Patients" | "Visits" | "Follow-ups" | "Reports" | "Settings";
const navItems: { label: Page; icon: typeof LayoutDashboard }[] = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Patients", icon: Users },
  { label: "Visits", icon: ClipboardList },
  { label: "Follow-ups", icon: CalendarDays },
  { label: "Reports", icon: FileBarChart },
  { label: "Settings", icon: Settings }
];

const today = "2026-10-10";
const formatDate = (date: string) => new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

export default function App() {
  const [page, setPage] = useState<Page>("Dashboard");
  const [patients, setPatients] = useState<Patient[]>(getPatients);
  const [visits, setVisits] = useState<Visit[]>(getVisits);
  const [followUps, setFollowUps] = useState<FollowUp[]>(getFollowUps);
  const [query, setQuery] = useState("");
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(false);
  const [role, setRole] = useState("Reception");
  const [notice, setNotice] = useState("");
  const [patientForm, setPatientForm] = useState({ name: "", age: "", sex: "Female" as Patient["sex"], phone: "" });
  const [visitForm, setVisitForm] = useState({ patientId: "", reason: "" });

  const filteredPatients = useMemo(() => patients.filter(p =>
    `${p.name} ${p.hospitalNo} ${p.phone}`.toLowerCase().includes(query.toLowerCase())
  ), [patients, query]);

  const updatePatients = (value: Patient[]) => { setPatients(value); savePatients(value); };
  const updateVisits = (value: Visit[]) => { setVisits(value); saveVisits(value); };
  const updateFollowUps = (value: FollowUp[]) => { setFollowUps(value); saveFollowUps(value); };

  function addPatient(e: React.FormEvent) {
    e.preventDefault();
    const patient: Patient = {
      id: `p${Date.now()}`, hospitalNo: `MK-${String(patients.length + 1).padStart(4, "0")}`,
      name: patientForm.name.trim(), age: Number(patientForm.age), sex: patientForm.sex,
      phone: patientForm.phone.trim(), lastVisit: today, status: "Active"
    };
    if (!patient.name || !patient.age) return;
    updatePatients([patient, ...patients]);
    setPatientForm({ name: "", age: "", sex: "Female", phone: "" });
    setShowPatientForm(false);
    setNotice("Patient record added on this device.");
  }

  function addVisit(e: React.FormEvent) {
    e.preventDefault();
    const patient = patients.find(p => p.id === visitForm.patientId);
    if (!patient || !visitForm.reason.trim()) return;
    const visit: Visit = {
      id: `v${Date.now()}`, patientId: patient.id, patientName: patient.name,
      date: today, reason: visitForm.reason.trim(), clinician: "Clinic team", status: "Scheduled"
    };
    updateVisits([visit, ...visits]);
    setVisitForm({ patientId: "", reason: "" });
    setShowVisitForm(false);
    setPage("Visits");
    setNotice("Visit created. Complete clinical documentation in the patient record.");
  }

  const completedVisits = visits.filter(v => v.status === "Completed").length;
  const dueCount = followUps.filter(f => f.status === "Due").length;

  return (
    <div className={`app-shell ${dark ? "theme-dark" : ""}`}>
      <aside className={`sidebar ${mobileNav ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark"><HeartPulse size={24} strokeWidth={2.4} /></div>
          <div><strong>MaCoKi <span>APMS</span></strong><small>Patient Management</small></div>
          <button className="icon-button mobile-close" aria-label="Close navigation" onClick={() => setMobileNav(false)}><X size={19}/></button>
        </div>
        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          {navItems.map(item => {
            const Icon = item.icon;
            return <button key={item.label} className={`nav-item ${page === item.label ? "active" : ""}`} onClick={() => { setPage(item.label); setMobileNav(false); }}>
              <Icon size={19}/><span>{item.label}</span>
              {item.label === "Follow-ups" && dueCount > 0 && <span className="nav-count">{dueCount}</span>}
              {page === item.label && <span className="active-indicator"/>}
            </button>;
          })}
        </nav>
        <div className="sidebar-spacer"/>
        <div className="support-card">
          <div className="support-icon"><ShieldCheck size={19}/></div>
          <strong>Care with confidence</strong>
          <p>Keep patient information accurate and access controlled.</p>
          <button onClick={() => { setPage("Settings"); setMobileNav(false); }}>Review settings <ArrowRight size={14}/></button>
        </div>
        <div className="sidebar-user">
          <div className="avatar avatar-teal">KM</div>
          <div className="user-meta"><strong>Clinic workspace</strong><small>{role} access</small></div>
          <MoreHorizontal size={19} className="muted"/>
        </div>
      </aside>

      {mobileNav && <button className="nav-scrim" aria-label="Close navigation overlay" onClick={() => setMobileNav(false)}/>}

      <main className="main-area">
        <header className="topbar">
          <div className="topbar-left">
            <button className="icon-button menu-button" aria-label="Open navigation" onClick={() => setMobileNav(true)}><Menu size={21}/></button>
            <div className="breadcrumb"><span>MaCoKi APMS</span><ChevronRight size={14}/><strong>{page}</strong></div>
          </div>
          <div className="topbar-actions">
            <div className="system-status"><span className="status-dot"/><span>Workspace ready</span></div>
            <button className="icon-button" aria-label="Toggle dark mode" onClick={() => setDark(!dark)}><Moon size={18}/></button>
            <button className="icon-button notification-button" aria-label="Notifications" onClick={() => setNotice(dueCount ? `You have ${dueCount} follow-up(s) due today.` : "No outstanding follow-ups.")}><Bell size={18}/><i/></button>
            <div className="topbar-divider"/>
            <div className="avatar avatar-purple">KM</div>
            <div className="top-user"><strong>Clinic user</strong><small>{role}</small></div>
            <ChevronDown size={15} className="muted"/>
          </div>
        </header>

        <div className="page-content">
          {notice && <div className="toast"><Check size={17}/><span>{notice}</span><button aria-label="Dismiss message" onClick={() => setNotice("")}><X size={16}/></button></div>}
          {page === "Dashboard" && <Dashboard patients={patients} visits={visits} followUps={followUps} setPage={setPage} onNewPatient={() => setShowPatientForm(true)} onNewVisit={() => setShowVisitForm(true)} />}
          {page === "Patients" && <PatientsPage patients={filteredPatients} query={query} setQuery={setQuery} onAdd={() => setShowPatientForm(true)} />}
          {page === "Visits" && <VisitsPage visits={visits} onAdd={() => setShowVisitForm(true)} onComplete={(id) => updateVisits(visits.map(v => v.id === id ? {...v, status: "Completed"} : v))} />}
          {page === "Follow-ups" && <FollowUpsPage followUps={followUps} onComplete={(id) => updateFollowUps(followUps.map(f => f.id === id ? {...f, status: "Completed"} : f))} />}
          {page === "Reports" && <ReportsPage patients={patients} visits={visits} followUps={followUps} completedVisits={completedVisits} />}
          {page === "Settings" && <SettingsPage role={role} setRole={setRole} dark={dark} setDark={setDark} />}
        </div>
        <footer className="footer"><span>© 2026 MaCoKi APMS</span><span><span className="footer-dot"/> Frontend preview · Sample data</span></footer>
      </main>

      {showPatientForm && <Modal title="Register new patient" subtitle="Create a basic patient profile." onClose={() => setShowPatientForm(false)}>
        <form className="form-stack" onSubmit={addPatient}>
          <label>Full name<input required autoFocus value={patientForm.name} onChange={e => setPatientForm({...patientForm, name: e.target.value})} placeholder="Enter patient's full name"/></label>
          <div className="form-row"><label>Age<input required min="0" max="120" type="number" value={patientForm.age} onChange={e => setPatientForm({...patientForm, age: e.target.value})} placeholder="Age"/></label><label>Sex<select value={patientForm.sex} onChange={e => setPatientForm({...patientForm, sex: e.target.value as Patient["sex"]})}><option>Female</option><option>Male</option></select></label></div>
          <label>Phone number<input value={patientForm.phone} onChange={e => setPatientForm({...patientForm, phone: e.target.value})} placeholder="e.g. 08012345678"/></label>
          <div className="form-note"><AlertCircle size={15}/> Demo mode: data is saved only in this browser on this device.</div>
          <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setShowPatientForm(false)}>Cancel</button><button className="btn btn-primary" type="submit"><Plus size={16}/> Save patient</button></div>
        </form>
      </Modal>}

      {showVisitForm && <Modal title="Create visit" subtitle="Schedule a patient visit for today." onClose={() => setShowVisitForm(false)}>
        <form className="form-stack" onSubmit={addVisit}>
          <label>Patient<select required value={visitForm.patientId} onChange={e => setVisitForm({...visitForm, patientId: e.target.value})}><option value="">Choose a patient</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name} · {p.hospitalNo}</option>)}</select></label>
          <label>Visit reason<input required value={visitForm.reason} onChange={e => setVisitForm({...visitForm, reason: e.target.value})} placeholder="e.g. General consultation"/></label>
          <div className="form-note"><AlertCircle size={15}/> This creates an administrative visit entry, not a clinical assessment.</div>
          <div className="modal-actions"><button type="button" className="btn btn-light" onClick={() => setShowVisitForm(false)}>Cancel</button><button className="btn btn-primary" type="submit"><Plus size={16}/> Create visit</button></div>
        </form>
      </Modal>}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div>;
}
function Dashboard({ patients, visits, followUps, setPage, onNewPatient, onNewVisit }: { patients: Patient[]; visits: Visit[]; followUps: FollowUp[]; setPage: (p: Page) => void; onNewPatient: () => void; onNewVisit: () => void }) {
  const due = followUps.filter(f => f.status === "Due");
  return <>
    <PageHeading eyebrow="OVERVIEW" title="Good afternoon, Clinic team" description="Here is a snapshot of your clinic activity for today." action={<button className="btn btn-primary" onClick={onNewPatient}><Plus size={17}/> Register patient</button>}/>
    <div className="welcome-banner"><div className="welcome-symbol"><Activity size={23}/></div><div><strong>Every patient, one connected record.</strong><p>Manage registrations, visits and follow-up tasks from one workspace.</p></div><button onClick={onNewVisit}>Create a visit <ArrowRight size={15}/></button><div className="banner-decoration decoration-one"/><div className="banner-decoration decoration-two"/></div>
    <section className="stats-grid">
      <StatCard label="Total patients" value={patients.length.toLocaleString()} note="Patient profiles" icon={Users} tone="teal" trend="Records in workspace"/>
      <StatCard label="Visits today" value={visits.filter(v => v.date === today).length.toString()} note="Scheduled or recorded" icon={Stethoscope} tone="blue" trend="Today's activity"/>
      <StatCard label="Follow-ups due" value={due.length.toString()} note="Require attention" icon={CalendarDays} tone="amber" trend={due.length ? "Needs review today" : "All caught up"} alert={due.length > 0}/>
      <StatCard label="Completed visits" value={visits.filter(v => v.status === "Completed").length.toString()} note="All listed dates" icon={Check} tone="purple" trend="Recorded as complete"/>
    </section>
    <div className="dashboard-grid">
      <section className="panel recent-panel">
        <div className="panel-header"><div><h2>Recent patients</h2><p>Latest patient records in your workspace</p></div><button className="text-button" onClick={() => setPage("Patients")}>View all <ArrowRight size={15}/></button></div>
        <PatientTable patients={patients.slice(0, 4)} compact/>
      </section>
      <section className="panel activity-panel">
        <div className="panel-header"><div><h2>Today's activity</h2><p>Visits that need attention</p></div><button className="icon-button small-icon" onClick={() => setPage("Visits")} aria-label="View visits"><ArrowRight size={17}/></button></div>
        <div className="activity-list">{visits.filter(v => v.date === today).slice(0, 4).map((v, i) => <div className="activity-item" key={v.id}><div className={`activity-icon activity-${i % 3}`}>{i === 0 ? <HeartPulse size={17}/> : i === 1 ? <Clock3 size={17}/> : <Stethoscope size={17}/>}</div><div className="activity-detail"><strong>{v.patientName}</strong><span>{v.reason}</span></div><StatusPill status={v.status}/></div>)}
          {visits.filter(v => v.date === today).length === 0 && <EmptyState text="No visits recorded for today."/>}</div>
        <button className="panel-bottom-link" onClick={() => setPage("Visits")}>Open visit register <ArrowRight size={15}/></button>
      </section>
      <section className="panel followup-panel">
        <div className="panel-header"><div><h2>Follow-up schedule</h2><p>Keep continuity of care on track</p></div><button className="text-button" onClick={() => setPage("Follow-ups")}>View schedule <ArrowRight size={15}/></button></div>
        <div className="followup-list">{followUps.slice(0, 3).map(f => <div className="followup-row" key={f.id}><div className="date-tile"><strong>{new Date(`${f.date}T12:00:00`).getDate()}</strong><span>{new Date(`${f.date}T12:00:00`).toLocaleDateString("en-GB", {month:"short"})}</span></div><div className="followup-detail"><strong>{f.patientName}</strong><span>{f.purpose}</span></div><StatusPill status={f.status}/></div>)}</div>
      </section>
      <section className="panel quick-panel">
        <div className="panel-header"><div><h2>Quick actions</h2><p>Common clinic workflows</p></div></div>
        <div className="quick-actions">
          <button onClick={onNewPatient}><span className="quick-icon quick-teal"><UserRound size={19}/></span><span><strong>Register patient</strong><small>Add a new patient profile</small></span><ArrowRight size={16}/></button>
          <button onClick={onNewVisit}><span className="quick-icon quick-blue"><ClipboardList size={19}/></span><span><strong>Create visit</strong><small>Start a new visit entry</small></span><ArrowRight size={16}/></button>
          <button onClick={() => setPage("Follow-ups")}><span className="quick-icon quick-amber"><CalendarDays size={19}/></span><span><strong>Review follow-ups</strong><small>Check upcoming appointments</small></span><ArrowRight size={16}/></button>
        </div>
      </section>
    </div>
    <div className="demo-warning"><AlertCircle size={16}/><span><strong>Development preview:</strong> sample records are stored in this browser only. Do not enter real patient information until secure server authentication, access controls, audit logging and backups are configured.</span></div>
  </>;
}
function StatCard({ label, value, note, icon: Icon, tone, trend, alert }: { label: string; value: string; note: string; icon: typeof Users; tone: string; trend: string; alert?: boolean }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon stat-${tone}`}><Icon size={19}/></div></div><div className="stat-value">{value}</div><div className="stat-note">{note}</div><div className={`stat-trend ${alert ? "trend-alert" : ""}`}>{alert ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}<span>{trend}</span></div></div>;
}
function PatientsPage({ patients, query, setQuery, onAdd }: { patients: Patient[]; query: string; setQuery: (q: string) => void; onAdd: () => void }) {
  return <><PageHeading eyebrow="PATIENT CARE" title="Patients" description="Register, search and maintain patient profiles." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Register patient</button>}/><section className="panel full-panel"><div className="table-toolbar"><div><h2>Patient directory</h2><p>{patients.length} patient record{patients.length === 1 ? "" : "s"}</p></div><div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search name, ID or phone"/></div></div><PatientTable patients={patients}/>{patients.length === 0 && <EmptyState text="No matching patients. Try another search."/>}</section><div className="demo-warning"><AlertCircle size={16}/><span>Patient records in this preview are browser-local and are not yet synchronized with the Django backend.</span></div></>;
}
function PatientTable({ patients, compact = false }: { patients: Patient[]; compact?: boolean }) {
  return <div className="table-wrap"><table><thead><tr><th>Patient</th><th>Hospital ID</th><th>Age / sex</th>{!compact && <th>Phone</th>}<th>Last visit</th><th>Status</th><th></th></tr></thead><tbody>{patients.map((p, i) => <tr key={p.id}><td><div className="patient-cell"><div className={`avatar patient-avatar avatar-color-${i % 4}`}>{p.name.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase()}</div><div><strong>{p.name}</strong><small>Patient profile</small></div></div></td><td><span className="id-text">{p.hospitalNo}</span></td><td>{p.age} yrs · {p.sex === "Female" ? "F" : "M"}</td>{!compact && <td>{p.phone || "—"}</td>}<td>{formatDate(p.lastVisit)}</td><td><StatusPill status={p.status}/></td><td><button className="row-menu" aria-label={`Actions for ${p.name}`} title="More options"><MoreHorizontal size={18}/></button></td></tr>)}</tbody></table></div>;
}
function VisitsPage({ visits, onAdd, onComplete }: { visits: Visit[]; onAdd: () => void; onComplete: (id: string) => void }) {
  return <><PageHeading eyebrow="CLINICAL WORKFLOW" title="Visits" description="Review visit entries and update their administrative status." action={<button className="btn btn-primary" onClick={onAdd}><Plus size={17}/> Create visit</button>}/><section className="panel full-panel"><div className="table-toolbar"><div><h2>Visit register</h2><p>{visits.length} visit entries</p></div><span className="table-date"><CalendarDays size={16}/> Today · {formatDate(today)}</span></div><div className="table-wrap"><table><thead><tr><th>Patient</th><th>Date</th><th>Reason for visit</th><th>Assigned team</th><th>Status</th><th>Action</th></tr></thead><tbody>{visits.map(v => <tr key={v.id}><td><strong>{v.patientName}</strong><small className="sub-cell">{v.id.toUpperCase()}</small></td><td>{formatDate(v.date)}</td><td>{v.reason}</td><td>{v.clinician}</td><td><StatusPill status={v.status}/></td><td>{v.status !== "Completed" ? <button className="mini-action" onClick={() => onComplete(v.id)}><Check size={14}/> Complete</button> : <span className="done-text"><Check size={14}/> Done</span>}</td></tr>)}</tbody></table></div>{visits.length === 0 && <EmptyState text="No visits yet. Create the first visit entry."/>}</section><div className="demo-warning"><AlertCircle size={16}/><span>Visit entries are administrative placeholders. Clinical notes, diagnosis, prescriptions and vital signs must be handled through validated clinical workflows.</span></div></>;
}
function FollowUpsPage({ followUps, onComplete }: { followUps: FollowUp[]; onComplete: (id: string) => void }) {
  return <><PageHeading eyebrow="CONTINUITY OF CARE" title="Follow-ups" description="Track upcoming reviews and outstanding patient appointments."/><section className="stats-grid followup-stats"><StatCard label="Due today" value={followUps.filter(f => f.status === "Due").length.toString()} note="Needs action" icon={AlertCircle} tone="amber" trend="Review due items" alert/><StatCard label="Upcoming" value={followUps.filter(f => f.status === "Upcoming").length.toString()} note="Future appointments" icon={CalendarDays} tone="blue" trend="Plan ahead"/><StatCard label="Completed" value={followUps.filter(f => f.status === "Completed").length.toString()} note="Marked complete" icon={Check} tone="teal" trend="Follow-up tracking"/></section><section className="panel full-panel"><div className="table-toolbar"><div><h2>Appointment schedule</h2><p>Follow-up tasks and review dates</p></div></div><div className="table-wrap"><table><thead><tr><th>Patient</th><th>Follow-up date</th><th>Purpose</th><th>Status</th><th>Action</th></tr></thead><tbody>{followUps.map(f => <tr key={f.id}><td><strong>{f.patientName}</strong></td><td>{formatDate(f.date)}</td><td>{f.purpose}</td><td><StatusPill status={f.status}/></td><td>{f.status !== "Completed" ? <button className="mini-action" onClick={() => onComplete(f.id)}><Check size={14}/> Mark complete</button> : <span className="done-text"><Check size={14}/> Done</span>}</td></tr>)}</tbody></table></div>{followUps.length === 0 && <EmptyState text="No follow-up tasks currently listed."/>}</section></>;
}
function ReportsPage({ patients, visits, followUps, completedVisits }: { patients: Patient[]; visits: Visit[]; followUps: FollowUp[]; completedVisits: number }) {
  const female = patients.filter(p => p.sex === "Female").length;
  return <><PageHeading eyebrow="INSIGHTS" title="Reports" description="A simple overview of the records currently held in this preview."/><div className="report-cards"><div className="report-card"><div className="report-card-icon stat-teal"><Users size={20}/></div><span>Total patients</span><strong>{patients.length}</strong><small>All registered sample records</small></div><div className="report-card"><div className="report-card-icon stat-blue"><ClipboardList size={20}/></div><span>Total visits</span><strong>{visits.length}</strong><small>{completedVisits} marked completed</small></div><div className="report-card"><div className="report-card-icon stat-amber"><CalendarDays size={20}/></div><span>Open follow-ups</span><strong>{followUps.filter(f => f.status !== "Completed").length}</strong><small>Due or upcoming</small></div></div><section className="panel report-panel"><div className="panel-header"><div><h2>Patient overview</h2><p>Basic demographic counts from local preview data</p></div></div><div className="report-line"><div><span>Female</span><strong>{female}</strong></div><div className="progress-track"><div className="progress-fill" style={{width: `${patients.length ? female / patients.length * 100 : 0}%`}}/></div><small>{patients.length ? Math.round(female / patients.length * 100) : 0}%</small></div><div className="report-line"><div><span>Male</span><strong>{patients.length - female}</strong></div><div className="progress-track"><div className="progress-fill progress-blue" style={{width: `${patients.length ? (patients.length - female) / patients.length * 100 : 0}%`}}/></div><small>{patients.length ? Math.round((patients.length - female) / patients.length * 100) : 0}%</small></div><div className="report-disclaimer"><AlertCircle size={16}/> These are operational preview counts, not validated clinical or public-health statistics.</div></section></>;
}
function SettingsPage({ role, setRole, dark, setDark }: { role: string; setRole: (r: string) => void; dark: boolean; setDark: (d: boolean) => void }) {
  return <><PageHeading eyebrow="WORKSPACE" title="Settings" description="Manage display preferences and preview access role."/><div className="settings-layout"><section className="panel settings-panel"><div className="settings-heading"><div className="settings-symbol"><UserRound size={20}/></div><div><h2>Workspace preferences</h2><p>Personalise the interface for this device.</p></div></div><div className="setting-row"><div><strong>Display theme</strong><span>Switch between light and dark appearance.</span></div><button className={`toggle ${dark ? "toggle-on" : ""}`} onClick={() => setDark(!dark)} aria-label="Toggle dark theme"><i/></button></div><div className="setting-row"><div><strong>Preview role</strong><span>For interface testing only; not an enforced permission.</span></div><select className="role-select" value={role} onChange={e => setRole(e.target.value)}><option>Reception</option><option>Super Admin</option><option>Clinician</option><option>Pharmacist</option><option>Laboratory Staff</option></select></div></section><section className="panel settings-panel"><div className="settings-heading"><div className="settings-symbol settings-symbol-amber"><ShieldCheck size={20}/></div><div><h2>Security & data status</h2><p>Current development environment</p></div></div><div className="security-status"><span className="status-dot status-orange"/><div><strong>Local browser storage</strong><p>Records are stored on this device only and do not sync with other users.</p></div></div><div className="security-status"><span className="status-dot status-orange"/><div><strong>Server authentication pending</strong><p>Connect the frontend to Django REST API and enforce server-side roles before real use.</p></div></div><div className="security-status"><span className="status-dot status-orange"/><div><strong>Clinical deployment not ready</strong><p>Encryption, audit trails, backups and privacy review remain required.</p></div></div></section></div><div className="demo-warning"><AlertCircle size={16}/><span>Changing the preview role changes only the label in this interface. It does not grant or restrict access to data.</span></div></>;
}
function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase().replaceAll(" ", "-");
  return <span className={`status-pill pill-${normalized}`}><i/>{status}</span>;
}
function EmptyState({ text }: { text: string }) {
  return <div className="empty-state"><div><ClipboardList size={22}/></div><strong>Nothing to show</strong><p>{text}</p></div>;
}
function Modal({ title, subtitle, onClose, children }: { title: string; subtitle: string; onClose: () => void; children: React.ReactNode }) {
  return <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="modal" role="dialog" aria-modal="true" aria-label={title}><div className="modal-header"><div><h2>{title}</h2><p>{subtitle}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={19}/></button></div>{children}</section></div>;
}
