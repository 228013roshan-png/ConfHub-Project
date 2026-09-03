import React, { useState, useEffect } from "react";
import { ScheduleItem, Paper, Conference } from "../types";
import { Calendar, Plus, Trash2, ArrowUp, ArrowDown, ChevronRight, Save, Sparkles, AlertCircle } from "lucide-react";

interface ScheduleBuilderProps {
  schedule: ScheduleItem[];
  conferenceId?: string;
  conferences?: Conference[];
  onSaveSchedule: (newSchedule: ScheduleItem[]) => Promise<void>;
  papers?: Paper[];
}

export function ScheduleBuilder({ 
  schedule, 
  conferenceId: initialConferenceId, 
  conferences = [], 
  onSaveSchedule, 
  papers = [] 
}: ScheduleBuilderProps) {
  // Active conference filter state: "all" or specific conferenceId
  const [selectedConfId, setSelectedConfId] = useState<string>(() => {
    if (initialConferenceId && initialConferenceId !== "conf-1") return initialConferenceId;
    if (conferences.length > 0) return conferences[0].id;
    return "all";
  });

  // Effective conference ID for new items
  const activeConferenceId = selectedConfId === "all" 
    ? (conferences[0]?.id || initialConferenceId || "conf-1")
    : selectedConfId;

  const [items, setItems] = useState<ScheduleItem[]>(() => {
    if (selectedConfId === "all") return schedule;
    return schedule.filter((s) => s.conferenceId === selectedConfId);
  });

  // Keep internal items in sync whenever schedule or selectedConfId changes from props
  useEffect(() => {
    if (selectedConfId === "all") {
      setItems(schedule);
    } else {
      setItems(schedule.filter((s) => s.conferenceId === selectedConfId));
    }
  }, [schedule, selectedConfId]);

  const [saving, setSaving] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState<string | null>(null);
  
  // Quick session state for adding new entries
  const [newTime, setNewTime] = useState("02:00 PM - 03:00 PM");
  const [newTitle, setNewTitle] = useState("");
  const [newSpeaker, setNewSpeaker] = useState("");
  const [newRoom, setNewRoom] = useState("Hall A - Annapurna");
  const [newType, setNewType] = useState("Paper Presentation");
  const [newConfTarget, setNewConfTarget] = useState<string>(activeConferenceId);

  // Sync newConfTarget with activeConferenceId
  useEffect(() => {
    setNewConfTarget(activeConferenceId);
  }, [activeConferenceId]);

  // Keep list of accepted papers (optionally filtered by selected conference)
  const acceptedPapers = papers.filter((p) => {
    if (p.status !== "Accepted") return false;
    if (selectedConfId === "all") return true;
    return !p.conferenceId || p.conferenceId === selectedConfId;
  });

  const handleAutoAllocate = () => {
    const accepted = [...acceptedPapers];
    if (accepted.length === 0) {
      setScheduleNotice("No accepted papers found yet. Submit manuscripts via the Author Portal, complete reviews, and click 'Accept Paper' in the Admin Portal.");
      setTimeout(() => setScheduleNotice(null), 5000);
      return;
    }

    let paperIndex = 0;
    const updatedItems = items.map((item) => {
      if (item.type === "Paper Presentation" && paperIndex < accepted.length) {
        const paper = accepted[paperIndex++];
        return {
          ...item,
          sessionTitle: `Technical Session: ${paper.title}`,
          speaker: paper.authorName,
        };
      }
      return item;
    });

    // If there are more accepted papers than existing presentation slots, automatically append them!
    const extraItems: ScheduleItem[] = [];
    while (paperIndex < accepted.length) {
      const paper = accepted[paperIndex++];
      extraItems.push({
        id: `sch-dyn-${Date.now()}-${paperIndex}`,
        conferenceId: paper.conferenceId || activeConferenceId,
        timeSlot: "04:00 PM - 05:00 PM",
        sessionTitle: `Technical Session: ${paper.title}`,
        speaker: paper.authorName,
        type: "Paper Presentation",
        room: "Hall A - Annapurna",
      });
    }

    setItems([...updatedItems, ...extraItems]);
    setScheduleNotice(`Successfully allocated ${accepted.length} accepted manuscript(s) to timetable slots.`);
    setTimeout(() => setScheduleNotice(null), 4000);
  };

  const handleAdd = () => {
    if (!newTitle) return;
    const targetConf = newConfTarget || activeConferenceId;
    const newItem: ScheduleItem = {
      id: `sch-dyn-${Date.now()}`,
      conferenceId: targetConf,
      timeSlot: newTime,
      sessionTitle: newTitle,
      speaker: newSpeaker || "TBA",
      type: newType,
      room: newRoom,
    };
    const updated = [...items, newItem];
    setItems(updated);
    setNewTitle("");
    setNewSpeaker("");
  };

  const handleDelete = (id: string) => {
    const updated = items.filter((i) => i.id !== id);
    setItems(updated);
  };

  const moveItem = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;
    const updated = [...items];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setItems(updated);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (selectedConfId === "all") {
        // Saving all items directly
        await onSaveSchedule(items);
      } else {
        // Merge with schedule items from other conferences
        const otherItems = schedule.filter((s) => s.conferenceId !== selectedConfId);
        await onSaveSchedule([...otherItems, ...items]);
      }
      setScheduleNotice("Schedule saved successfully!");
      setTimeout(() => setScheduleNotice(null), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch (type) {
      case "Keynote":
        return "bg-blue-50 border-blue-150 text-blue-700";
      case "Paper Presentation":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "Panel":
        return "bg-purple-50 border-purple-200 text-purple-700";
      default:
        return "bg-slate-50 border-slate-200 text-slate-700";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
      <div className="p-6 border-b border-slate-150 flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-slate-50/20">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-slate-400 shrink-0" />
          <div>
            <h3 className="font-bold text-slate-850 text-sm">Interactive Program Schedule</h3>
            <p className="text-xs text-slate-405">Configure real-time timetables, rooms, and presentation lists</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {conferences.length > 0 && (
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setSelectedConfId("all")}
                className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer ${
                  selectedConfId === "all"
                    ? "bg-white text-blue-600 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                All Conferences ({schedule.length})
              </button>
              {conferences.map((c) => {
                const count = schedule.filter((s) => s.conferenceId === c.id).length;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedConfId(c.id)}
                    className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors cursor-pointer truncate max-w-[140px] ${
                      selectedConfId === c.id
                        ? "bg-white text-blue-600 shadow-2xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                    title={c.title}
                  >
                    {c.title.split(" - ")[0]} ({count})
                  </button>
                );
              })}
            </div>
          )}

          {acceptedPapers.length > 0 && (
            <button
              onClick={handleAutoAllocate}
              title="Auto-allocate all accepted papers sequentially into Paper Presentation slots"
              className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors cursor-pointer shadow-3xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Auto-Allocate ({acceptedPapers.length})</span>
            </button>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </div>
      </div>

      {scheduleNotice && (
        <div className="px-6 py-2.5 bg-blue-50 border-b border-blue-100 text-blue-800 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{scheduleNotice}</span>
          </div>
          <button
            onClick={() => setScheduleNotice(null)}
            className="text-blue-500 hover:text-blue-700 text-xs font-semibold"
          >
            &times;
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
        
        {/* Form to Add slots */}
        <div className="p-6 space-y-4 lg:col-span-1">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
            Insert Program Slot
          </h4>

          {acceptedPapers.length > 0 && (
            <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-105 border-blue-100 space-y-1.5">
              <span className="block text-[9px] font-bold text-blue-700 uppercase tracking-widest leading-none">
                ⚡ Dynamic Allocation Assistant
              </span>
              <p className="text-[9.5px] text-slate-400 leading-tight">Apply accepted papers directly into slot metadata fields:</p>
              <select
                onChange={(e) => {
                  const paperId = e.target.value;
                  const found = acceptedPapers.find((p) => p.id === paperId);
                  if (found) {
                    setNewTitle(`Technical Presentation: ${found.title}`);
                    setNewSpeaker(found.authorName);
                    setNewType("Paper Presentation");
                  }
                }}
                defaultValue=""
                className="w-full text-xs bg-white border border-slate-200 rounded-lg p-1.5 outline-none cursor-pointer text-slate-705"
              >
                <option value="">-- Apply Accepted Paper --</option>
                {acceptedPapers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.authorName} &mdash; {p.title.length > 40 ? p.title.substring(0, 40) + "..." : p.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-3 pt-2">
            {conferences.length > 1 && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Target Conference</label>
                <select
                  value={newConfTarget}
                  onChange={(e) => setNewConfTarget(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 font-medium transition-colors"
                >
                  {conferences.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Time Slot</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-205 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session Description / Paper Title</label>
              <input
                type="text"
                placeholder="e.g. Technical Session B: Cloud Security"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-205 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 transition-colors"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Speaker / Moderator</label>
              <input
                type="text"
                placeholder="e.g. Er. Ramesh Pokharel"
                value={newSpeaker}
                onChange={(e) => setNewSpeaker(e.target.value)}
                className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-205 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Session Type</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full mt-1 px-2 py-1.5 text-xs bg-white border border-slate-205 border-slate-200 rounded-lg text-slate-755 outline-none focus:border-blue-500 transition-colors"
                >
                  <option value="Keynote">Keynote</option>
                  <option value="Paper Presentation">Paper Presentation</option>
                  <option value="Panel">Panel</option>
                  <option value="Coffee Break">Coffee Break</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Venue Room</label>
                <input
                  type="text"
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 text-xs bg-white border border-slate-205 border-slate-200 rounded-lg outline-none focus:border-blue-500 text-slate-700 transition-colors"
                />
              </div>
            </div>

            <button
              onClick={handleAdd}
              disabled={!newTitle}
              className="w-full pt-2 flex items-center justify-center space-x-1 py-2 bg-slate-900 hover:bg-slate-850 disabled:opacity-50 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Session Block</span>
            </button>
          </div>
        </div>

        {/* Dynamic Display Timetable list */}
        <div className="p-6 lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Live Conference Flow View
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              {items.length} Active Timings
            </span>
          </div>

          {items.length === 0 ? (
            <div className="p-6 border border-dashed border-slate-250 border-slate-200 rounded-xl text-center bg-white">
              <p className="text-xs text-slate-400 font-medium">No session times configured yet. Create a session block on the left pane.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="p-3 bg-white border border-slate-200 rounded-lg hover:border-blue-150 shadow-3xs flex items-start justify-between space-x-3 group transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-[11px] font-mono font-bold text-slate-500">
                        {item.timeSlot}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] rounded-full font-semibold border ${getTypeStyle(item.type)}`}>
                        {item.type}
                      </span>
                    </div>

                    <h5 className="font-bold text-xs text-slate-800 leading-snug">
                      {item.sessionTitle}
                    </h5>

                    <p className="text-[11px] text-slate-550">
                      Speaker: <span className="text-slate-800 font-semibold">{item.speaker}</span> &middot; Room: <span className="text-slate-600 font-medium">{item.room}</span>
                    </p>
                  </div>

                  {/* Ordering Actions */}
                  <div className="flex items-center space-x-1 shrink-0">
                    <button
                      onClick={() => moveItem(index, "up")}
                      disabled={index === 0}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => moveItem(index, "down")}
                      disabled={index === items.length - 1}
                      className="p-1 hover:bg-slate-100 text-slate-400 disabled:opacity-20 rounded transition-all cursor-pointer"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 hover:bg-rose-50 text-rose-500 rounded transition-all cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
