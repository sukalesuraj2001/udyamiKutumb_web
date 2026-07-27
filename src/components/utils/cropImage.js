function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.setAttribute("crossOrigin", "anonymous");

    image.onload = () => resolve(image);
    image.onerror = (error) => reject(error);

    image.src = url;
  });
}

export default async function getCroppedImg(imageSrc, pixelCrop) {
  const image = await createImageBitmap(
    await fetch(imageSrc).then((r) => r.blob())
  );
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  ctx.drawImage(
    image,
    pixelCrop.x, pixelCrop.y,
    pixelCrop.width, pixelCrop.height,
    0, 0,
    pixelCrop.width, pixelCrop.height
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      // ✅ Return a real File object, not a blob URL
      const file = new File([blob], "profile.jpg", { type: "image/jpeg" });
      resolve(file);
    }, "image/jpeg", 0.9);
  });
}