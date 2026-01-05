import React, { useState, useEffect, useCallback } from "react";
import { Image, Video, Download, Trash2, RefreshCw, Eye } from "lucide-react";
import aiApi from "../api/aiApi";
import { useAuthContext } from "../context/AuthContext";

const Gallery = () => {
    const { user } = useAuthContext();
    const [activeTab, setActiveTab] = useState("images");
    const [images, setImages] = useState([]);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedItem, setSelectedItem] = useState(null);

    const fetchGallery = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        try {
            const [imagesRes, videosRes] = await Promise.all([
                aiApi.getImageGallery(user.id),
                aiApi.getVideoGallery(user.id),
            ]);
            if (imagesRes?.result) setImages(imagesRes.result);
            if (videosRes?.result) setVideos(videosRes.result);
        } catch (error) {
            console.error("Failed to fetch gallery:", error);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        fetchGallery();
    }, [fetchGallery]);

    const handleDownload = async (url, filename) => {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = filename || "download";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Download failed:", error);
        }
    };

    const tabs = [
        { id: "images", label: "Images", icon: Image, count: images.length },
        { id: "videos", label: "Videos", icon: Video, count: videos.length },
    ];

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">My Gallery</h1>
                    <p className="text-gray-500 mt-1">
                        View all your AI-generated images and videos
                    </p>
                </div>
                <button
                    onClick={fetchGallery}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    Refresh
                </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-3 font-medium transition-colors border-b-2 -mb-px ${activeTab === tab.id
                                ? "border-black text-black"
                                : "border-transparent text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Icon className="w-5 h-5" />
                            {tab.label}
                            <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                                {tab.count}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-black"></div>
                </div>
            ) : (
                <>
                    {/* Images Grid */}
                    {activeTab === "images" && (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {images.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    <Image className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No images yet. Start creating with AI tools!</p>
                                </div>
                            ) : (
                                images.map((img) => (
                                    <div
                                        key={img.image_id}
                                        className="group relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-pointer"
                                        onClick={() => setSelectedItem({ type: "image", ...img })}
                                    >
                                        <img
                                            src={img.image_url}
                                            alt={img.refined_prompt || "AI Generated"}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDownload(img.image_url, `image-${img.image_id}.jpg`);
                                                }}
                                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                                            >
                                                <Download className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItem({ type: "image", ...img });
                                                }}
                                                className="p-2 bg-white rounded-full hover:bg-gray-100"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {/* Videos Grid */}
                    {activeTab === "videos" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {videos.length === 0 ? (
                                <div className="col-span-full text-center py-20 text-gray-500">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>No videos yet. Create videos with AI!</p>
                                </div>
                            ) : (
                                videos.map((vid) => {
                                    const thumbnailUrl = vid.metadata?.input_image_url;
                                    const hasVideo = !!vid.video_url;
                                    return (
                                        <div
                                            key={vid.video_id}
                                            className="group relative aspect-video rounded-xl overflow-hidden bg-gray-900 cursor-pointer"
                                            onClick={() => setSelectedItem({ type: "video", ...vid })}
                                        >
                                            {hasVideo ? (
                                                <video
                                                    src={vid.video_url}
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    onMouseEnter={(e) => e.target.play()}
                                                    onMouseLeave={(e) => {
                                                        e.target.pause();
                                                        e.target.currentTime = 0;
                                                    }}
                                                />
                                            ) : thumbnailUrl ? (
                                                <img
                                                    src={thumbnailUrl}
                                                    alt={vid.prompt || "Video thumbnail"}
                                                    className="w-full h-full object-cover opacity-70"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-500">
                                                    <Video className="w-12 h-12 opacity-50" />
                                                </div>
                                            )}
                                            {/* Status badge for videos without URL */}
                                            {!hasVideo && (
                                                <div className="absolute top-2 right-2 px-2 py-1 bg-yellow-500 text-white text-xs font-medium rounded-full">
                                                    {vid.status === "SUCCEEDED" ? "No Video URL" : vid.status || "Processing"}
                                                </div>
                                            )}
                                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                                <p className="text-white text-sm font-medium truncate">
                                                    {vid.prompt || "Video"}
                                                </p>
                                                <p className="text-gray-300 text-xs mt-1">
                                                    {vid.model} • {vid.metadata?.duration || 5}s
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Preview Modal */}
            {selectedItem && (
                <div
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
                    onClick={() => setSelectedItem(null)}
                >
                    <div
                        className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-4 border-b flex items-center justify-between">
                            <h3 className="font-semibold">
                                {selectedItem.type === "image" ? "Image Preview" : "Video Preview"}
                            </h3>
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-2 hover:bg-gray-100 rounded-lg"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="p-4">
                            {selectedItem.type === "image" ? (
                                <img
                                    src={selectedItem.image_url}
                                    alt="Preview"
                                    className="w-full max-h-[60vh] object-contain rounded-lg"
                                />
                            ) : selectedItem.video_url ? (
                                <video
                                    src={selectedItem.video_url}
                                    controls
                                    autoPlay
                                    className="w-full max-h-[60vh] rounded-lg"
                                />
                            ) : selectedItem.metadata?.input_image_url ? (
                                <div className="relative">
                                    <img
                                        src={selectedItem.metadata.input_image_url}
                                        alt="Video thumbnail"
                                        className="w-full max-h-[60vh] object-contain rounded-lg opacity-70"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg font-medium">
                                            Video URL not available
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-20 text-gray-500">
                                    <Video className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                    <p>Video not available</p>
                                </div>
                            )}
                            <div className="mt-4 space-y-2">
                                <p className="text-sm text-gray-600">
                                    <strong>Prompt:</strong>{" "}
                                    {selectedItem.refined_prompt || selectedItem.prompt || "N/A"}
                                </p>
                                <p className="text-sm text-gray-600">
                                    <strong>Created:</strong>{" "}
                                    {new Date(selectedItem.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() =>
                                        handleDownload(
                                            selectedItem.image_url || selectedItem.video_url,
                                            `${selectedItem.type}-${selectedItem.image_id || selectedItem.video_id}`
                                        )
                                    }
                                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
