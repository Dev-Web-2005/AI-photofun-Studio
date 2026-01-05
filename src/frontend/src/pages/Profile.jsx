import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Calendar,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  Share2,
  Crown,
  Sparkles,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import PostList from "../components/post/PostList";
import { usePosts } from "../hooks/usePosts";
import { useProfile } from "../hooks/useProfile";
import { userApi } from "../api/userApi";
import { toast } from "../hooks/use-toast";

const DEFAULT_AVATAR = "https://placehold.co/128x128/111/fff?text=U";

// Utility functions to mask sensitive data
const maskEmail = (email) => {
  if (!email || !email.includes("@")) return email;
  const [local, domain] = email.split("@");
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${local[1]}***@${domain}`;
};

const maskPhone = (phone) => {
  if (!phone || phone.length < 6) return phone;
  const visibleStart = phone.slice(0, 3);
  const visibleEnd = phone.slice(-3);
  return `${visibleStart}****${visibleEnd}`;
};

const PROFILE_DEFAULTS = {
  fullName: "",
  bio: "Digital artist · AI creative explorer",
  email: "",
  phone: "",
  avatarUrl: DEFAULT_AVATAR,
  address: "123 Nguyễn Huệ Street, District 1, Ho Chi Minh City",
  country: "Vietnam",
  dob: "May 01, 2005",
  created: "November 12, 2025",
};

const profileStats = [{ label: "Images Created", value: "128" }];

const Profile = () => {
  const navigate = useNavigate();
  const [emailVerified, setEmailVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [showPhone, setShowPhone] = useState(false);
  const {
    profile,
    currentUser,
    loading: profileLoading,
    error: profileError,
    fetchProfile,
  } = useProfile();

  const {
    posts,
    loading: postsLoading,
    error: postsError,
    handleLike,
    userCache,
  } = usePosts({ isMyPosts: true, size: 5 });

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Gọi API kiểm tra trạng thái xác minh email
  useEffect(() => {
    const checkEmailVerification = async () => {
      try {
        const response = await userApi.checkVerifyStatus();
        // API trả về { code: "1000", message: "Success", result: true/false }
        const isVerified = response.data?.result ?? false;
        setEmailVerified(isVerified);
      } catch (error) {
        console.error("Failed to check email verification status:", error);
        setEmailVerified(false);
      }
    };
    checkEmailVerification();
  }, []);

  // Hàm gửi email xác minh
  const handleSendVerification = async () => {
    setVerifying(true);
    setVerifyMessage("");
    try {
      await userApi.sendVerification();
      // Chuyển hướng sang trang xác minh email sau khi gửi thành công
      navigate("/verify-email");
    } catch (error) {
      console.error("Failed to send verification email:", error);
      const msg = "Unable to send verification email. Please try again later.";
      setVerifyMessage(msg);
      toast.error(msg);
      setVerifying(false);
    }
  };

  const displayProfile = {
    fullName:
      profile?.fullName || currentUser?.fullName || PROFILE_DEFAULTS.fullName,
    bio: profile?.bio ?? PROFILE_DEFAULTS.bio,
    email: profile?.email ?? PROFILE_DEFAULTS.email,
    phone: profile?.phone ?? PROFILE_DEFAULTS.phone,
    avatarUrl:
      currentUser?.avatar ||
      profile?.avatarUrl ||
      PROFILE_DEFAULTS.avatarUrl ||
      DEFAULT_AVATAR,
    address: profile?.address ?? PROFILE_DEFAULTS.address,
    country: profile?.country ?? PROFILE_DEFAULTS.country,
    dob: profile?.dob ?? PROFILE_DEFAULTS.dob,
    created: profile?.createdAt
      ? new Date(profile.createdAt).toLocaleDateString()
      : PROFILE_DEFAULTS.created,
    isPremium: Boolean(
      profile?.isPremium ||
        profile?.premium ||
        profile?.premiumOneMonth ||
        profile?.premiumSixMonths ||
        currentUser?.premiumOneMonth ||
        currentUser?.premiumSixMonths
    ),
    premiumOneMonth: Boolean(
      profile?.premiumOneMonth || currentUser?.premiumOneMonth
    ),
    premiumSixMonths: Boolean(
      profile?.premiumSixMonths || currentUser?.premiumSixMonths
    ),
  };

  const contactDetails = [
    {
      id: "email",
      label: "Email",
      value: showEmail ? displayProfile.email : maskEmail(displayProfile.email),
      rawValue: displayProfile.email,
      isShown: showEmail,
      toggle: () => setShowEmail(!showEmail),
      icon: Mail,
    },
    {
      id: "phone",
      label: "Phone Number",
      value: showPhone ? displayProfile.phone : maskPhone(displayProfile.phone),
      rawValue: displayProfile.phone,
      isShown: showPhone,
      toggle: () => setShowPhone(!showPhone),
      icon: Phone,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {profileLoading && (
        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 animate-[fadeIn_0.3s_ease-in-out]">
          Loading profile information...
        </div>
      )}
      {profileError && (
        <div className="p-4 rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-sm text-red-700 dark:text-red-400 animate-[fadeIn_0.3s_ease-in-out]">
          {profileError}
        </div>
      )}
      <section
        className={`backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)] relative overflow-hidden transition-all duration-300 ${
          displayProfile.isPremium
            ? "bg-gradient-to-br from-yellow-50/95 via-orange-50/95 to-pink-50/95 dark:from-yellow-900/10 dark:via-orange-900/10 dark:to-pink-900/10 border-2 border-yellow-200/50 dark:border-yellow-700/50"
            : "bg-white/95 dark:bg-gray-800/95 border border-gray-200/50 dark:border-gray-700/50"
        }`}
      >
        {/* Premium Background Decoration */}
        {displayProfile.isPremium && (
          <>
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 opacity-80" />
            <div className="absolute top-6 right-6 opacity-5 dark:opacity-10">
              <Crown className="w-32 h-32 text-yellow-500" />
            </div>
            <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-tl from-yellow-200/20 via-orange-200/20 to-pink-200/20 dark:from-yellow-500/5 dark:via-orange-500/5 dark:to-pink-500/5 rounded-full blur-3xl" />
          </>
        )}

        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
          {/* Premium Avatar with Animated Frame */}
          <div className="relative group shrink-0">
            {displayProfile.isPremium && (
              <div
                className="absolute -inset-3 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full blur-md opacity-60 group-hover:opacity-80 transition-opacity"
                style={{ animation: "spin 4s linear infinite" }}
              />
            )}
            <div
              className={`relative ${
                displayProfile.isPremium
                  ? "p-1.5 bg-gradient-to-br from-yellow-400 via-orange-500 to-pink-500 rounded-full shadow-xl"
                  : "p-1 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-full"
              }`}
            >
              <div className="p-1 bg-white dark:bg-gray-800 rounded-full">
                <img
                  src={displayProfile.avatarUrl}
                  alt={`${displayProfile.fullName} avatar`}
                  className="w-32 h-32 rounded-full object-cover shadow-lg transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </div>
            {/* Premium Crown Badge */}
            {displayProfile.isPremium && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full p-2.5 shadow-xl ring-4 ring-white dark:ring-gray-800">
                <Crown className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          <div className="flex-1 w-full min-w-0">
            <div className="flex flex-col gap-5">
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1
                    className={`text-3xl md:text-4xl font-bold tracking-tight ${
                      displayProfile.isPremium
                        ? "bg-gradient-to-r from-yellow-600 via-orange-600 to-pink-600 dark:from-yellow-400 dark:via-orange-400 dark:to-pink-400 bg-clip-text text-transparent"
                        : "text-gray-900 dark:text-gray-100"
                    }`}
                  >
                    {displayProfile.fullName}
                  </h1>
                  {displayProfile.isPremium && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 text-white shadow-lg ring-2 ring-yellow-200/50 dark:ring-yellow-700/50">
                      <Crown className="w-3.5 h-3.5" />
                      <span>PREMIUM</span>
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                  {displayProfile.bio}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {profileStats.map((stat) => (
                  <div key={stat.label} className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-600/50 hover:shadow-lg transition-all duration-300 hover:scale-105">
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold mt-2 text-gray-900 dark:text-gray-100">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate("/profile/edit")}
                  className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-200 text-white dark:text-gray-900 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  Edit Profile
                </button>
                <button
                  type="button"
                  className="px-6 py-3 border-2 border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-xl font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                >
                  <Share2 className="w-4 h-4" /> Share Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)]">
        <h2 className="text-lg font-bold mb-5 text-gray-900 dark:text-gray-100">Contact Information</h2>
        <div className="space-y-4">
          {contactDetails.map((item) => {
            const Icon = item.icon;
            const isEmailField = item.id === "email";
            return (
              <div key={item.id}>
                <p className="text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider mb-2">
                  {item.label}
                </p>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl border border-gray-200/50 dark:border-gray-600/50 hover:shadow-md transition-all duration-300">
                  <div className="p-2 rounded-lg bg-white dark:bg-gray-600/50">
                    <Icon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
                  </div>
                  <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">
                    {item.value}
                  </span>
                  {/* Verified badge for email - after email value */}
                  {isEmailField && (
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                        emailVerified
                          ? "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700"
                          : "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/30 dark:to-rose-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700"
                      }`}
                    >
                      {emailVerified ? (
                        <>
                          <CheckCircle className="w-3.5 h-3.5" />
                          Verified
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3.5 h-3.5" />
                          Not verified
                        </>
                      )}
                    </span>
                  )}
                  {/* Show/Hide toggle button - aligned to the right */}
                  {item.rawValue && (
                    <button
                      type="button"
                      onClick={item.toggle}
                      className="p-2 rounded-lg hover:bg-white dark:hover:bg-gray-600 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
                      title={item.isShown ? "Hide" : "Show"}
                    >
                      {item.isShown ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
                {/* Nút xác minh và thông báo */}
                {isEmailField && !emailVerified && (
                  <div className="mt-3 flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={handleSendVerification}
                      disabled={verifying}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white text-sm font-semibold rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 dark:hover:from-blue-600 dark:hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] w-fit cursor-pointer"
                    >
                      {verifying ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Verify now
                        </>
                      )}
                    </button>
                    {verifyMessage && (
                      <p
                        className={`text-sm font-medium ${
                          verifyMessage.includes("sent")
                            ? "text-green-600 dark:text-green-400"
                            : "text-red-600 dark:text-red-400"
                        }`}
                      >
                        {verifyMessage}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-3xl p-6 shadow-[0_20px_70px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_70px_-15px_rgba(0,0,0,0.6)]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Recent Posts</h2>
          <button
            type="button"
            onClick={() => navigate("/dashboard")}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors cursor-pointer hover:underline underline-offset-4"
          >
            Manage Posts
          </button>
        </div>
        {postsLoading && (
          <div className="mb-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 text-sm text-gray-600 dark:text-gray-400 animate-[fadeIn_0.3s_ease-in-out]">
            Loading posts...
          </div>
        )}
        {postsError && (
          <div className="mb-4 rounded-xl border border-red-200 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 px-4 py-3 text-sm text-red-700 dark:text-red-400 animate-[fadeIn_0.3s_ease-in-out]">
            {postsError}
          </div>
        )}
        {!postsLoading && !postsError && posts.length === 0 && (
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 px-4 py-6 text-sm text-gray-600 dark:text-gray-400 text-center animate-[fadeIn_0.3s_ease-in-out]">
            You don't have any posts yet. Create your first post in the
            dashboard!
          </div>
        )}
        <PostList
          posts={posts}
          userCache={userCache}
          onLikePost={handleLike}
          onNavigateAiTools={() => navigate("/ai-tools")}
        />
      </section>
    </div>
  );
};

export default Profile;
