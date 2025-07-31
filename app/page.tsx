"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  // 檢查用戶是否已登入，如果已登入則重定向到 profile-setup
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        window.location.href = "/profile-setup"
      }
    }
    checkUser()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (isSignUp) {
      // 註冊邏輯
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage("註冊失敗：" + error.message)
      } else if (data.user) {
        setMessage("註冊成功！請登入。")
        setIsSignUp(false) // 註冊成功後切換回登入模式
      }
    } else {
      // 登入邏輯
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage("登入失敗：" + error.message)
      } else if (data.user) {
        setMessage("登入成功！")
        window.location.href = "/profile-setup" // 登入成功後重定向
      }
    }
    setLoading(false)
  }

  const handleSocialLogin = async (provider: "google" | "facebook") => {
    // 移除 'apple'
    setLoading(true)
    setMessage("")
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/profile-setup`, // 登入成功後重定向到 profile-setup
      },
    })

    if (error) {
      setMessage(`使用 ${provider} 登入失敗：` + error.message)
    }
    setLoading(false)
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setMessage("請先輸入您的電子郵件地址")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
      setMessage("發送重設郵件失敗：" + error.message)
    } else {
      setMessage("密碼重設郵件已發送！請檢查您的郵箱。")
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#075065] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#075065] border-none shadow-none">
        <div className="p-8 text-center">
          {/* 主標題 */}
          <h1 className="text-white text-3xl font-bold mb-12 leading-tight">
            SMART
            <br />
            CONNECT
            <br />
            EVERYWHERE
          </h1>

          {/* 登入表單 */}
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div className="text-left">
              <label className="text-white text-sm mb-2 block">Enter your email</label>
              <Input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white border-none rounded-md h-12 text-gray-700"
                required
              />
            </div>

            <div className="text-left">
              <label className="text-white text-sm mb-2 block">Password</label>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-none rounded-md h-12 text-gray-700"
                required
              />
              {/* 忘記密碼連結移到這裡，靠右對齊 */}
              {!isSignUp && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-white/80 text-sm underline hover:text-white"
                    disabled={loading}
                  >
                    Forgot password?
                  </button>
                </div>
              )}
            </div>

            {message && (
              <p className={`text-sm ${message.includes("失敗") ? "text-red-400" : "text-green-400"}`}>{message}</p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#D66853] hover:bg-orange-500 text-white font-medium h-12 rounded-md mt-6"
              disabled={loading}
            >
              {loading ? "處理中..." : isSignUp ? "Sign up" : "Sign in"}
            </Button>
          </form>

          {/* 分隔線 */}
          <div className="flex items-center mb-6">
            <div className="flex-1 border-t border-white/30"></div>
            <span className="px-4 text-white text-sm">Or</span>
            <div className="flex-1 border-t border-white/30"></div>
          </div>

          {/* 社交登入按鈕 */}
          <div className="space-y-4">
            <Button
              type="button"
              onClick={() => handleSocialLogin("google")}
              className="w-full bg-white hover:bg-gray-100 text-gray-700 font-medium h-12 rounded-md flex items-center justify-center gap-3"
              disabled={loading}
            >
              <img src="/images/google-logo.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </Button>

            <Button
              type="button"
              onClick={() => handleSocialLogin("facebook")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium h-12 rounded-md flex items-center justify-center gap-3"
              disabled={loading}
            >
              <img src="/images/facebook-logo-primary.png" alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </Button>
          </div>

          {/* 切換註冊/登入 */}
          <div className="mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp)
                setMessage("") // 清除訊息
              }}
              className="text-white/80 text-sm underline hover:text-white"
              disabled={loading}
            >
              {isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
