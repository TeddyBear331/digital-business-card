"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { supabase } from "@/lib/supabase"

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [isValidSession, setIsValidSession] = useState(false)

  useEffect(() => {
    // 檢查是否有有效的重設密碼 session
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        setIsValidSession(true)
      } else {
        setMessage("無效的重設連結或連結已過期")
      }
    }
    checkSession()
  }, [])

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      setMessage("密碼不匹配")
      return
    }

    if (password.length < 6) {
      setMessage("密碼至少需要 6 個字符")
      return
    }

    setLoading(true)
    setMessage("")

    const { error } = await supabase.auth.updateUser({
      password: password,
    })

    if (error) {
      setMessage("密碼重設失敗：" + error.message)
    } else {
      setMessage("密碼重設成功！正在重定向...")
      // 重定向到登入頁面
      setTimeout(() => {
        window.location.href = "/"
      }, 2000)
    }
    setLoading(false)
  }

  if (!isValidSession) {
    return (
      <div className="min-h-screen bg-[#075065] flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-[#075065] border-none shadow-none">
          <div className="p-8 text-center">
            <h1 className="text-white text-2xl font-bold mb-4">重設密碼</h1>
            <p className="text-white/80 mb-6">{message}</p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="w-full bg-[#D66853] hover:bg-orange-500 text-white font-medium h-12 rounded-md"
            >
              返回登入頁面
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#075065] flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-[#075065] border-none shadow-none">
        <div className="p-8">
          <h1 className="text-white text-2xl font-bold text-center mb-8">設定新密碼</h1>

          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="text-left">
              <label className="text-white text-sm mb-2 block">新密碼</label>
              <Input
                type="password"
                placeholder="輸入新密碼"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white border-none rounded-md h-12 text-gray-700"
                required
                minLength={6}
              />
            </div>

            <div className="text-left">
              <label className="text-white text-sm mb-2 block">確認新密碼</label>
              <Input
                type="password"
                placeholder="再次輸入新密碼"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-white border-none rounded-md h-12 text-gray-700"
                required
                minLength={6}
              />
            </div>

            {message && (
              <p
                className={`text-sm ${message.includes("失敗") || message.includes("無效") || message.includes("不匹配") ? "text-red-400" : "text-green-400"}`}
              >
                {message}
              </p>
            )}

            <Button
              type="submit"
              className="w-full bg-[#D66853] hover:bg-orange-500 text-white font-medium h-12 rounded-md mt-6"
              disabled={loading}
            >
              {loading ? "處理中..." : "重設密碼"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => (window.location.href = "/")}
              className="text-white/80 text-sm underline hover:text-white"
            >
              返回登入頁面
            </button>
          </div>
        </div>
      </Card>
    </div>
  )
}
