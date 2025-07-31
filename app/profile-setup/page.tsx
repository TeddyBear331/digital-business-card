"use client"

import type React from "react"

import { useState, useEffect } from "react" // 導入 useEffect
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Camera } from "lucide-react"
import { supabase } from "@/lib/supabase" // 導入 Supabase 客戶端

// 社交媒體圖標組件 - 現在使用圖片路徑
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
    component: () => <img src="/images/icons8-threads-50.svg" alt="Threads" className="w-full h-full object-contain" />,
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

export default function ProfileSetup() {
  const [formData, setFormData] = useState({
    name: "",
    surname: "",
    title: "",
    company: "",
    email: "",
    mobile: "",
    website: "",
    bio: "",
    profilePhoto: null as string | null, // 儲存Base64字串
    companyLogo: null as string | null, // 儲存Base64字串
    // 新增社交媒體 URL 欄位
    lineUrl: "",
    whatsappUrl: "",
    linkedinUrl: "",
    instagramUrl: "",
    threadsUrl: "",
    xUrl: "",
    wechatUrl: "",
    facebookUrl: "",
    selectedSocialMedia: [] as string[], // 儲存已選擇的社交媒體平台名稱
  })

  const [bioLength, setBioLength] = useState(0)
  const [profilePhotoPreview, setProfilePhotoPreview] = useState<string | null>(null)
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null) // 用於儲存當前用戶的 ID

  // 在組件載入時獲取當前用戶 ID (假設用戶已登入)
  useEffect(() => {
    const getUserId = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        // TODO: 如果用戶已登入且有現有資料，可以在這裡載入資料
      } else {
        // 如果沒有用戶，可以導向登入頁面或處理未登入狀態
        console.log("No user logged in. Redirecting to login page.")
        window.location.href = "/" // 導向登入頁面
      }
    }
    getUserId()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    // 如果是網址欄位，自動添加 https:// 前綴（如果用戶沒有輸入協議）
    if (field === "website" && value && !value.startsWith("http://") && !value.startsWith("https://")) {
      value = "https://" + value
    }
    // 對於社交媒體 URL 欄位也做同樣處理
    if (field.endsWith("Url") && value && !value.startsWith("http://") && !value.startsWith("https://")) {
      value = "https://" + value
    }

    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "bio") {
      setBioLength(value.length)
    }
  }

  const handleFileUpload = (field: "profilePhoto" | "companyLogo", file: File) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setFormData((prev) => ({ ...prev, [field]: base64String }))
      if (field === "profilePhoto") {
        setProfilePhotoPreview(base64String)
      } else {
        setCompanyLogoPreview(base64String)
      }
    }
    reader.readAsDataURL(file)
  }

  const toggleSocialMedia = (platform: string) => {
    setFormData((prev) => {
      const isSelected = prev.selectedSocialMedia.includes(platform)
      const newSelected = isSelected
        ? prev.selectedSocialMedia.filter((p) => p !== platform)
        : [...prev.selectedSocialMedia, platform]

      // 如果取消選擇，清空對應的 URL 欄位
      const newFormData = { ...prev, selectedSocialMedia: newSelected }
      if (isSelected) {
        ;(newFormData as any)[`${platform}Url`] = "" // 清空 URL
      }
      return newFormData
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!userId) {
      alert("用戶未登入，無法提交資料。")
      // 這裡可以選擇重定向到登入頁面
      window.location.href = "/"
      return
    }

    // 準備要插入到 Supabase 的資料
    const {
      name,
      surname,
      title,
      company,
      email,
      mobile,
      website,
      bio,
      profilePhoto, // Base64 圖片，需要上傳到 Supabase Storage
      companyLogo, // Base64 圖片，需要上傳到 Supabase Storage
      lineUrl,
      whatsappUrl,
      linkedinUrl,
      instagramUrl,
      threadsUrl,
      xUrl,
      wechatUrl,
      facebookUrl,
    } = formData

    let profilePhotoUrl = null
    let companyLogoUrl = null

    // TODO: 這裡需要實作圖片上傳到 Supabase Storage 的邏輯
    // 目前先將 Base64 儲存到資料庫，但這不是最佳實踐
    // 理想情況下，你會將圖片上傳到 Supabase Storage，然後將 Storage 的 URL 儲存到資料庫
    // 為了簡化，我們暫時將 Base64 儲存為 URL，但這會導致資料庫膨脹
    // 後續我們會實作 Supabase Storage 上傳

    profilePhotoUrl = profilePhoto
    companyLogoUrl = companyLogo

    // 檢查 user_profiles 表格中是否已有該 user_id 的資料
    const { data: existingProfile, error: fetchError } = await supabase
      .from("user_profiles")
      .select("id")
      .eq("user_id", userId)
      .single()

    if (fetchError && fetchError.code !== "PGRST116") {
      // PGRST116 表示沒有找到行 (no rows found)
      console.error("Error fetching existing profile:", fetchError)
      alert("檢查現有資料失敗：" + fetchError.message)
      return
    }

    let result
    if (existingProfile) {
      // 如果存在，則更新資料
      const { data, error } = await supabase
        .from("user_profiles")
        .update({
          name,
          surname,
          title,
          company,
          email,
          mobile,
          website,
          bio,
          profile_photo_url: profilePhotoUrl,
          company_logo_url: companyLogoUrl,
          line_url: lineUrl || null,
          whatsapp_url: whatsappUrl || null,
          linkedin_url: linkedinUrl || null,
          instagram_url: instagramUrl || null,
          threads_url: threadsUrl || null,
          x_url: xUrl || null,
          wechat_url: wechatUrl || null,
          facebook_url: facebookUrl || null,
        })
        .eq("user_id", userId)
        .select()
      result = { data, error }
    } else {
      // 如果不存在，則插入新資料
      const { data, error } = await supabase
        .from("user_profiles")
        .insert([
          {
            user_id: userId,
            name,
            surname,
            title,
            company,
            email,
            mobile,
            website,
            bio,
            profile_photo_url: profilePhotoUrl,
            company_logo_url: companyLogoUrl,
            line_url: lineUrl || null,
            whatsapp_url: whatsappUrl || null,
            linkedin_url: linkedinUrl || null,
            instagram_url: instagramUrl || null,
            threads_url: threadsUrl || null,
            x_url: xUrl || null,
            wechat_url: wechatUrl || null,
            facebook_url: facebookUrl || null,
          },
        ])
        .select()
      result = { data, error }
    }

    if (result.error) {
      console.error("Error saving data:", result.error)
      alert("提交資料失敗：" + result.error.message)
    } else {
      console.log("Profile data saved to Supabase:", result.data)
      alert("資料已成功提交！")
      // 重定向到數位名片頁面
      window.location.href = "/digital-card"
    }
  }

  return (
    <div className="min-h-screen bg-[#075065] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#075065] border-none shadow-none">
        <div className="p-6">
          {/* 個人照片上傳 */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mb-4">
                {profilePhotoPreview ? (
                  <img
                    src={profilePhotoPreview || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <Camera className="w-8 h-8 text-white/60" />
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload("profilePhoto", e.target.files[0])}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-white text-sm">Upload your picture</p>
          </div>

          {/* 標題 */}
          <h2 className="text-white text-2xl font-bold text-center mb-8">Input your Information</h2>

          {/* 表單 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              placeholder="Name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              placeholder="Surname"
              value={formData.surname}
              onChange={(e) => handleInputChange("surname", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              placeholder="Title"
              value={formData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              placeholder="Company"
              value={formData.company}
              onChange={(e) => handleInputChange("company", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              type="tel"
              placeholder="Mobile"
              value={formData.mobile}
              onChange={(e) => handleInputChange("mobile", e.target.value)}
              className="bg-white border-none rounded-md h-12"
              required
            />

            <Input
              type="text"
              placeholder="Website (e.g., www.company.com)"
              value={formData.website}
              onChange={(e) => handleInputChange("website", e.target.value)}
              className="bg-white border-none rounded-md h-12"
            />

            {/* 自我介紹 */}
            <div className="relative">
              <Textarea
                placeholder="Bio (with 150 characters)"
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                maxLength={150}
                className="bg-white border-none rounded-md min-h-[100px] resize-none"
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-500">{bioLength}/150</div>
            </div>

            {/* 公司Logo上傳 */}
            <div>
              <label className="text-white text-sm mb-2 block">Company Logo</label>
              <div className="relative">
                <div className="w-full h-20 bg-white rounded-md flex items-center justify-center border-2 border-dashed border-gray-300">
                  {companyLogoPreview ? (
                    <img
                      src={companyLogoPreview || "/placeholder.svg"}
                      alt="Company Logo"
                      className="max-h-16 max-w-full object-contain"
                    />
                  ) : (
                    <Camera className="w-6 h-6 text-gray-400" />
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("companyLogo", e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
            </div>

            {/* 社交媒體選擇和連結輸入 */}
            <div>
              <label className="text-white text-sm mb-3 block">Add Social Media</label>
              <div className="grid grid-cols-4 gap-3">
                {Object.entries(SocialIcons).map(([platform, { component: IconComponent, label }]) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => toggleSocialMedia(platform)}
                    className={`relative w-12 h-12 rounded-lg flex items-center justify-center bg-white p-1 ${
                      formData.selectedSocialMedia.includes(platform)
                        ? "ring-2 ring-white ring-offset-2 ring-offset-[#075065]"
                        : ""
                    }`}
                    title={`Add ${label}`}
                  >
                    <IconComponent />
                  </button>
                ))}
              </div>

              {/* 顯示已選擇社交媒體的輸入框 */}
              <div className="mt-4 space-y-3">
                {formData.selectedSocialMedia.map((platform) => {
                  const platformLabel = (SocialIcons as any)[platform]?.label || platform
                  const urlFieldName = `${platform}Url`
                  return (
                    <Input
                      key={platform}
                      placeholder={`${platformLabel} URL`}
                      value={(formData as any)[urlFieldName]}
                      onChange={(e) => handleInputChange(urlFieldName, e.target.value)}
                      className="bg-white border-none rounded-md h-12"
                      type="url" // 使用 url 類型以獲得更好的鍵盤和驗證
                    />
                  )
                })}
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-black hover:bg-gray-900 text-white font-medium h-12 rounded-md mt-8"
            >
              Submit
            </Button>
          </form>
        </div>
      </Card>
    </div>
  )
}
