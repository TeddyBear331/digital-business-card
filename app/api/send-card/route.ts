import { type NextRequest, NextResponse } from "next/server"
import { Resend } from "resend"

// 初始化 Resend
const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { recipientEmail, senderName, cardUrl } = await request.json()

    // 驗證必要的參數
    if (!recipientEmail || !senderName || !cardUrl) {
      return NextResponse.json({ success: false, message: "缺少必要參數" }, { status: 400 })
    }

    // 驗證郵件格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(recipientEmail)) {
      return NextResponse.json({ success: false, message: "無效的郵件地址" }, { status: 400 })
    }

    // 創建郵件內容
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Digital Business Card</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f5f5f5;
            }
            .container {
              background: white;
              border-radius: 12px;
              padding: 40px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
            }
            .title {
              color: #075065;
              font-size: 28px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .subtitle {
              color: #666;
              font-size: 16px;
              margin-bottom: 30px;
            }
            .card-preview {
              background: linear-gradient(135deg, #075065 0%, #0a6b7d 100%);
              color: white;
              padding: 30px;
              border-radius: 12px;
              text-align: center;
              margin: 30px 0;
            }
            .sender-name {
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .message {
              font-size: 16px;
              opacity: 0.9;
            }
            .cta-button {
              display: inline-block;
              background: #D66853;
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              font-size: 16px;
              margin: 30px 0;
              transition: background-color 0.3s;
            }
            .cta-button:hover {
              background: #c55a47;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #eee;
              color: #666;
              font-size: 14px;
            }
            .features {
              margin: 30px 0;
            }
            .feature {
              display: flex;
              align-items: center;
              margin: 15px 0;
              padding: 15px;
              background: #f8f9fa;
              border-radius: 8px;
            }
            .feature-icon {
              width: 24px;
              height: 24px;
              margin-right: 15px;
              color: #075065;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 class="title">📇 Digital Business Card</h1>
              <p class="subtitle">You've received a digital business card!</p>
            </div>

            <div class="card-preview">
              <div class="sender-name">${senderName}</div>
              <div class="message">wants to connect with you</div>
            </div>

            <div style="text-align: center;">
              <p style="font-size: 18px; margin-bottom: 20px;">
                <strong>${senderName}</strong> has shared their digital business card with you. 
                Click the button below to view their contact information and connect!
              </p>
              
              <a href="${cardUrl}" class="cta-button">
                🔗 View Digital Card
              </a>
            </div>

            <div class="features">
              <div class="feature">
                <span class="feature-icon">📱</span>
                <div>
                  <strong>Mobile Friendly</strong><br>
                  View the card on any device, anywhere
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">🔗</span>
                <div>
                  <strong>Direct Contact</strong><br>
                  Access all contact information and social media links
                </div>
              </div>
              <div class="feature">
                <span class="feature-icon">💾</span>
                <div>
                  <strong>Save to Contacts</strong><br>
                  Easily save the contact information to your phone
                </div>
              </div>
            </div>

            <div class="footer">
              <p>This digital business card was sent via Smart Connect Everywhere</p>
              <p style="margin-top: 10px;">
                <a href="${cardUrl}" style="color: #075065;">View Card</a>
              </p>
            </div>
          </div>
        </body>
      </html>
    `

    // 發送郵件
    const { data, error } = await resend.emails.send({
      from: "Digital Card <noreply@resend.dev>", // 使用 Resend 的預設發送地址
      to: [recipientEmail],
      subject: `${senderName} shared their digital business card with you`,
      html: emailHtml,
    })

    if (error) {
      console.error("Resend error:", error)
      return NextResponse.json({ success: false, message: "郵件發送失敗" }, { status: 500 })
    }

    console.log("Email sent successfully:", data)
    return NextResponse.json({
      success: true,
      message: "名片已成功發送",
      emailId: data?.id,
    })
  } catch (error) {
    console.error("Error sending card:", error)
    return NextResponse.json({ success: false, message: "發送失敗，請稍後再試" }, { status: 500 })
  }
}
