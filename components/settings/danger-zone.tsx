"use client";

import { Trash2 } from "lucide-react";

type BulkDeleteTarget = "tasks" | "habits" | "goals" | "account";

interface DangerZoneProps {
  onDelete: (target: BulkDeleteTarget) => void;
}

export default function DangerZone({ onDelete }: DangerZoneProps) {
  return (
    <div className="bg-modal-bg border border-carmin/40 rounded-3xl p-6 md:p-8">
      <h2 className="text-white-pearl font-title text-xl font-semibold mb-2">Danger Zone</h2>
      <p className="text-input-text text-sm mb-6">
        Irreversible actions that affect your data permanently.
      </p>
      <div className="space-y-3">
        <button
          onClick={() => onDelete("tasks")}
          className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete All Tasks
        </button>
        <button
          onClick={() => onDelete("habits")}
          className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete All Habits
        </button>
        <button
          onClick={() => onDelete("goals")}
          className="flex items-center gap-2 px-5 py-2.5 w-full sm:w-auto bg-carmin/10 text-carmin border border-carmin/30 rounded-xl hover:bg-carmin/20 transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete All Goals (+ Tasks &amp; Habits)
        </button>

        <hr className="border-carmin/20 my-4" />

        <button
          onClick={() => onDelete("account")}
          className="flex items-center gap-2 px-5 py-2.5 bg-carmin/20 text-carmin border border-carmin/40 rounded-xl hover:bg-carmin/30 transition-colors">
          <Trash2 className="w-4 h-4" />
          Delete Account
        </button>
      </div>
    </div>
  );
}
