import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    Compass,
    Clock,
    Film,
    Zap,
    Sparkles,
    Image as ImageIcon,
    Sun,
    Maximize2,
    MessageCircle,
    Video,
    Wand2,
    Layers,
    TrendingUp,
    BookOpen,
} from "lucide-react";

// Articles data in English
const ARTICLES = [
    {
        id: 1,
        slug: "wan-26-image-to-video",
        title: "Wan 2.6 - High Quality Image to Video",
        description: "Discover our latest Wan 2.6 model with smooth motion and sharp details for stunning video generation.",
        category: "video",
        icon: Film,
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=400&fit=crop",
        readTime: "5 min",
        date: "Jan 04, 2026",
        featured: true,
    },
    {
        id: 2,
        slug: "wan-turbo-fast-video",
        title: "Wan Turbo - Lightning Fast Videos",
        description: "Wan 2.1 Turbo offers 3x faster processing speed while maintaining quality. Perfect for quick previews.",
        category: "video",
        icon: Zap,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop",
        readTime: "3 min",
        date: "Jan 03, 2026",
    },
    {
        id: 3,
        slug: "text-to-image-guide",
        title: "Text to Image - Complete Guide",
        description: "Learn how to use Text to Image with Realism, Anime, Digital Art styles to create stunning visuals.",
        category: "image",
        icon: Sparkles,
        coverImage: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&h=400&fit=crop",
        readTime: "7 min",
        date: "Jan 02, 2026",
    },
    {
        id: 4,
        slug: "prompt-to-video",
        title: "Prompt to Video - Text to Video",
        description: "Create videos directly from text descriptions with Wan 2.6-t2v. No input image required!",
        category: "video",
        icon: Video,
        coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=400&fit=crop",
        readTime: "6 min",
        date: "Jan 01, 2026",
    },
    {
        id: 5,
        slug: "style-transfer",
        title: "Style Transfer - Photo to Art",
        description: "Transform your photos into Van Gogh, Monet, or any artistic style with AI-powered style transfer.",
        category: "image",
        icon: Wand2,
        coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&h=400&fit=crop",
        readTime: "4 min",
        date: "Dec 31, 2025",
    },
    {
        id: 6,
        slug: "image-enhance",
        title: "Image Enhance - Upscale Quality",
        description: "Upscale images 2x, 4x with AI technology while preserving details and sharpness.",
        category: "enhance",
        icon: TrendingUp,
        coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800&h=400&fit=crop",
        readTime: "3 min",
        date: "Dec 30, 2025",
    },
    {
        id: 7,
        slug: "relight",
        title: "Relight - Transform Lighting",
        description: "Change photo lighting naturally - from studio lights to romantic sunset in seconds.",
        category: "enhance",
        icon: Sun,
        coverImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=800&h=400&fit=crop",
        readTime: "4 min",
        date: "Dec 29, 2025",
    },
    {
        id: 8,
        slug: "ai-chat-assistant",
        title: "AI Chat - Your Smart Assistant",
        description: "Create and edit images through natural conversation. Just ask and AI will help!",
        category: "tips",
        icon: MessageCircle,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=400&fit=crop",
        readTime: "5 min",
        date: "Dec 28, 2025",
    },
    {
        id: 9,
        slug: "background-tools",
        title: "Background Tools - Remove & Replace",
        description: "Remove, replace, or blur backgrounds in just a few clicks with powerful AI tools.",
        category: "image",
        icon: Layers,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=400&fit=crop",
        readTime: "4 min",
        date: "Dec 27, 2025",
    },
    {
        id: 10,
        slug: "image-expand",
        title: "Image Expand - Extend Boundaries",
        description: "Expand image borders with AI - add new content to edges naturally and seamlessly.",
        category: "image",
        icon: Maximize2,
        coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=400&fit=crop",
        readTime: "3 min",
        date: "Dec 26, 2025",
    },
];

const CATEGORIES = [
    { id: "all", label: "All", icon: BookOpen },
    { id: "video", label: "Video", icon: Film },
    { id: "image", label: "Image", icon: ImageIcon },
    { id: "enhance", label: "Enhance", icon: TrendingUp },
    { id: "tips", label: "Tips", icon: Sparkles },
];

const DiscoverPage = () => {
    const navigate = useNavigate();
    const [activeCategory, setActiveCategory] = useState("all");
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

    const filteredArticles = activeCategory === "all"
        ? ARTICLES
        : ARTICLES.filter(article => article.category === activeCategory);

    const featuredArticle = ARTICLES.find(article => article.featured);
    const regularArticles = filteredArticles.filter(article => !article.featured || activeCategory !== "all");

    const handleArticleClick = (article) => {
        navigate(`/discover/${article.slug}`);
    };

    return (
        <div className="space-y-6">
            {/* Header - matching AITools style */}
            <header
                className={`${isDarkMode
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-gray-200"
                    } border-b -mx-6 px-6 py-5 mb-2`}
            >
                <div className="flex items-center gap-3">
                    <div
                        className={`w-8 h-8 ${isDarkMode ? "bg-slate-100" : "bg-gray-900"
                            } rounded-lg flex items-center justify-center group/logo hover:scale-110 transition-transform duration-300`}
                    >
                        <Compass
                            className={`w-4 h-4 ${isDarkMode ? "text-slate-900" : "text-white"
                                } group-hover/logo:rotate-12 transition-transform duration-300`}
                        />
                    </div>
                    <div>
                        <h1
                            className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                                }`}
                        >
                            Discover
                        </h1>
                        <p
                            className={`text-xs ${isDarkMode ? "text-slate-400" : "text-gray-500"
                                }`}
                        >
                            News & Tutorials about AI Tools
                        </p>
                    </div>
                </div>
            </header>

            <section className="space-y-8">
                {/* Header Text */}
                <div className="text-center max-w-2xl mx-auto">
                    <h2
                        className={`text-2xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"
                            } animate-fade-in`}
                    >
                        Explore AI Tools & Features
                    </h2>
                    <p
                        className={`text-sm ${isDarkMode ? "text-slate-400" : "text-gray-500"
                            } animate-fade-in`}
                        style={{ animationDelay: "100ms" }}
                    >
                        Learn about our powerful AI tools with detailed guides and tutorials
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide justify-center flex-wrap">
                    {CATEGORIES.map((category) => {
                        const Icon = category.icon;
                        return (
                            <button
                                key={category.id}
                                type="button"
                                onClick={() => setActiveCategory(category.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeCategory === category.id
                                        ? isDarkMode
                                            ? "bg-slate-100 text-slate-900"
                                            : "bg-gray-900 text-white"
                                        : isDarkMode
                                            ? "bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700"
                                            : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {category.label}
                            </button>
                        );
                    })}
                </div>

                {/* Featured Article - AITools style card */}
                {activeCategory === "all" && featuredArticle && (
                    <button
                        type="button"
                        onClick={() => handleArticleClick(featuredArticle)}
                        className={`w-full group/card relative ${isDarkMode
                                ? "bg-slate-800 border-slate-700 hover:border-slate-400 hover:shadow-2xl hover:shadow-slate-900/60"
                                : "bg-white border-gray-200 hover:border-gray-900 hover:shadow-2xl hover:shadow-gray-900/20"
                            } border-2 rounded-2xl overflow-hidden text-left transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01] active:scale-[0.99] animate-fade-in`}
                    >
                        {/* Glow effect on hover */}
                        <div
                            className={`absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 ${isDarkMode
                                    ? "bg-gradient-to-br from-slate-600/30 via-transparent to-slate-700/30"
                                    : "bg-gradient-to-br from-gray-100/80 via-transparent to-gray-200/80"
                                }`}
                        />
                        <div className="relative h-64 overflow-hidden">
                            <img
                                src={featuredArticle.coverImage}
                                alt={featuredArticle.title}
                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-6">
                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full ${isDarkMode ? "bg-slate-100 text-slate-900" : "bg-gray-900 text-white"
                                    } text-xs font-medium mb-3`}>
                                    <TrendingUp className="w-3 h-3" />
                                    Featured
                                </span>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    {featuredArticle.title}
                                </h2>
                                <p className="text-gray-200 text-sm line-clamp-2 mb-3">
                                    {featuredArticle.description}
                                </p>
                                <div className="flex items-center gap-4 text-gray-300 text-xs">
                                    <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {featuredArticle.readTime}
                                    </span>
                                    <span>{featuredArticle.date}</span>
                                </div>
                                <div
                                    className="flex items-center text-xs font-medium text-white mt-4 group-hover/card:translate-x-2 transition-all duration-300"
                                >
                                    <span className="group-hover/card:font-semibold transition-all">
                                        Read Article
                                    </span>
                                    <svg
                                        className="w-4 h-4 ml-1 group-hover/card:translate-x-1 group-hover/card:scale-110 transition-all duration-300"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </button>
                )}

                {/* Divider */}
                <div className="flex items-center gap-4 group/divider">
                    <div
                        className={`flex-1 h-px transition-all duration-500 ${isDarkMode
                                ? "bg-slate-700 group-hover/divider:bg-slate-600"
                                : "bg-gray-200 group-hover/divider:bg-gray-300"
                            }`}
                    />
                    <span
                        className={`text-xs font-medium ${isDarkMode ? "text-slate-500" : "text-gray-400"
                            } uppercase tracking-wider transition-all duration-300 group-hover/divider:tracking-widest group-hover/divider:scale-105`}
                    >
                        All Articles
                    </span>
                    <div
                        className={`flex-1 h-px transition-all duration-500 ${isDarkMode
                                ? "bg-slate-700 group-hover/divider:bg-slate-600"
                                : "bg-gray-200 group-hover/divider:bg-gray-300"
                            }`}
                    />
                </div>

                {/* Articles Grid - AITools style */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regularArticles.map((article, index) => {
                        const Icon = article.icon;
                        return (
                            <button
                                key={article.id}
                                type="button"
                                onClick={() => handleArticleClick(article)}
                                className={`group/tool ${isDarkMode
                                        ? "bg-slate-800 border-slate-700 hover:border-slate-500 hover:shadow-xl hover:shadow-slate-900/60"
                                        : "bg-white border-gray-200 hover:border-gray-400 hover:shadow-xl hover:shadow-gray-900/10"
                                    } border rounded-xl overflow-hidden text-left transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] active:scale-95 animate-fade-in`}
                                style={{ animationDelay: `${index * 50}ms` }}
                            >
                                {/* Image */}
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={article.coverImage}
                                        alt={article.title}
                                        className="w-full h-full object-cover group-hover/tool:scale-105 transition-transform duration-500"
                                    />
                                    <div className={`absolute inset-0 ${isDarkMode ? "bg-black/20" : "bg-black/10"} group-hover/tool:bg-transparent transition-colors duration-300`} />
                                    <div className={`absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full ${isDarkMode ? "bg-slate-900/90" : "bg-white/95"
                                        } backdrop-blur-sm`}>
                                        <Icon className={`w-3.5 h-3.5 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`} />
                                        <span className={`text-xs font-medium ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                                            {CATEGORIES.find(c => c.id === article.category)?.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <div
                                        className={`relative w-10 h-10 ${isDarkMode
                                                ? "bg-slate-700 text-slate-300 group-hover/tool:bg-slate-100 group-hover/tool:text-slate-900"
                                                : "bg-gray-100 text-gray-700 group-hover/tool:bg-gray-900 group-hover/tool:text-white"
                                            } rounded-lg flex items-center justify-center transition-all duration-300 group-hover/tool:scale-110 group-hover/tool:rotate-6 overflow-hidden`}
                                    >
                                        <Icon className="w-5 h-5 relative z-10" />
                                        <span className="absolute inset-0 opacity-0 group-hover/tool:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/20 to-transparent" />
                                    </div>
                                    <div>
                                        <h4
                                            className={`font-semibold text-sm mb-1 transition-all duration-300 group-hover/tool:font-bold ${isDarkMode ? "text-white" : "text-gray-900"
                                                }`}
                                        >
                                            {article.title}
                                        </h4>
                                        <p
                                            className={`text-xs transition-colors duration-300 ${isDarkMode
                                                    ? "text-slate-400 group-hover/tool:text-slate-300"
                                                    : "text-gray-500 group-hover/tool:text-gray-600"
                                                } line-clamp-2`}
                                        >
                                            {article.description}
                                        </p>
                                    </div>
                                    <div className={`flex items-center justify-between pt-2 border-t ${isDarkMode ? "border-slate-700" : "border-gray-100"
                                        }`}>
                                        <div className={`flex items-center gap-3 text-xs ${isDarkMode ? "text-slate-500" : "text-gray-400"
                                            }`}>
                                            <span className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {article.readTime}
                                            </span>
                                        </div>
                                        <div
                                            className={`flex items-center text-xs font-medium ${isDarkMode ? "text-slate-300" : "text-gray-900"
                                                } group-hover/tool:translate-x-1 transition-all duration-300`}
                                        >
                                            <span className="group-hover/tool:font-semibold transition-all">
                                                Read
                                            </span>
                                            <svg
                                                className="w-4 h-4 ml-1 group-hover/tool:translate-x-1 group-hover/tool:scale-110 transition-all duration-300"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Empty State */}
                {regularArticles.length === 0 && (
                    <div className={`text-center py-12 ${isDarkMode ? "text-slate-400" : "text-gray-500"}`}>
                        <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No articles in this category</p>
                    </div>
                )}
            </section>
        </div>
    );
};

export default DiscoverPage;
