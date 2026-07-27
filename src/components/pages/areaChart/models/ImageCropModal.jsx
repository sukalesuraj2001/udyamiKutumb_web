import React, { useCallback, useEffect, useRef, useState } from "react";
import Cropper from "react-easy-crop";
import { X, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import getCroppedImg from "../../../utils/cropImage.js";

export default function ImageCropModal({ image, open, onClose, onComplete }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const fileInputRef = useRef(null);

  // Reset crop/zoom whenever a new image is loaded into the cropper
  useEffect(() => {
    if (image) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
    }
  }, [image]);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleDone = async () => {
    if (!croppedAreaPixels) return;
    try {
      const blob = await getCroppedImg(image, croppedAreaPixels);
      const preview = URL.createObjectURL(blob);
      onComplete(blob, preview);
      onClose();
    } catch (err) {
      console.log(err);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[1000] bg-black/70 flex justify-center items-center">
      <div className="bg-white rounded-3xl w-[540px] p-7">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-3xl font-semibold">Crop your photo</h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="relative h-[350px] rounded-2xl overflow-hidden bg-zinc-100">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>

        <div className="flex items-center gap-3 mt-6">
          <ZoomOut size={18} />
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
          <ZoomIn size={18} />
          <button
            onClick={() => {
              setCrop({ x: 0, y: 0 });
              setZoom(1);
            }}
            className="ml-3"
          >
            <RotateCcw />
          </button>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-5">
          Drag to position · Pinch / Slider to zoom
        </p>

        <div className="flex justify-end gap-3 mt-8">
          <button onClick={onClose} className="px-6 py-3 rounded-xl border">
            Cancel
          </button>
          <button
            onClick={handleDone}
            disabled={!croppedAreaPixels}
            className="px-6 py-3 rounded-xl bg-ink text-white disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Use Photo
          </button>
        </div>
      </div>
    </div>
  );
}