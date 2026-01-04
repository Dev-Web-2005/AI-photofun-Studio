import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    Clock,
    Calendar,
    ExternalLink,
    Sparkles,
    Film,
    Zap,
    Image as ImageIcon,
    Sun,
    Maximize2,
    MessageCircle,
    Video,
    Wand2,
    Layers,
    TrendingUp,
    BookOpen,
    Check,
} from "lucide-react";

// Articles data in English
const ARTICLES = [
    {
        id: 1,
        slug: "wan-26-image-to-video",
        title: "Wan 2.6 - Create High-Quality Videos from Images",
        description: "Discover our latest Wan 2.6 model with the ability to create high-quality videos from any image. Features smooth motion and sharp details.",
        features: [
            "Smooth Motion - Natural and fluid animations",
            "Sharp Details - Preserves original image quality",
            "Diverse Effects - Supports various motion types",
            "Fast Processing - Optimized for speed and quality"
        ],
        steps: [
            "Upload your image",
            "Describe how you want the image to animate",
            "Select Wan 2.6 model",
            "Click Generate and wait for results!"
        ],
        tips: [
            "Use high-resolution images for best results",
            'Describe specific motions: "wind blowing through hair", "clouds moving across sky"',
            "Experiment with different prompts for creative results"
        ],
        category: "video",
        icon: Film,
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
        readTime: "5 min",
        date: "Jan 04, 2026",
        toolLink: "/image-to-video",
        toolName: "Image to Video",
    },
    {
        id: 2,
        slug: "wan-turbo-fast-video",
        title: "Wan Turbo - Lightning Fast Video Generation",
        description: "Wan 2.1 Turbo model offers ultra-fast processing speed, perfect when you need quick video generation while maintaining quality.",
        features: [
            "Ultra-Fast Processing - 3x faster than standard models",
            "Good Quality - Maintains stable video quality",
            "Time Saving - Perfect for speed-critical workflows"
        ],
        comparison: {
            headers: ["Criteria", "Wan 2.6", "Wan Turbo"],
            rows: [
                ["Quality", "⭐⭐⭐⭐⭐", "⭐⭐⭐⭐"],
                ["Speed", "⭐⭐⭐", "⭐⭐⭐⭐⭐"],
                ["Details", "High", "Medium"]
            ]
        },
        tips: [
            "Use for quick video previews",
            "Great for testing multiple ideas",
            "Best when time is a critical factor"
        ],
        category: "video",
        icon: Zap,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop",
        readTime: "3 min",
        date: "Jan 03, 2026",
        toolLink: "/image-to-video",
        toolName: "Image to Video",
    },
    {
        id: 3,
        slug: "text-to-image-guide",
        title: "Text to Image - Create Images from Text Descriptions",
        description: "Complete guide on using Text to Image with styles like Realism, Anime, Digital Art... to create stunning images.",
        features: [
            "Realism - Ultra-realistic, photo-like images",
            "Anime - Japanese animation style",
            "Digital Art - Modern digital artwork",
            "Photography - Professional photo simulation"
        ],
        steps: [
            'Be specific: "A beautiful sunset over mountains" instead of just "sunset"',
            "Add details: colors, lighting, camera angle",
            'Use quality keywords: "high quality", "detailed", "professional"'
        ],
        examplePrompt: "A majestic mountain landscape at golden hour, snow-capped peaks, dramatic clouds, professional photography, high detail, 8K",
        category: "image",
        icon: Sparkles,
        coverImage: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop",
        readTime: "7 min",
        date: "Jan 02, 2026",
        toolLink: "/text-to-image",
        toolName: "Text to Image",
    },
    {
        id: 4,
        slug: "prompt-to-video",
        title: "Prompt to Video - Create Videos from Text",
        description: "Wan 2.6-t2v model allows you to create videos directly from text descriptions, no input image required.",
        features: [
            "Text-Only Input - No image needed",
            "AI Imagination - Creates scenes from scratch",
            "Multiple Styles - Various video aesthetics"
        ],
        examplePrompts: [
            "A cat running through a flower field with blue sky",
            "Ocean waves crashing on a beach at sunset",
            "Snow falling gently in a forest at night"
        ],
        tips: [
            "Describe scenes clearly",
            "Include the motion you want",
            "Add details about lighting and colors"
        ],
        category: "video",
        icon: Video,
        coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=600&fit=crop",
        readTime: "6 min",
        date: "Jan 01, 2026",
        toolLink: "/prompt-to-video",
        toolName: "Prompt to Video",
    },
    {
        id: 5,
        slug: "style-transfer",
        title: "Style Transfer - Transform Photos into Art",
        description: "Convert your photos into Van Gogh, Monet, or any artistic style you want.",
        features: [
            "Van Gogh - Starry Night style",
            "Monet - Impressionism",
            "Picasso - Cubism",
            "Ukiyo-e - Japanese Art",
            "And many more!"
        ],
        steps: [
            "Upload your original photo",
            "Choose an artistic style",
            "Adjust style strength",
            "Generate and enjoy!"
        ],
        category: "image",
        icon: Wand2,
        coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=600&fit=crop",
        readTime: "4 min",
        date: "Dec 31, 2025",
        toolLink: "/style-transfer",
        toolName: "Style Transfer",
    },
    {
        id: 6,
        slug: "image-enhance",
        title: "Image Enhance - Upgrade Image Quality",
        description: "AI-powered tool to upscale images 2x, 4x while preserving details and sharpness.",
        features: [
            "Upscale 2x, 4x resolution",
            "Preserve original details",
            "Reduce noise",
            "Sharpen images"
        ],
        tips: [
            "Old low-quality photos",
            "Images for large prints",
            "Photos from old cameras"
        ],
        category: "enhance",
        icon: TrendingUp,
        coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=600&fit=crop",
        readTime: "3 min",
        date: "Dec 30, 2025",
        toolLink: "/image-enhance",
        toolName: "Image Enhance",
    },
    {
        id: 7,
        slug: "relight",
        title: "Relight - Transform Photo Lighting",
        description: "Change lighting in photos naturally - from studio lights to romantic sunset.",
        features: [
            "Studio lighting",
            "Golden hour",
            "Blue hour",
            "Dramatic light",
            "Soft diffused"
        ],
        tips: [
            "Fix photos taken in bad lighting",
            "Create new moods for photos",
            "Edit product photos"
        ],
        category: "enhance",
        icon: Sun,
        coverImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=600&fit=crop",
        readTime: "4 min",
        date: "Dec 29, 2025",
        toolLink: "/relight",
        toolName: "Relight",
    },
    {
        id: 8,
        slug: "ai-chat-assistant",
        title: "AI Chat Assistant - Your Smart AI Helper",
        description: "AI chatbot helps you create and edit images through natural conversation. Ask anything!",
        features: [
            '"Create a cute cat image for me"',
            '"Remove the background from this image"',
            '"Enhance this image quality"',
            '"Turn this photo into Van Gogh style"'
        ],
        tips: [
            "No technical knowledge required",
            "Natural language interaction",
            "Suggestions and guidance provided"
        ],
        category: "tips",
        icon: MessageCircle,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
        readTime: "5 min",
        date: "Dec 28, 2025",
        toolLink: "/ai-chat",
        toolName: "AI Chat",
    },
    {
        id: 9,
        slug: "background-tools",
        title: "Background Tools - Remove & Change Backgrounds",
        description: "Powerful background processing: remove, replace, or blur backgrounds in just a few clicks.",
        features: [
            "Remove Background - Completely remove image background",
            "Replace Background - Change to any image",
            "Blur Background - Create bokeh effect",
            "Gradient Background - Add beautiful gradients"
        ],
        tips: [
            "E-commerce product photos",
            "Professional profile pictures",
            "Marketing images"
        ],
        category: "image",
        icon: Layers,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
        readTime: "4 min",
        date: "Dec 27, 2025",
        toolLink: "/background-tools",
        toolName: "Background Tools",
    },
    {
        id: 10,
        slug: "image-expand",
        title: "Image Expand - Extend Image Boundaries",
        description: "Expand image borders with AI - add new content to edges naturally and seamlessly.",
        steps: [
            "Upload original image",
            "Choose expansion direction (left, right, top, bottom)",
            "AI generates matching content",
            "Natural, seamless results"
        ],
        tips: [
            "Change aspect ratio (9:16 → 16:9)",
            "Add space for text/logo",
            "Save cropped images"
        ],
        category: "image",
        icon: Maximize2,
        coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
        readTime: "3 min",
        date: "Dec 26, 2025",
        toolLink: "/image-expand",
        toolName: "Image Expand",
    },
];

const ArticleDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });

    useEffect(() => {
        const checkDarkMode = () => {
            const darkModeStorage = localStorage.getItem("darkMode") === "true";
            const bodyHasDark = document.body.classList.contains("dark");
            setIsDarkMode(darkModeStorage || bodyHasDark);
        };

        checkDarkMode();
        window.addEventListener("storage", checkDarkMode);
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

        return () => {
            window.removeEventListener("storage", checkDarkMode);
            observer.disconnect();
        };
    }, []);

    const article = ARTICLES.find(a => a.slug === slug);

    if (!article) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                <div className="text-center">
                    <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-50" />
                    <h1 className="text-2xl font-bold mb-2">Article not found</h1>
                    <button
                        type="button"
                        onClick={() => navigate("/discover")}
                        className={`mt-4 px-6 py-2 rounded-lg ${isDarkMode ? "bg-white text-gray-900" : "bg-gray-900 text-white"}`}
                    >
                        Back to Discover
                    </button>
                </div>
            </div>
        );
    }

    const Icon = article.icon;

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Back Button */}
            <button
                type="button"
                onClick={() => navigate("/discover")}
                className={`flex items-center gap-2 mb-6 ${isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-gray-900"} transition-colors group`}
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium text-sm">Back to Discover</span>
            </button>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
                <img src={article.coverImage} alt={article.title} className="w-full h-64 md:h-80 object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDarkMode ? "bg-slate-800/80" : "bg-white/90"} backdrop-blur-sm mb-3`}>
                        <Icon className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>{article.toolName}</span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{article.title}</h1>
                    <div className="flex items-center gap-4 text-gray-200 text-sm">
                        <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{article.readTime}</span>
                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" />{article.date}</span>
                    </div>
                </div>
            </div>

            {/* Try Now Button */}
            <div className="sticky top-4 z-10 mb-8">
                <button
                    type="button"
                    onClick={() => navigate(article.toolLink)}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                    <Sparkles className="w-5 h-5" />
                    Try {article.toolName} Now
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>

            {/* Content */}
            <div className={`space-y-8 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}>
                {/* Description */}
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    {article.description}
                </p>

                {/* Features */}
                {article.features && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Key Features
                        </h2>
                        <ul className="space-y-3">
                            {article.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Steps */}
                {article.steps && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            How to Use
                        </h2>
                        <ol className="space-y-3">
                            {article.steps.map((step, idx) => (
                                <li key={idx} className="flex items-start gap-3">
                                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold ${isDarkMode ? "bg-purple-600 text-white" : "bg-purple-100 text-purple-600"}`}>
                                        {idx + 1}
                                    </span>
                                    <span>{step}</span>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}

                {/* Comparison Table */}
                {article.comparison && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Comparison
                        </h2>
                        <div className="overflow-x-auto">
                            <table className={`w-full border-collapse rounded-lg overflow-hidden ${isDarkMode ? "bg-slate-800" : "bg-gray-50"}`}>
                                <thead>
                                    <tr className={isDarkMode ? "bg-slate-700" : "bg-gray-200"}>
                                        {article.comparison.headers.map((header, idx) => (
                                            <th key={idx} className={`px-4 py-3 text-left font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                                                {header}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {article.comparison.rows.map((row, rowIdx) => (
                                        <tr key={rowIdx} className={`border-t ${isDarkMode ? "border-slate-700" : "border-gray-200"}`}>
                                            {row.map((cell, cellIdx) => (
                                                <td key={cellIdx} className={`px-4 py-3 ${cellIdx === 0 ? (isDarkMode ? "text-white font-medium" : "text-gray-900 font-medium") : ""}`}>
                                                    {cell}
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Example Prompt */}
                {article.examplePrompt && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Example Prompt
                        </h2>
                        <pre className={`p-4 rounded-xl overflow-x-auto text-sm ${isDarkMode ? "bg-slate-800 text-green-400" : "bg-gray-900 text-green-400"}`}>
                            <code>{article.examplePrompt}</code>
                        </pre>
                    </div>
                )}

                {/* Example Prompts List */}
                {article.examplePrompts && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            Example Prompts
                        </h2>
                        <ul className="space-y-2">
                            {article.examplePrompts.map((prompt, idx) => (
                                <li key={idx} className={`p-3 rounded-lg ${isDarkMode ? "bg-slate-800" : "bg-gray-100"}`}>
                                    "{prompt}"
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Tips */}
                {article.tips && (
                    <div>
                        <h2 className={`text-xl font-bold mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                            💡 Pro Tips
                        </h2>
                        <ul className="space-y-2">
                            {article.tips.map((tip, idx) => (
                                <li key={idx} className={`p-3 rounded-lg flex items-start gap-3 ${isDarkMode ? "bg-slate-800" : "bg-purple-50"}`}>
                                    <span className="text-lg">•</span>
                                    <span>{tip}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Bottom CTA */}
            <div className={`mt-12 p-8 rounded-2xl text-center ${isDarkMode ? "bg-slate-800" : "bg-gray-100"}`}>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Ready to try {article.toolName}?
                </h3>
                <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                    Experience this powerful AI tool now!
                </p>
                <button
                    type="button"
                    onClick={() => navigate(article.toolLink)}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
                >
                    <Sparkles className="w-5 h-5" />
                    Try {article.toolName} Now
                    <ExternalLink className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default ArticleDetailPage;
