import React, { useEffect, useState } from "react";
import { getAllWinners, updateWinner, deleteWinner, clearAllWinners } from "../utils/winnersDB";

export default function WinnersTable() {
  const [winners, setWinners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");

  // Load winners on mount
  useEffect(() => {
    loadWinners();
  }, []);

  // Listen for database updates from other tabs
  useEffect(() => {
    const handleDBUpdate = async () => {
      loadWinners();
    };

    window.addEventListener('winnersDBUpdated', handleDBUpdate);
    return () => window.removeEventListener('winnersDBUpdated', handleDBUpdate);
  }, []);

  const loadWinners = async () => {
    try {
      setLoading(true);
      const data = await getAllWinners();
      setWinners(data);
    } catch (error) {
      console.error("Failed to load winners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditName = (id, currentName) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const handleSaveName = async (id) => {
    if (!editName.trim()) {
      setEditingId(null);
      return;
    }

    try {
      await updateWinner(id, { name: editName.trim() });
      setEditingId(null);
      loadWinners();
    } catch (error) {
      console.error("Failed to update winner:", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Hapus pemenang ini?")) {
      try {
        await deleteWinner(id);
        loadWinners();
      } catch (error) {
        console.error("Failed to delete winner:", error);
      }
    }
  };

  const handleClearAll = async () => {
    if (window.confirm("Hapus SEMUA pemenang? Tindakan ini tidak bisa dibatalkan.")) {
      try {
        await clearAllWinners();
        loadWinners();
      } catch (error) {
        console.error("Failed to clear winners:", error);
      }
    }
  };

  const handleCopyLink = (link) => {
    navigator.clipboard.writeText(link);
    alert("Link disalin!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-zinc-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl sm:text-3xl font-black tracking-tight">📊 Daftar Pemenang</h2>
        <div className="text-xs sm:text-sm font-semibold bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full">
          {winners.length} pemenang
        </div>
      </div>

      {winners.length === 0 ? (
        <div className="rounded-2xl bg-gray-50 border border-gray-200 p-6 text-center text-gray-600">
          Belum ada pemenang yang terdaftar
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full text-sm">
              <thead className="bg-emerald-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">#</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Nama</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Link</th>
                  <th className="px-4 py-3 text-left font-bold text-gray-700">Waktu</th>
                  <th className="px-4 py-3 text-center font-bold text-gray-700">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {winners.map((winner, idx) => (
                  <tr key={winner.id} className="border-b border-gray-200 hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-600">{idx + 1}</td>
                    <td className="px-4 py-3">
                      {editingId === winner.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-2 py-1 border border-blue-300 rounded text-sm outline-none focus:ring-2 focus:ring-blue-500/40"
                          autoFocus
                        />
                      ) : (
                        <span className="font-semibold text-gray-900">{winner.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600 truncate max-w-xs">
                          {winner.link}
                        </code>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
                      {new Date(winner.timestamp).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 justify-center">
                        {editingId === winner.id ? (
                          <>
                            <button
                              onClick={() => handleSaveName(winner.id)}
                              className="px-2 py-1 bg-green-600 hover:bg-green-500 text-white text-xs rounded font-semibold"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="px-2 py-1 bg-gray-400 hover:bg-gray-300 text-white text-xs rounded font-semibold"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditName(winner.id, winner.name)}
                              className="px-2 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded font-semibold"
                              title="Edit nama"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleCopyLink(winner.link)}
                              className="px-2 py-1 bg-purple-600 hover:bg-purple-500 text-white text-xs rounded font-semibold"
                              title="Salin link"
                            >
                              📋
                            </button>
                            <button
                              onClick={() => handleDelete(winner.id)}
                              className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white text-xs rounded font-semibold"
                              title="Hapus"
                            >
                              🗑️
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={handleClearAll}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 transition-transform text-white font-bold rounded-lg text-sm"
          >
            🗑️ Hapus Semua Pemenang
          </button>
        </>
      )}
    </div>
  );
}
