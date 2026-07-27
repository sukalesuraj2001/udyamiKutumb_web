import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Plus, Upload, Play, Trash2, Link2, X, CheckCircle, Loader2 } from "lucide-react";
import {
  fetchAllTrainings,
  createTraining,
  deleteTraining,
  resetCreateStatus,
  selectTrainings,
  selectFetchStatus,
  selectCreateStatus,
  selectUCError,
} from "../../../redux/slices/Uctrainingslice.js";
import { selectUser } from "../../../redux/slices/authSlice.js";

// ── Helpers ───────────────────────────────────────────────────────────────────
function getYouTubeId(url) {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}
function getThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ── Player Modal ──────────────────────────────────────────────────────────────
function PlayerModal({ video, onClose }) {
  if (!video) return null;
  const ytId = getYouTubeId(video.ytLink ?? "");
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-3xl rounded-2xl overflow-hidden shadow-2xl bg-black"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
        >
          <X size={15} />
        </button>
        <div className="aspect-video">
          {ytId ? (
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${ytId}?autoplay=1`}
              title={video.title ?? "Training video"}
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white text-sm">
              Invalid YouTube link
            </div>
          )}
        </div>
        <div className="bg-[#111] px-5 py-3">
          <p className="text-white font-semibold text-[14px]">{video.title ?? video.ytLink}</p>
        </div>
      </div>
    </div>
  );
}

// ── Video Card ────────────────────────────────────────────────────────────────
function VideoCard({ video, onPlay, onDelete, deleting }) {
  const ytId  = getYouTubeId(video.ytLink ?? "");
  const thumb = ytId ? getThumb(ytId) : null;

  return (
    <div className="group rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden hover:shadow-md transition-all duration-200">
      {/* Thumbnail */}
      <div
        className="relative aspect-video bg-[#0F172A] cursor-pointer overflow-hidden"
        onClick={() => onPlay(video)}
      >
        {thumb ? (
          <img
            src={thumb}
            alt="thumbnail"
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1B4332] to-[#065F46]">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="white" opacity="0.4">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
            </svg>
          </div>
        )}
        {/* Play overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 rounded-full bg-white/95 flex items-center justify-center shadow-xl">
            <Play size={22} className="text-[#1B4332] fill-[#1B4332] ml-0.5" />
          </div>
        </div>
        {/* YT badge */}
        <div className="absolute top-2.5 left-2.5">
          <span className="flex items-center gap-1 bg-red-600 text-white text-[10.5px] font-bold px-2 py-0.5 rounded-md">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
            </svg>
            YouTube
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] text-[#374151] break-all line-clamp-2 leading-snug flex-1">
            {video.ytLink}
          </p>
          <button
            onClick={() => onDelete(video.id)}
            disabled={deleting}
            className="shrink-0 w-7 h-7 rounded-lg flex items-center justify-center text-[#9CA3AF] hover:bg-red-50 hover:text-red-500 disabled:opacity-40 transition-colors"
          >
            {deleting ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
          </button>
        </div>
        {video.createdAt && (
          <p className="text-[11.5px] text-[#9CA3AF] mt-2 pt-2 border-t border-[#F3F4F6]">
            Added {new Date(video.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
          </p>
        )}
      </div>
    </div>
  );
}

// ── Add Panel ─────────────────────────────────────────────────────────────────
function AddVideoPanel({ onClose, onSubmit, creating }) {
  const [url, setUrl] = useState("");
  const ytId = getYouTubeId(url);

  const handleSave = () => {
    if (!ytId) return;
    onSubmit(url);
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#F3F4F6] bg-[#FAFAFA]">
          <div>
            <p className="text-[15px] font-bold text-[#111827]">Add training video</p>
            <p className="text-[12px] text-[#6B7280] mt-0.5">Paste a YouTube link to add it to the library</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-[#6B7280] hover:bg-gray-100 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* URL input */}
          <div>
            <label className="block text-[11.5px] font-bold text-[#6B7280] uppercase tracking-widest mb-1.5">
              YouTube URL
            </label>
            <div className="relative">
              <Link2 size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full pl-9 pr-4 py-3 rounded-xl border border-[#E5E7EB] text-[13.5px] text-[#111827] placeholder:text-[#D1D5DB] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition-all"
              />
            </div>
          </div>

          {/* Live preview */}
          {ytId && (
            <div className="rounded-xl overflow-hidden border border-[#E5E7EB] aspect-video relative bg-black">
              <img src={getThumb(ytId)} className="w-full h-full object-cover opacity-80" alt="preview" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg">
                  <Play size={18} className="text-[#1B4332] fill-[#1B4332] ml-0.5" />
                </div>
              </div>
              <span className="absolute bottom-2 left-2 bg-black/60 text-white text-[10.5px] font-semibold px-2 py-0.5 rounded-md flex items-center gap-1">
                <CheckCircle size={10} /> Valid YouTube link
              </span>
            </div>
          )}

          {/* Invalid hint */}
          {url && !ytId && (
            <p className="text-[12.5px] text-red-500 flex items-center gap-1.5">
              <X size={13} /> Invalid YouTube URL — paste a valid youtube.com or youtu.be link
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#E5E7EB] text-[13.5px] font-semibold text-[#374151] hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!ytId || creating}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#1B4332] hover:bg-[#14532D] text-white text-[13.5px] font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              {creating ? <><Loader2 size={14} className="animate-spin" /> Adding...</> : "Add video"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function UCTraining() {
  const dispatch      = useDispatch();
  const user          = useSelector(selectUser);
  const trainings     = useSelector(selectTrainings);
  const fetchStatus   = useSelector(selectFetchStatus);
  const createStatus  = useSelector(selectCreateStatus);
  const error         = useSelector(selectUCError);

  const [panelOpen,    setPanelOpen]    = useState(false);
  const [playing,      setPlaying]      = useState(null);
  const [deletingId,   setDeletingId]   = useState(null);

  // fetch on mount
  useEffect(() => {
    if (fetchStatus === "idle") dispatch(fetchAllTrainings());
  }, [dispatch, fetchStatus]);

  // close panel on create success
  useEffect(() => {
    if (createStatus === "succeeded") {
      setPanelOpen(false);
      dispatch(resetCreateStatus());
    }
  }, [createStatus, dispatch]);

  const handleSubmit = (ytLink) => {
    dispatch(createTraining({ ytLink, createdUserId: user?.id }));
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    await dispatch(deleteTraining(id));
    setDeletingId(null);
  };

  return (
    <>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-[22px] font-extrabold text-[#111827] tracking-tight">UC Training</h2>
            <p className="text-[13px] text-[#6B7280] mt-0.5">
              {trainings.length} video{trainings.length !== 1 ? "s" : ""} · visible to all members
            </p>
          </div>
          <button
            onClick={() => setPanelOpen(true)}
            className="flex items-center gap-2 bg-[#1B4332] hover:bg-[#14532D] active:scale-[0.98] text-white text-[13.5px] font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={15} /> Add video
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-[13px] text-red-600">
            <X size={14} /> {error}
          </div>
        )}

        {/* Loading */}
        {fetchStatus === "loading" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map((n) => (
              <div key={n} className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden animate-pulse">
                <div className="aspect-video bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-100 rounded w-3/4" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Grid */}
        {fetchStatus === "succeeded" && trainings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {trainings.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                onPlay={setPlaying}
                onDelete={handleDelete}
                deleting={deletingId === v.id}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {fetchStatus === "succeeded" && trainings.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 rounded-2xl border-2 border-dashed border-[#E5E7EB] bg-white">
            <div className="w-14 h-14 rounded-2xl bg-[#F0FDF4] flex items-center justify-center mb-3">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="#1B4332">
                <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5v-7l6.5 3.5-6.5 3.5z"/>
              </svg>
            </div>
            <p className="text-[15px] font-bold text-[#374151]">No training videos yet</p>
            <p className="text-[13px] text-[#9CA3AF] mt-1 mb-4">Add a YouTube link to get started</p>
            <button
              onClick={() => setPanelOpen(true)}
              className="flex items-center gap-2 bg-[#1B4332] text-white text-[13px] font-bold px-4 py-2.5 rounded-xl hover:bg-[#14532D] transition-colors"
            >
              <Plus size={14} /> Add first video
            </button>
          </div>
        )}
      </div>

      {panelOpen && (
        <AddVideoPanel
          onClose={() => setPanelOpen(false)}
          onSubmit={handleSubmit}
          creating={createStatus === "loading"}
        />
      )}
      {playing && <PlayerModal video={playing} onClose={() => setPlaying(null)} />}
    </>
  );
}