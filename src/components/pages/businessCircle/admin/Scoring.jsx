import React, { useEffect } from "react"; // useState remove
import { useDispatch, useSelector } from "react-redux";
import { Loader2, AlertCircle } from "lucide-react"; // Check remove
import {
  fetchScoringWeights,
  selectWeights,
  selectBands,
  selectFetchStatus,
  selectScoringError,
} from "../../../redux/slices/scoringSlice.js";
// updateScoringWeights, updateScoreBands, resetSaveStatus, selectSaveStatus — remove

const ACTION_LABELS = {
  FACE_TO_FACE:    "Face to Face completed",
  GRATITUDE_SLIP:  "Lead closed (Gratitude Slip)",
  GUEST_BROUGHT:   "Guest brought",
  GUEST_JOINED:    "Guest joined",
  LEAD_GIVEN:      "Lead given",
  MEETING_ABSENT:  "Meeting absent",
  MEETING_PRESENT: "Meeting present",
};

const bandRule = (minScore, maxScore) => {
  if (minScore <= -999990) return `< ${maxScore + 1}`;
  if (maxScore >=  999990) return `≥ ${minScore}`;
  return `${minScore} – ${maxScore}`;
};

export default function Scoring() {
  const dispatch = useDispatch();

  // ✅ Direct from Redux — no useState needed
  const weights     = useSelector(selectWeights);
  const bands       = useSelector(selectBands);
  const fetchStatus = useSelector(selectFetchStatus);
  const apiError    = useSelector(selectScoringError);

  useEffect(() => {
    dispatch(fetchScoringWeights());
  }, [dispatch]);

  const loading = fetchStatus === "loading";

  return (
    <div className="space-y-5">
      <h2 className="text-[20px] font-bold text-[#111827]">Scoring weights</h2>

      {apiError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-[12.5px] font-medium rounded-lg px-4 py-2.5">
          <AlertCircle size={14} /> {apiError}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-16 text-[13px] text-gray-400 gap-2">
          <Loader2 size={16} className="animate-spin" /> Loading scoring data…
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Points per action */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-[13px] text-[#6B7280] font-medium mb-4">Points per action</p>
            <table className="w-full text-[13.5px]">
              <tbody>
                {weights.map(({ scoringWeightId, action, points }, i) => (
                  <tr key={scoringWeightId} className={i < weights.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                    <td className="py-3 text-[#374151]">{ACTION_LABELS[action] ?? action}</td>
                    <td className="py-3 text-right">
                      <span className="font-semibold text-[#111827]">{points}</span>
                      <span className="text-[#6B7280] ml-1">pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Score bands */}
          <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
            <p className="text-[13px] text-[#6B7280] font-medium mb-4">Score bands</p>
            <table className="w-full text-[13.5px]">
              <tbody>
                {bands.map(({ scoreBandId, bandName, colorCode, minScore, maxScore }, i) => (
                  <tr key={scoreBandId} className={i < bands.length - 1 ? "border-b border-[#F3F4F6]" : ""}>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colorCode }} />
                        <span className="text-[#374151]">{bandName}</span>
                      </span>
                    </td>
                    <td className="py-3 text-right font-semibold text-[#111827]">
                      {bandRule(minScore, maxScore)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}
    </div>
  );
}