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
} from "lucide-react";

// Same articles data as DiscoverPage
const ARTICLES = [
    {
        id: 1,
        slug: "wan-26-image-to-video",
        title: "Wan 2.6 - Tạo Video Chất Lượng Cao từ Hình Ảnh",
        description: "Khám phá model Wan 2.6 mới nhất với khả năng tạo video chất lượng cao từ bất kỳ hình ảnh nào. Hỗ trợ motion smooth và chi tiết sắc nét.",
        content: `
## Giới thiệu Wan 2.6

**Wan 2.6** là phiên bản mới nhất trong dòng model Image to Video của chúng tôi. Với công nghệ AI tiên tiến, Wan 2.6 có khả năng biến bất kỳ hình ảnh tĩnh nào thành video sống động với chất lượng cao.

### Tính năng nổi bật

- **Motion Smooth**: Chuyển động mượt mà, tự nhiên
- **Chi tiết sắc nét**: Giữ nguyên độ chi tiết của ảnh gốc
- **Đa dạng hiệu ứng**: Hỗ trợ nhiều loại chuyển động khác nhau
- **Tốc độ xử lý nhanh**: Tối ưu hóa cho tốc độ và chất lượng

### Cách sử dụng

1. Tải lên hình ảnh của bạn
2. Mô tả cách bạn muốn hình ảnh chuyển động
3. Chọn model Wan 2.6
4. Nhấn Generate và đợi kết quả!

### Mẹo hay

- Sử dụng ảnh có độ phân giải cao để có kết quả tốt nhất
- Mô tả chuyển động cụ thể: "gió thổi nhẹ qua tóc", "mây trôi trên bầu trời"
- Thử nghiệm với các prompt khác nhau để có kết quả sáng tạo
    `,
        category: "video",
        icon: Film,
        coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&h=600&fit=crop",
        readTime: "5 phút",
        date: "04/01/2026",
        toolLink: "/image-to-video",
        toolName: "Image to Video",
    },
    {
        id: 2,
        slug: "wan-turbo-fast-video",
        title: "Wan Turbo - Video Nhanh Như Chớp",
        description: "Model Wan 2.1 Turbo cho tốc độ xử lý cực nhanh, phù hợp khi bạn cần video gấp mà vẫn đảm bảo chất lượng.",
        content: `
## Wan 2.1 Turbo - Tốc độ là ưu tiên

Khi bạn cần video nhanh chóng mà không muốn đợi lâu, **Wan 2.1 Turbo** là lựa chọn hoàn hảo.

### Đặc điểm

- **Xử lý siêu nhanh**: Nhanh gấp 3 lần so với model thông thường
- **Chất lượng tốt**: Vẫn giữ được chất lượng video ổn định
- **Tiết kiệm thời gian**: Phù hợp cho workflow cần tốc độ

### So sánh với Wan 2.6

| Tiêu chí | Wan 2.6 | Wan Turbo |
|----------|---------|-----------|
| Chất lượng | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| Tốc độ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Chi tiết | Cao | Trung bình |

### Khi nào nên dùng Turbo?

- Khi bạn cần video nhanh để preview
- Khi đang test nhiều ý tưởng
- Khi thời gian là yếu tố quan trọng
    `,
        category: "video",
        icon: Zap,
        coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&h=600&fit=crop",
        readTime: "3 phút",
        date: "03/01/2026",
        toolLink: "/image-to-video",
        toolName: "Image to Video",
    },
    {
        id: 3,
        slug: "text-to-image-guide",
        title: "Text to Image - Tạo Ảnh Từ Mô Tả Văn Bản",
        description: "Hướng dẫn chi tiết cách sử dụng Text to Image với các style như Realism, Anime, Digital Art... để tạo ra những bức ảnh ấn tượng.",
        content: `
## Tạo ảnh từ mô tả văn bản

**Text to Image** là công cụ mạnh mẽ cho phép bạn tạo ra hình ảnh chỉ bằng mô tả văn bản.

### Các style hỗ trợ

- **Realism**: Ảnh siêu thực, giống như chụp
- **Anime**: Phong cách hoạt hình Nhật Bản
- **Digital Art**: Nghệ thuật số hiện đại
- **Photography**: Mô phỏng ảnh chụp chuyên nghiệp

### Cách viết prompt hiệu quả

1. **Mô tả cụ thể**: "A beautiful sunset over mountains" thay vì "sunset"
2. **Thêm chi tiết**: màu sắc, ánh sáng, góc chụp
3. **Sử dụng từ khóa chất lượng**: "high quality", "detailed", "professional"

### Ví dụ prompt hay

\`\`\`
A majestic mountain landscape at golden hour, 
snow-capped peaks, dramatic clouds, 
professional photography, high detail, 8K
\`\`\`
    `,
        category: "image",
        icon: Sparkles,
        coverImage: "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=1200&h=600&fit=crop",
        readTime: "7 phút",
        date: "02/01/2026",
        toolLink: "/text-to-image",
        toolName: "Text to Image",
    },
    {
        id: 4,
        slug: "prompt-to-video",
        title: "Prompt to Video - Tạo Video Từ Văn Bản",
        description: "Model Wan 2.6-t2v cho phép bạn tạo video trực tiếp từ mô tả văn bản, không cần hình ảnh đầu vào.",
        content: `
## Video từ văn bản - Không cần ảnh!

**Prompt to Video** sử dụng model Wan 2.6-t2v để tạo video trực tiếp từ mô tả của bạn.

### Cách hoạt động

1. Viết mô tả video bạn muốn tạo
2. AI sẽ tưởng tượng và tạo video từ đầu
3. Không cần ảnh input!

### Ví dụ prompt

- "A cat running through a flower field with blue sky"
- "Ocean waves crashing on a beach at sunset"
- "Snow falling gently in a forest at night"

### Tips

- Mô tả cảnh vật rõ ràng
- Bao gồm chuyển động bạn muốn
- Thêm chi tiết về ánh sáng và màu sắc
    `,
        category: "video",
        icon: Video,
        coverImage: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=600&fit=crop",
        readTime: "6 phút",
        date: "01/01/2026",
        toolLink: "/prompt-to-video",
        toolName: "Prompt to Video",
    },
    {
        id: 5,
        slug: "style-transfer",
        title: "Style Transfer - Biến Ảnh Thành Tranh Nghệ Thuật",
        description: "Chuyển đổi phong cách ảnh của bạn thành tranh Van Gogh, Monet, hay bất kỳ phong cách nghệ thuật nào bạn muốn.",
        content: `
## Biến ảnh thành tác phẩm nghệ thuật

**Style Transfer** cho phép bạn áp dụng phong cách của các họa sĩ nổi tiếng lên ảnh của mình.

### Các phong cách có sẵn

- Van Gogh - Starry Night
- Monet - Impressionism
- Picasso - Cubism
- Ukiyo-e - Japanese Art
- Và nhiều hơn nữa!

### Cách sử dụng

1. Upload ảnh gốc của bạn
2. Chọn phong cách nghệ thuật
3. Điều chỉnh độ mạnh của style
4. Generate và thưởng thức!
    `,
        category: "image",
        icon: Wand2,
        coverImage: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=1200&h=600&fit=crop",
        readTime: "4 phút",
        date: "31/12/2025",
        toolLink: "/style-transfer",
        toolName: "Style Transfer",
    },
    {
        id: 6,
        slug: "image-enhance",
        title: "Image Enhance - Nâng Cấp Chất Lượng Ảnh",
        description: "Công cụ nâng cấp độ phân giải ảnh lên 2x, 4x với công nghệ AI tiên tiến, giữ nguyên chi tiết và sắc nét.",
        content: `
## Nâng cấp ảnh với AI

**Image Enhance** sử dụng AI để tăng độ phân giải ảnh mà không mất chi tiết.

### Tính năng

- Upscale 2x, 4x độ phân giải
- Giữ nguyên chi tiết
- Giảm noise
- Làm sắc nét

### Khi nào cần dùng?

- Ảnh cũ chất lượng thấp
- Ảnh cần in kích thước lớn
- Ảnh từ camera cũ
    `,
        category: "enhance",
        icon: TrendingUp,
        coverImage: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1200&h=600&fit=crop",
        readTime: "3 phút",
        date: "30/12/2025",
        toolLink: "/image-enhance",
        toolName: "Image Enhance",
    },
    {
        id: 7,
        slug: "relight",
        title: "Relight - Làm Mới Ánh Sáng Cho Ảnh",
        description: "Thay đổi ánh sáng trong ảnh một cách tự nhiên - từ ánh sáng studio đến hoàng hôn lãng mạn.",
        content: `
## Làm mới ánh sáng ảnh

**Relight** cho phép bạn thay đổi hoàn toàn ánh sáng trong ảnh.

### Các preset có sẵn

- Studio lighting
- Golden hour
- Blue hour
- Dramatic light
- Soft diffused

### Ứng dụng

- Sửa ảnh chụp trong điều kiện ánh sáng xấu
- Tạo mood mới cho ảnh
- Chỉnh sửa ảnh sản phẩm
    `,
        category: "enhance",
        icon: Sun,
        coverImage: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1200&h=600&fit=crop",
        readTime: "4 phút",
        date: "29/12/2025",
        toolLink: "/relight",
        toolName: "Relight",
    },
    {
        id: 8,
        slug: "ai-chat-assistant",
        title: "AI Chat Assistant - Trợ Lý AI Thông Minh",
        description: "Chatbot AI hỗ trợ bạn tạo và chỉnh sửa ảnh chỉ bằng cuộc trò chuyện tự nhiên. Hỏi bất cứ điều gì!",
        content: `
## Trợ lý AI thông minh

**AI Chat Assistant** là chatbot AI giúp bạn tạo và chỉnh sửa ảnh thông qua hội thoại.

### Bạn có thể hỏi

- "Tạo cho tôi một ảnh con mèo dễ thương"
- "Xóa nền ảnh này giúp tôi"
- "Nâng cấp chất lượng ảnh"
- "Biến ảnh thành tranh Van Gogh"

### Tại sao nên dùng?

- Không cần biết kỹ thuật
- Nói ngôn ngữ tự nhiên
- Hỗ trợ tiếng Việt
- Gợi ý và hướng dẫn
    `,
        category: "tips",
        icon: MessageCircle,
        coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=600&fit=crop",
        readTime: "5 phút",
        date: "28/12/2025",
        toolLink: "/ai-chat",
        toolName: "AI Chat",
    },
    {
        id: 9,
        slug: "background-tools",
        title: "Background Tools - Xóa & Thay Đổi Nền Ảnh",
        description: "Công cụ xử lý nền ảnh mạnh mẽ: xóa nền, thay nền mới, hoặc làm mờ nền chỉ trong vài click.",
        content: `
## Công cụ xử lý nền ảnh

**Background Tools** cung cấp các công cụ xử lý nền ảnh mạnh mẽ.

### Tính năng

- **Xóa nền**: Loại bỏ hoàn toàn nền ảnh
- **Thay nền**: Đổi nền với bất kỳ hình ảnh nào
- **Làm mờ nền**: Tạo hiệu ứng bokeh
- **Nền gradient**: Thêm nền gradient đẹp mắt

### Ứng dụng phổ biến

- Ảnh sản phẩm e-commerce
- Ảnh profile chuyên nghiệp
- Ảnh marketing
    `,
        category: "image",
        icon: Layers,
        coverImage: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&h=600&fit=crop",
        readTime: "4 phút",
        date: "27/12/2025",
        toolLink: "/background-tools",
        toolName: "Background Tools",
    },
    {
        id: 10,
        slug: "image-expand",
        title: "Image Expand - Mở Rộng Khung Ảnh",
        description: "Mở rộng biên ảnh bằng AI - thêm nội dung mới vào các cạnh ảnh một cách tự nhiên và liền mạch.",
        content: `
## Mở rộng ảnh với AI

**Image Expand** cho phép bạn mở rộng biên ảnh một cách thông minh.

### Cách hoạt động

1. Upload ảnh gốc
2. Chọn hướng mở rộng (trái, phải, trên, dưới)
3. AI sẽ tạo nội dung mới phù hợp
4. Kết quả tự nhiên, liền mạch

### Khi nào cần dùng?

- Thay đổi tỷ lệ ảnh (9:16 → 16:9)
- Thêm không gian cho text/logo
- Cứu ảnh bị cắt xén
    `,
        category: "image",
        icon: Maximize2,
        coverImage: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=600&fit=crop",
        readTime: "3 phút",
        date: "26/12/2025",
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

    // Listen for dark mode changes
    useEffect(() => {
        const checkDarkMode = () => {
            const darkModeStorage = localStorage.getItem("darkMode") === "true";
            const bodyHasDark = document.body.classList.contains("dark");
            setIsDarkMode(darkModeStorage || bodyHasDark);
        };

        checkDarkMode();
        window.addEventListener("storage", checkDarkMode);
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ["class"],
        });

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
                    <h1 className="text-2xl font-bold mb-2">Bài viết không tồn tại</h1>
                    <button
                        type="button"
                        onClick={() => navigate("/discover")}
                        className={`mt-4 px-6 py-2 rounded-lg ${isDarkMode ? "bg-white text-gray-900" : "bg-gray-900 text-white"}`}
                    >
                        Quay lại Discover
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
                className={`flex items-center gap-2 mb-6 ${isDarkMode ? "text-slate-400 hover:text-white" : "text-gray-600 hover:text-gray-900"
                    } transition-colors group`}
            >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-medium text-sm">Quay lại Discover</span>
            </button>

            {/* Hero Image */}
            <div className="relative rounded-2xl overflow-hidden mb-8">
                <img
                    src={article.coverImage}
                    alt={article.title}
                    className="w-full h-64 md:h-80 object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ${isDarkMode ? "bg-slate-800/80" : "bg-white/90"
                        } backdrop-blur-sm mb-3`}>
                        <Icon className={`w-4 h-4 ${isDarkMode ? "text-purple-400" : "text-purple-600"}`} />
                        <span className={`text-sm font-medium ${isDarkMode ? "text-slate-200" : "text-gray-700"}`}>
                            {article.toolName}
                        </span>
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
                        {article.title}
                    </h1>
                    <div className="flex items-center gap-4 text-gray-200 text-sm">
                        <span className="flex items-center gap-1.5">
                            <Clock className="w-4 h-4" />
                            {article.readTime}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            {article.date}
                        </span>
                    </div>
                </div>
            </div>

            {/* Try Now Button - Sticky */}
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
            <div className={`prose prose-lg max-w-none ${isDarkMode
                    ? "prose-invert prose-p:text-slate-300 prose-headings:text-white prose-strong:text-white prose-li:text-slate-300"
                    : "prose-gray"
                }`}>
                <p className={`text-lg leading-relaxed ${isDarkMode ? "text-slate-300" : "text-gray-600"}`}>
                    {article.description}
                </p>

                {/* Render Markdown-like content */}
                <div
                    className={`mt-8 space-y-6 ${isDarkMode ? "text-slate-300" : "text-gray-700"}`}
                    dangerouslySetInnerHTML={{
                        __html: article.content
                            .replace(/^## (.*$)/gm, `<h2 class="text-2xl font-bold mt-8 mb-4 ${isDarkMode ? "text-white" : "text-gray-900"}">$1</h2>`)
                            .replace(/^### (.*$)/gm, `<h3 class="text-xl font-semibold mt-6 mb-3 ${isDarkMode ? "text-white" : "text-gray-900"}">$1</h3>`)
                            .replace(/^\*\*(.+?)\*\*/gm, `<strong class="${isDarkMode ? "text-white" : "text-gray-900"}">$1</strong>`)
                            .replace(/^- (.*)$/gm, `<li class="ml-4 mb-1">• $1</li>`)
                            .replace(/^\d+\. (.*)$/gm, `<li class="ml-4 mb-1">$1</li>`)
                            .replace(/```([\s\S]*?)```/g, `<pre class="${isDarkMode ? "bg-slate-800" : "bg-gray-100"} p-4 rounded-lg overflow-x-auto my-4"><code>$1</code></pre>`)
                            .replace(/\n\n/g, '</p><p class="mb-4">')
                    }}
                />
            </div>

            {/* Bottom CTA */}
            <div className={`mt-12 p-8 rounded-2xl text-center ${isDarkMode ? "bg-slate-800" : "bg-gray-100"
                }`}>
                <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                    Sẵn sàng thử {article.toolName}?
                </h3>
                <p className={`mb-6 ${isDarkMode ? "text-slate-400" : "text-gray-600"}`}>
                    Trải nghiệm ngay công cụ AI mạnh mẽ này!
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
