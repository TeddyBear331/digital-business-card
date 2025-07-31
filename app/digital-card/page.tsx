"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Send, Camera, Copy, Phone, Mail, Globe } from "lucide-react"
import QRCode from "qrcode"
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

export default function DigitalCard() {
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [cardUrl, setCardUrl] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)
  const [userData, setUserData] = useState<UserProfileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError) {
          console.error("Authentication error:", authError)
          setError("登入已過期，請重新登入")
          await supabase.auth.signOut()
          setTimeout(() => {
            window.location.href = "/"
          }, 2000)
          return
        }

        if (!user) {
          console.log("No user logged in. Redirecting to login page.")
          setError("請先登入")
          setTimeout(() => {
            window.location.href = "/"
          }, 2000)
          return
        }

        const { data, error: profileError } = await supabase
          .from("user_profiles")
          .select("*")
          .eq("user_id", user.id)
          .single()

        if (profileError) {
          console.error("Error fetching user profile:", profileError)
          setError("無法載入用戶資料")
        } else if (data) {
          setUserData(data)

          // 生成名片 URL
          const generatedCardUrl = `${window.location.origin}/card/${user.id}`
          setCardUrl(generatedCardUrl)

          console.log("🔗 Generated QR code URL:", generatedCardUrl)
          console.log("🌐 Current origin:", window.location.origin)
          console.log("👤 User ID:", user.id)

          // 生成QR碼
          QRCode.toDataURL(generatedCardUrl, { width: 200, margin: 2 })
            .then((url: string) => setQrCodeUrl(url))
            .catch((err: Error) => console.error("QR Code generation error:", err))
        }
      } catch (err) {
        console.error("Unexpected error:", err)
        setError("發生未預期的錯誤")
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  const handleShare = () => {
    setShowShareModal(true)
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(cardUrl)
      alert("連結已複製到剪貼簿！")
    } catch (err) {
      console.error("Failed to copy:", err)
      const textArea = document.createElement("textarea")
      textArea.value = cardUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      alert("連結已複製到剪貼簿！")
    }
  }

  const handleTestLink = () => {
    window.open(cardUrl, "_blank")
  }

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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">錯誤</h1>
          <p className="text-gray-700 mb-6">{error}</p>
          <Button onClick={() => (window.location.href = "/")} className="bg-[#075065] hover:bg-[#064055] text-white">
            返回登入頁面
          </Button>
        </Card>
      </div>
    )
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Card className="w-full max-w-md p-8 text-center">
          <p>找不到用戶資料</p>
          <Button
            onClick={() => (window.location.href = "/profile-setup")}
            className="mt-4 bg-[#075065] hover:bg-[#064055] text-white"
          >
            前往資料設定
          </Button>
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
          {/* 分享按鈕 */}
          <button onClick={handleShare} className="absolute top-4 right-4 text-white hover:text-gray-200">
            <Send className="w-6 h-6" />
          </button>

          {/* 個人照片 */}
          <div className="w-32 h-32 bg-white/20 rounded-full mx-auto mb-6 flex items-center justify-center overflow-hidden">
            {userData.profile_photo_url ? (
              <img
                src={userData.profile_photo_url || "/placeholder.svg"}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  console.log("Profile image failed to load:", userData.profile_photo_url)
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

          {/* QR碼 */}
          <div className="mt-8 flex justify-center">
            {qrCodeUrl && (
              <div className="bg-white p-4 rounded-lg">
                <img src={qrCodeUrl || "/placeholder.svg"} alt="QR Code" className="w-40 h-40" />
              </div>
            )}
          </div>

          {/* 調試按鈕 */}
          <div className="mt-4 flex gap-2 justify-center">
            <button
              onClick={handleCopyLink}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm flex items-center gap-1"
            >
              <Copy className="w-4 h-4" />
              複製連結
            </button>
            <button
              onClick={handleTestLink}
              className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-sm"
            >
              測試連結
            </button>
          </div>
        </div>

        {/* 下半部 - 白色背景 */}
        <div className="p-8 text-center">
          {/* 顯示連結資訊 */}
          <div className="mb-6 p-3 bg-gray-100 rounded-lg">
            <p className="text-xs text-gray-600 mb-1">名片連結：</p>
            <p className="text-xs text-gray-800 break-all">{cardUrl}</p>
          </div>

          {/* 自我介紹 */}
          {userData.bio && userData.bio !== "n/a" && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{userData.bio}</p>
            </div>
          )}

          {/* 公司Logo */}
          {userData.company_logo_url && (
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-100 rounded-lg mx-auto flex items-center justify-center overflow-hidden">
                <img
                  src={userData.company_logo_url || "/placeholder.svg"}
                  alt="Company Logo"
                  className="max-w-full max-h-full object-contain"
                  onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                    console.log("Company logo failed to load:", userData.company_logo_url)
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            </div>
          )}

          {/* 社交媒體圖標 */}
          <div className="grid grid-cols-4 gap-4 justify-items-center">
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
        </div>
      </Card>

      {/* 分享模態框 */}
      {showShareModal && <ShareModal onClose={() => setShowShareModal(false)} cardUrl={cardUrl} />}
    </div>
  )
}

// 分享模態框組件
function ShareModal({ onClose, cardUrl }: { onClose: () => void; cardUrl: string }) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  const handleSend = async () => {
    if (!email) {
      setMessage("請輸入電子郵件地址")
      return
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      setMessage("請輸入有效的電子郵件地址")
      return
    }

    setLoading(true)
    setMessage("")

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setMessage("用戶未登入")
        return
      }

      const { data: userData } = await supabase
        .from("user_profiles")
        .select("name, surname")
        .eq("user_id", user.id)
        .single()

      const senderName = userData ? `${userData.name} ${userData.surname}` : "Someone"

      const response = await fetch("/api/send-card", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipientEmail: email,
          senderName,
          cardUrl,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setMessage("名片已成功發送！")
        setTimeout(() => {
          onClose()
        }, 2000)
      } else {
        setMessage("發送失敗：" + result.message)
      }
    } catch (error) {
      console.error("Error sending card:", error)
      setMessage("發送失敗，請稍後再試")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-sm bg-[#D66853] text-white p-6">
        <h3 className="text-lg font-medium mb-4">
          Hi,
          <br />
          Nice to meet you! This is my contact. Stay in Touch!
        </h3>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 rounded-md text-gray-700 mb-4"
          disabled={loading}
        />

        {message && (
          <p className={`text-sm mb-4 ${message.includes("成功") ? "text-green-200" : "text-red-200"}`}>{message}</p>
        )}

        <div className="flex gap-3">
          <Button
            onClick={handleSend}
            className="flex-1 bg-white text-[#D66853] hover:bg-gray-100 border border-[#D66853]"
            disabled={loading}
          >
            {loading ? "發送中..." : "Send"} <Send className="w-4 h-4 ml-2" />
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="flex-1 border-white text-white hover:bg-white/10 bg-transparent"
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  )
}
