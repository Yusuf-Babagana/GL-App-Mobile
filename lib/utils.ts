export const capitalizeFirstLetter = (text: string) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};

export const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "#10B981";
    case "shipped":
      return "#3B82F6";
    case "pending":
      return "#F59E0B";
    default:
      return "#666";
  }
};

export const getOptimizedImageUrl = (url: string | null | undefined) => {
  if (!url) return "https://via.placeholder.com/400";
  if (url.includes("cloudinary.com") && url.includes("/upload/")) {
    return url.replace("/upload/", "/upload/q_auto,f_auto/");
  }
  return url;
};
