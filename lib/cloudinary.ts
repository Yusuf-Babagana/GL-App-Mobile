export const uploadToCloudinary = async (fileUri: string, isVideo: boolean = false) => {
    const formData = new FormData();

    // Determine file name and type based on isVideo flag
    const filename = fileUri.split("/").pop() || (isVideo ? "upload.mp4" : "upload.jpg");
    const mimeType = isVideo ? "video/mp4" : "image/jpeg";

    // @ts-ignore
    formData.append("file", { uri: fileUri, name: filename, type: mimeType });
    formData.append("upload_preset", "gl_app_preset");
    formData.append("resource_type", isVideo ? "video" : "image");

    // Use the generic 'upload' endpoint (or 'video'/'image' specific if preferred, but generic with resource_type is standard)
    // Cloud name: dvj6cw5dq
    const response = await fetch(
        `https://api.cloudinary.com/v1_1/dvj6cw5dq/${isVideo ? 'video' : 'image'}/upload`,
        { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
};

