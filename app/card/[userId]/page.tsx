"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Camera, Phone, Mail, Globe } from "lucide-react"
import { supabase } from "@/lib/supabase"

// 定義用戶資料的類型
interface UserProfileData {
  name: string
  surname: string
  title: string
  company: string
  email: string
  mobile: string
  website: string
  bio: string
  profile_photo_url: string | null
  company_logo_url: string | null
  line_url: string | null
  whatsapp_url: string | null
  linkedin_url: string | null
  instagram_url: string | null
  threads_url: string | null
  x_url: string | null
  wechat_url: string | null
  facebook_url: string | null
}

export default function PublicCard({ params }: { params: { userId: string } }) {
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        console.log("Fetching profile for user ID:", params.userId)

        // 重要：這裡不需要檢查認證狀態，因為這是公開頁面
        // 直接查詢用戶資料，不需要認證
        const { data, error } = await supabase.from("user_profiles").select("*").eq("user_id", params.userId).single()

        if (error) {
          console.error("Error fetching user profile:", error)
          if (error.code === "PGRST116") {
            setError("找不到此名片")
          } else {
            setError("載入名片時發生錯誤")
          }
        } else if (data) {
          console.log("Profile data loaded:", data)
          setUserData(data)
        } else {
          setError("找不到此名片")
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("載入名片時發生錯誤")
      } finally {
        setLoading(false)
      }
    }

    if (params.userId) {
      fetchUserProfile()
    } else {
      setError("無效的名片連結")
      setLoading(false)
    }
  }, [params.userId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#075065] mx-auto mb-4"></div>
          <p>載入中...</p>
        </Card>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">😔 找不到名片</h1>
          <p className="text-gray-600 mb-6">{error || "此名片可能已被刪除或不存在。"}</p>
          <div className="text-sm text-gray-500">
            <p>如果您認為這是錯誤，請聯繫名片擁有者。</p>
          </div>
        </Card>
      </div>
    )
  }

  // 社交媒體圖標組件
  const SocialIcons = {
    line: {
      component: () => <img src="/images/icons8-line-50.svg" alt="LINE" className="w-full h-full object-contain" />,
      label: "LINE",
    },
    whatsapp: {
      component: () => (
        <img src="/images/icons8-whatsapp-50.svg" alt="WhatsApp" className="w-full h-full object-contain" />
      ),
      label: "WhatsApp",
    },
    linkedin: {
      component: () => (
        <img src="/images/icons8-linkedin-50.svg" alt="LinkedIn" className="w-full h-full object-contain" />
      ),
      label: "LinkedIn",
    },
    instagram: {
      component: () => <img src="/images/icons8-ig-50.svg" alt="Instagram" className="w-full h-full object-contain" />,
      label: "Instagram",
    },
    threads: {
      component: () => (
        <img src="/images/icons8-threads-50.svg" alt="Threads" className="w-full h-full object-contain" />
      ),
      label: "Threads",
    },
    x: {
      component: () => <img src="/images/icons8-x-50.svg" alt="X" className="w-full h-full object-contain" />,
      label: "X",
    },
    wechat: {
      component: () => <img src="/images/icons8-wechat-50.svg" alt="WeChat" className="w-full h-full object-contain" />,
      label: "WeChat",
    },
    facebook: {
      component: () => (
        <img src="/images/facebook-logo-primary.png" alt="Facebook" className="w-full h-full object-contain" />
      ),
      label: "Facebook",
    },
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-lg overflow-hidden">
        {/* 上半部 - 深青色背景 */}
        <div className="bg-[#075065] text-white p-8 text-center relative">
          {/* 個人照片 */}
          <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
            {userData.profile_photo_url ? (
              <img
                src={userData.profile_photo_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.style.display = "none"
                  const nextElement = e.currentTarget.nextElementSibling as HTMLElement
                  if (nextElement) {
                    nextElement.classList.remove("hidden")
                  }
                }}
              />
            ) : null}
            <Camera className={`w-8 h-8 text-white/60 ${userData.profile_photo_url ? "hidden" : ""}`} />
          </div>

          {/* 姓名和職位 */}
          <h1 className="text-2xl font-bold mb-2">
            {userData.name} {userData.surname}
          </h1>
          <p className="text-lg opacity-90">
            {userData.title} | {userData.company}
          </p>

          {/* 聯絡資訊 */}
          <div className="mt-6 space-y-2">
            {userData.email && (
              <a
                href={`mailto:${userData.email}`}
                className="flex items-center justify-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4" />
                <span className="text-sm">{userData.email}</span>
              </a>
            )}
            {userData.mobile && (
              <a
                href={`tel:${userData.mobile}`}
                className="flex items-center justify-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Phone className="w-4 h-4" />
                <span className="text-sm">{userData.mobile}</span>
              </a>
            )}
            {userData.website && (
              <a
                href={userData.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white/90 hover:text-white transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">{userData.website}</span>
              </a>
            )}
          </div>
        </div>

        {/* 下半部 - 白色背景 */}
        <div className="p-8">
          {/* 自我介紹 - 靠左對齊 */}
          {userData.bio && userData.bio !== "n/a" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2 text-left">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed text-left">{userData.bio}</p>
            </div>
          )}

          {/* 社交媒體圖標 - 靠左對齊 */}
          <div className="flex flex-wrap gap-4 justify-start mb-4">
            {Object.entries(SocialIcons).map(([platform, { component: IconComponent, label }]) => {
              const urlFieldName = `${platform}_url` as keyof UserProfileData
              const url = userData[urlFieldName]
              if (url) {
                return (
                  <a
                    key={platform}
                    href={url as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-100 p-1 hover:bg-gray-200 transition-colors"
                    title={`Visit ${label} profile`}
                  >
                    <IconComponent />
                  </a>
                )
              }
              return null
            })}
          </div>

          {/* 公司Logo - 左右填滿 */}
          {userData.company_logo_url && (
            <div className="mt-4">
              <div className="w-full h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                <img
                  src={userData.company_logo_url || "/placeholder.svg"}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            </div>
          )}

          {/* 底部資訊 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500">Powered by Smart Connect Everywhere</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
