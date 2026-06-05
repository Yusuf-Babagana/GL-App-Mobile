export const uploadToCloudinary = async (fileUri: string, isVideo: boolean = false) => {
    const formData = new FormData();

    // Normalise URI: React Native's native file bridge requires a file:// scheme on Android.
    // If the uri has no scheme (e.g. bare path), prepend file://
    const normalisedUri = fileUri.includes('://') ? fileUri : `file://${fileUri}`;
    const fileType = isVideo ? 'video' : 'image';
    const extension = isVideo ? 'mp4' : 'jpg';
    const mimeType = isVideo ? 'video/mp4' : 'image/jpeg';
    const filename = `upload_${Date.now()}.${extension}`;

    // @ts-ignore - React Native FormData accepts { uri, name, type } for file payloads
    formData.append("file", { uri: normalisedUri, name: filename, type: mimeType });
    formData.append("upload_preset", "gl_app_preset");
    formData.append("resource_type", fileType);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvj6cw5dq/${fileType}/upload`,
        { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
};

