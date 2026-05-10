const CLOUD_NAME   = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const uploadToCloudinary = (file, onProgress) => {
  const resourceType = file.type.startsWith('video/') ? 'video' : 'image';
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;

  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      const res = JSON.parse(xhr.responseText);
      if (xhr.status === 200) resolve({ url: res.secure_url, resourceType });
      else reject(new Error(res.error?.message || 'Upload failed'));
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.send(formData);
  });
};

export const isConfigured = () => !!CLOUD_NAME && !!UPLOAD_PRESET;
