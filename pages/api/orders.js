export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { customer_name, phone, telegram, address, total, items } = req.body

  if (!phone || !total || !items) {
    return res.status(400).json({ error: 'Missing required fields' })
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  const itemsList = items.map(i =>
    `  • ${i.name}${i.color ? ` (${i.color})` : ''}${i.size ? ` / ${i.size}` : ''} × ${i.qty} = ${(i.price * i.qty).toLocaleString('uz-UZ')} so'm`
  ).join('\n')

  // Format telegram link
  const telegramDisplay = telegram
    ? telegram.startsWith('@')
      ? `<a href="https://t.me/${telegram.slice(1)}">${telegram}</a>`
      : telegram
    : "Ko'rsatilmagan"

  const message = `🛍 <b>YANGI BUYURTMA!</b>

👤 <b>Mijoz:</b> ${customer_name || "Noma'lum"}
📞 <b>Telefon:</b> ${phone}
💬 <b>Telegram:</b> ${telegramDisplay}
📍 <b>Manzil:</b> ${address || "Ko'rsatilmagan"}

🧾 <b>Buyurtma:</b>
${itemsList}

💰 <b>Jami: ${Number(total).toLocaleString('uz-UZ')} so'm</b>

⏰ ${new Date().toLocaleString('uz-UZ', { timeZone: 'Asia/Tashkent' })}`

  try {
    const tgRes = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text: message,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      }
    )
    const tgData = await tgRes.json()
    if (!tgData.ok) {
      console.error('Telegram error:', tgData)
      return res.status(500).json({ error: 'Telegram send failed' })
    }
    return res.status(200).json({ success: true })
  } catch (err) {
    console.error('Order API error:', err)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
