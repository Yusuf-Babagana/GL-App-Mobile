export const uploadToCloudinary = async (imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop();
    const match = /\.(\w+)$/.exec(filename || "");
    const type = match ? `image/${match[1]}` : `image`;

    // @ts-ignore
    formData.append("file", { uri: imageUri, name: filename, type });

    // CHANGE THIS LINE to match your actual preset name
    formData.append("upload_preset", "gl_app_preset");

    const response = await fetch(
        "https://api.cloudinary.com/v1_1/dvj6cw5dq/image/upload",
        { method: "POST", body: formData }
    );

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Upload failed");
    return data.secure_url;
};

