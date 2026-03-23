"use client";

import { useMemo, useRef, useState } from "react";

type Phase = "Preclinical" | "Phase 1" | "Phase 2" | "Phase 3" | "Registration";
type Status = "On Track" | "Delayed" | "At Risk";

interface Milestone {
  id: number;
  name: string;
  targetDate: string;
  status: Status;
}

interface Study {
  id: number;
  name: string;
  enrollment: number;
  targetEnrollment: number;
  sites: number;
}

interface Program {
  id: number;
  name: string;
  therapeuticArea: string;
  phase: Phase;
  status: Status;
  milestones: Milestone[];
  studies: Study[];
}

const phases: Phase[] = ["Preclinical", "Phase 1", "Phase 2", "Phase 3", "Registration"];
const areas = ["Oncology", "Cardiology", "Neurology", "Immunology", "Endocrinology"];
const statuses: Status[] = ["On Track", "Delayed", "At Risk"];

const createSyntheticPrograms = (count = 120): Program[] => {
  const programs: Program[] = [];
  const today = new Date();

  const getPhase = (idx: number) => phases[idx % phases.length];
  const getArea = (idx: number) => areas[idx % areas.length];
  const getStatus = (idx: number) => statuses[idx % statuses.length];

  for (let i = 1; i <= count; i++) {
    const phase = getPhase(i - 1);
    const therapeuticArea = getArea(i - 1);
    const status = getStatus((i * 2) % statuses.length);

    const milestoneCount = 3 + ((i * 7) % 3);
    const milestones: Milestone[] = [];
    for (let mi = 1; mi <= milestoneCount; mi++) {
      const target = new Date(today);
      target.setDate(target.getDate() + mi * 21 + (i % 5) * 3);
      milestones.push({
        id: mi,
        name: `Milestone ${mi}`,
        targetDate: target.toISOString().slice(0, 10),
        status: getStatus((i + mi) % statuses.length),
      });
    }

    const studyCount = 1 + ((i * 3) % 4);
    const studies: Study[] = [];
    for (let si = 1; si <= studyCount; si++) {
      const targetEnrollment = 100 + ((i * si * 13) % 250);
      const enrollment = Math.min(targetEnrollment, 20 + ((i * si * 11) % targetEnrollment));
      studies.push({
        id: si,
        name: `${therapeuticArea} Study ${i}-${si}`,
        enrollment,
        targetEnrollment,
        sites: 5 + ((i + si) % 20),
      });
    }

    programs.push({
      id: i,
      name: `Program ${i} (${therapeuticArea.slice(0, 3).toUpperCase()})`,
      therapeuticArea,
      phase,
      status,
      milestones,
      studies,
    });
  }

  return programs;
};

const initialPrograms = createSyntheticPrograms(200);

export default function Home() {
  const [selectedProgramId, setSelectedProgramId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [selectedPhases, setSelectedPhases] = useState<Phase[]>([]);
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [programs, setPrograms] = useState<Program[]>(initialPrograms);
  const [editedProgram, setEditedProgram] = useState<Program | null>(null);
  const [auditTrail, setAuditTrail] = useState<any[]>([]);
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const asideRef = useRef<HTMLDivElement>(null);

  const filteredPrograms = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return programs.filter((program) => {
      if (selectedPhases.length && !selectedPhases.includes(program.phase)) return false;
      if (selectedAreas.length && !selectedAreas.includes(program.therapeuticArea)) return false;
      if (normalizedSearch && !program.name.toLowerCase().includes(normalizedSearch) && !program.phase.toLowerCase().includes(normalizedSearch) && !program.therapeuticArea.toLowerCase().includes(normalizedSearch) && !program.status.toLowerCase().includes(normalizedSearch) && !program.studies.some(study => study.name.toLowerCase().includes(normalizedSearch))) return false;
      return true;
    });
  }, [programs, selectedPhases, selectedAreas, search]);

  const hasFilters = search.trim() || selectedPhases.length > 0 || selectedAreas.length > 0;

  const selectedProgram = programs.find((p) => p.id === selectedProgramId) || null;
  const displayProgram = editedProgram || selectedProgram;

  const updateEditedProgram = (key: keyof Program, value: string) => {
    if (!displayProgram) return;
    setEditedProgram({
      ...displayProgram,
      [key]: value,
    });
  };

  const saveEditedProgram = () => {
    if (!editedProgram) return;
    setPrograms((current) =>
      current.map((p) =>
        p.id === editedProgram.id ? editedProgram : p
      )
    );
    setAuditTrail(prev => [...prev, {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      action: 'Program Updated',
      programId: editedProgram.id,
      programName: editedProgram.name,
      user: 'Current User',
    }]);
    setShowAuditTrail(true);
    asideRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    setEditedProgram(null);
    setIsAuthorized(false);
  };

  const cancelEdit = () => {
    setEditedProgram(null);
  };

  const applyToggle = <T,>(value: T, setState: (v: T[]) => void, current: T[], item: T) => {
    if (current.includes(item)) {
      setState(current.filter((x) => x !== item));
    } else {
      setState([...current, item]);
    }
  };

  const getStatusBadgeClass = (status: Status) => {
    switch (status) {
      case "On Track":
        return "bg-emerald-100 text-emerald-700";
      case "Delayed":
        return "bg-amber-100 text-amber-700";
      case "At Risk":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-merck-bg text-merck p-4 md:p-8">
      <div className="flex justify-start mb-4 bg-transparent">
        <img
          src="/logo.png"
          alt="Merck logo"
          className="h-10 w-28 rounded-sm object-contain"
        />
      </div>
      <header className="mb-6 rounded-xl bg-merck-surface p-4 shadow-sm ring-1 ring-merck border-merck">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-merck-foreground">Drug Development Portfolio Dashboard</h1>
            <p className="text-sm text-merck-muted">Browse programs, filter phases and therapeutic areas, track milestones and enrollment in Merck style.</p>
          </div>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={isAuthorized}
              onChange={(e) => setIsAuthorized(e.target.checked)}
              aria-label="Toggle edit authorization"
            />
            Edit mode (authorized)
          </label>
        </div>
      </header>

      <section className="mb-5 flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-0">
          <label htmlFor="search" className="mb-1 block text-sm font-medium">Quick search</label>
          <div className="relative">
            <input
              id="search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg bg-merck-surface px-3 py-2 shadow-sm focus-visible:outline-merck-primary focus:ring-2 focus:ring-merck-primary/40"
              placeholder="search programs, phases, areas, status, studies"
              aria-label="Search programs by name, phase, therapeutic area, status, or study names"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-merck-muted hover:text-merck-foreground focus:outline-none"
                aria-label="Clear search query"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-merck-muted">Programs: <strong className="text-merck-foreground">{filteredPrograms.length}</strong></span>
          <button
            className={`rounded-md px-3 py-1 text-sm font-medium ${hasFilters ? 'bg-merck-primary text-white hover:bg-merck-primary-dark' : 'bg-merck-surface text-merck-muted hover:bg-merck-bg'}`}
            onClick={() => {
              setSearch("");
              setSelectedPhases([]);
              setSelectedAreas([]);
            }}
          >
            Clear filters
          </button>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Phase</span>
          <div className="flex flex-wrap gap-2">
            {phases.map((phase) => (
              <button
                key={phase}
                onClick={() => applyToggle<Phase>(phase, setSelectedPhases, selectedPhases, phase)}
                className={`rounded-md px-3 py-1 text-sm ring-1 ${selectedPhases.includes(phase) ? "bg-merck-primary text-white ring-merck-primary" : "bg-merck-surface text-merck-muted ring-merck"}`}
                aria-pressed={selectedPhases.includes(phase) ? "true" : "false"}
              >
                {phase}
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium">Therapeutic Area</span>
          <div className="flex flex-wrap gap-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => applyToggle<string>(area, setSelectedAreas, selectedAreas, area)}
                className={`rounded-md px-3 py-1 text-sm ring-1 ${selectedAreas.includes(area) ? "bg-merck-primary text-white ring-merck-primary" : "bg-merck-surface text-merck-muted ring-merck"}`}
                aria-pressed={selectedAreas.includes(area) ? "true" : "false"}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6 mb-6 items-stretch">
        <section className="overflow-hidden rounded-lg bg-merck-surface shadow-sm ring-1 ring-merck border-merck h-[380px]">
          <div className="h-full overflow-auto">
            <table className="min-w-full divide-y divide-merck border-merck text-left text-sm" aria-label="Program list">
              <thead className="bg-merck-bg sticky top-0">
                <tr>
                  <th scope="col" className="px-3 py-2 text-merck-muted">Program</th>
                  <th scope="col" className="px-3 py-2 text-merck-muted">Phase</th>
                  <th scope="col" className="px-3 py-2 text-merck-muted">Therapeutic Area</th>
                  <th scope="col" className="px-3 py-2 text-merck-muted">Status</th>
                  <th scope="col" className="px-3 py-2 text-merck-muted">Studies</th>
                </tr>
              </thead>
              <tbody>
                {filteredPrograms.map((program) => (
                  <tr
                    key={program.id}
                    onClick={() => {
                      setSelectedProgramId(program.id);
                      setEditedProgram({...program});
                    }}
                    className={`cursor-pointer transition hover:bg-merck-bg ${selectedProgramId === program.id ? "bg-emerald-50" : ""}`}
                    aria-selected={selectedProgramId === program.id}
                  >
                    <td className="px-3 py-2">{program.name}</td>
                    <td className="px-3 py-2">{program.phase}</td>
                    <td className="px-3 py-2">{program.therapeuticArea}</td>
                    <td className="px-3 py-2"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(program.status)}`}>{program.status}</span></td>
                    <td className="px-3 py-2">{program.studies.length}</td>
                  </tr>
                ))}
                {filteredPrograms.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-5 text-center text-merck-muted">
                      No matching programs. Adjust filters to view results.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>

        <aside ref={asideRef} className="rounded-lg bg-merck-surface p-4 shadow-sm ring-1 ring-merck border-merck h-[380px] overflow-auto">
          {displayProgram ? (
            <>
              {showAuditTrail && (
                <section aria-label="Audit Trail" className="mb-4 rounded-md bg-emerald-50 border border-emerald-200 p-3 relative">
                  <button
                    onClick={() => setShowAuditTrail(false)}
                    className="absolute top-2 right-2 text-emerald-600 hover:text-emerald-800"
                    aria-label="Close audit trail"
                  >
                    ×
                  </button>
                  <ul className="space-y-2 mt-6">
                    {auditTrail.filter(entry => entry.programId === displayProgram.id).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((entry) => (
                      <li key={entry.id} className="rounded-md border border-emerald-200 p-2 bg-white text-sm">
                        <div className="flex justify-between">
                          <strong className="text-emerald-800">{entry.action}</strong>
                          <span className="text-emerald-600">{new Date(entry.timestamp).toLocaleString()}</span>
                        </div>
                        <p className="text-emerald-700">By: {entry.user}</p>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <h2 className="text-xl font-semibold text-merck-foreground">Program detail</h2>
                <p className="text-sm text-merck-muted">ID: {displayProgram.id}</p>
              </div>

              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm uppercase tracking-wide text-merck-muted">Name</label>
                  {isAuthorized ? (
                    <input
                      className="w-full rounded-md border border-merck px-2 py-1 focus:outline-merck-primary"
                      value={displayProgram.name}
                      onChange={(e) => updateEditedProgram("name", e.target.value)}
                      aria-label="Edit program name"
                    />
                  ) : (
                    <p>{displayProgram.name}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm uppercase tracking-wide text-merck-muted">Phase</label>
                  {isAuthorized ? (
                    <select
                      className="w-full rounded-md border border-merck px-2 py-1 focus:outline-merck-primary"
                      value={displayProgram.phase}
                      onChange={(e) => updateEditedProgram("phase", e.target.value)}
                      aria-label="Edit program phase"
                    >
                      {phases.map((phase) => (
                        <option key={phase} value={phase}>{phase}</option>
                      ))}
                    </select>
                  ) : (
                    <p>{displayProgram.phase}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm uppercase tracking-wide text-merck-muted">Therapeutic Area</label>
                  {isAuthorized ? (
                    <select
                      className="w-full rounded-md border border-merck px-2 py-1 focus:outline-merck-primary"
                      value={displayProgram.therapeuticArea}
                      onChange={(e) => updateEditedProgram("therapeuticArea", e.target.value)}
                      aria-label="Edit therapeutic area"
                    >
                      {areas.map((area) => (
                        <option key={area} value={area}>{area}</option>
                      ))}
                    </select>
                  ) : (
                    <p>{displayProgram.therapeuticArea}</p>
                  )}
                </div>

                <div>
                  <label className="mb-1 block text-sm uppercase tracking-wide text-merck-muted">Status</label>
                  <p>{displayProgram.status}</p>
                </div>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <section aria-label="Milestones">
                  <h3 className="text-lg font-semibold text-merck-foreground">Milestones</h3>
                  <ul className="mt-2 space-y-2">
                    {displayProgram.milestones.map((m) => (
                      <li key={m.id} className="rounded-md border border-merck p-2 bg-merck-bg">
                        <div className="flex justify-between">
                          <strong>{m.name}</strong>
                          <span className="text-sm text-merck-muted">{m.targetDate}</span>
                        </div>
                        <span className="text-sm text-merck-muted">{m.status}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section aria-label="Studies">
                  <h3 className="text-lg font-semibold text-merck-foreground">Study enrollment</h3>
                  <div className="mt-2 space-y-2">
                    {displayProgram.studies.map((s) => {
                      const pct = Math.round((s.enrollment / s.targetEnrollment) * 100);
                      return (
                        <article key={s.id} className="rounded-md border border-merck p-2 bg-merck-bg">
                          <div className="flex justify-between">
                            <strong>{s.name}</strong>
                            <span className="text-sm text-merck-muted">Sites: {s.sites}</span>
                          </div>
                          <p className="text-sm text-merck-muted">{s.enrollment}/{s.targetEnrollment} enrolled ({pct}%)</p>
                          <div className="h-2 mt-1 overflow-hidden rounded bg-merck-border">
                            <div className="h-full bg-merck-primary" style={{ width: `${Math.min(pct, 100)}%` }} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  {isAuthorized && editedProgram && (
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={saveEditedProgram}
                        className="rounded-md bg-merck-primary px-4 py-2 text-sm font-medium text-white hover:bg-merck-primary-dark"
                      >
                        Save Changes
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="rounded-md bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </section>
              </div>
            </>
          ) : (
            <p className="text-sm text-merck-muted">Select a program in the table above to inspect milestones and studies.</p>
          )}
        </aside>
      </div>

      <footer className="mt-6 text-xs text-merck-muted">
        Data is synthetic and generated for demonstration (no patient or PII data included).
      </footer>
    </div>
  );
}
