# backend/app/core/email.py
import asyncio
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Optional

from .config import settings

logger = logging.getLogger(__name__)


def _get_connection():
    if not settings.MAIL_USER or not settings.MAIL_PASSWORD:
        logger.warning("MAIL_USER or MAIL_PASSWORD not set in .env")
        return None
    try:
        smtp = smtplib.SMTP(settings.MAIL_HOST, settings.MAIL_PORT)
        if settings.MAIL_TLS:
            smtp.starttls()
        smtp.login(settings.MAIL_USER, settings.MAIL_PASSWORD)
        return smtp
    except Exception as e:
        logger.warning("SMTP connection failed: %s", e)
        return None


def send_email(to: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    """Send an email. Returns True if sent, False if mail not configured or send failed."""
    smtp = _get_connection()
    if not smtp:
        return False
    from_addr = settings.MAIL_FROM or settings.MAIL_USER or "noreply@paisatracker.com"
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = from_addr
    msg["To"] = to
    if text_body:
        msg.attach(MIMEText(text_body, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    try:
        smtp.sendmail(from_addr, [to], msg.as_string())
        smtp.quit()
        return True
    except Exception as e:
        logger.warning("Send mail failed: %s", e)
        try:
            smtp.quit()
        except Exception:
            pass
        return False


async def send_email_async(to: str, subject: str, html_body: str, text_body: Optional[str] = None) -> bool:
    """Send email in a thread pool so it does not block the event loop."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, lambda: send_email(to, subject, html_body, text_body))


def render_welcome_html(user_email: str, app_name: str = "Paisatracker", login_url: str = "") -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to {app_name}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px;">
              <h1 style="margin: 0 0 8px; font-size: 1.5rem; color: #333;">Welcome to {app_name}</h1>
              <p style="margin: 0 0 24px; color: #777; font-size: 15px; line-height: 1.5;">
                Hi! Your account is ready. Track income and expenses, see spending by category, and get monthly summaries.
              </p>
              <p style="margin: 0 0 16px; font-size: 14px; color: #555;">
                <strong>Quick tips:</strong><br/>
                • Add transactions to see your dashboard fill up<br/>
                • Use categories to understand where money goes<br/>
                • Request a monthly summary by email anytime
              </p>
              <p style="margin: 24px 0 0;">
                <a href="{login_url}" style="display: inline-block; padding: 12px 24px; background-color: #5a9a5a; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">Go to dashboard</a>
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #999;">Happy tracking!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def render_reset_password_html(reset_link: str, app_name: str = "Paisatracker") -> str:
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your password</title>
</head>
<body style="margin:0; padding:0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 480px; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 40px 32px;">
              <h1 style="margin: 0 0 8px; font-size: 1.5rem; color: #333;">Reset your password</h1>
              <p style="margin: 0 0 24px; color: #777; font-size: 15px; line-height: 1.5;">
                You requested a password reset for your {app_name} account. Click the button below to set a new password.
              </p>
              <p style="margin: 0 0 24px;">
                <a href="{reset_link}" style="display: inline-block; padding: 12px 24px; background-color: #5a9a5a; color: #fff; text-decoration: none; border-radius: 10px; font-weight: 600;">Reset password</a>
              </p>
              <p style="margin: 0; font-size: 13px; color: #777;">
                If you didn't request this, you can ignore this email. This link expires in 1 hour.
              </p>
              <p style="margin: 16px 0 0; font-size: 12px; color: #999;">
                Or copy this link: <br/><a href="{reset_link}" style="color: #5a9a5a; word-break: break-all;">{reset_link}</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""


def render_monthly_summary_html(
    user_email: str,
    month_name: str,
    total_income: float,
    total_expenses: float,
    net_balance: float,
    income_change: Optional[float],
    expenses_change: Optional[float],
    balance_change: Optional[float],
    category_rows: list,
    app_name: str = "Paisatracker",
) -> str:
    def _fmt(v):
        if v is None:
            return "—"
        return f"{v:+.1f}%" if v != 0 else "0%"

    def _money(v):
        return f"${abs(v):,.2f}" if v != 0 else "$0.00"

    rows = "".join(
        f'<tr><td style="padding:8px 12px; border-bottom:1px solid #eee;">{c["category"]}</td><td style="padding:8px 12px; border-bottom:1px solid #eee; text-align:right;">{_money(c["totalAmount"])}</td></tr>'
        for c in category_rows
    )
    return f"""
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Monthly summary – {app_name}</title>
</head>
<body style="margin:0; padding:0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f0f2f5;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #f0f2f5;">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" style="max-width: 560px; background: #fff; border-radius: 10px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding: 32px;">
              <h1 style="margin: 0 0 4px; font-size: 1.5rem; color: #333;">{app_name}</h1>
              <p style="margin: 0 0 24px; color: #777; font-size: 14px;">Monthly summary for {month_name}</p>

              <table role="presentation" width="100%" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td style="padding: 12px 16px; background: #e8f5e9; border-radius: 8px; margin-bottom: 8px;">
                    <span style="color: #333; font-weight: 600;">Income</span>
                    <span style="float: right; color: #2e7d32; font-weight: 700;">{_money(total_income)}</span>
                    <br/><span style="font-size: 12px; color: #777;">vs last month: {_fmt(income_change)}</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background: #ffebee; border-radius: 8px;">
                    <span style="color: #333; font-weight: 600;">Expenses</span>
                    <span style="float: right; color: #c62828; font-weight: 700;">{_money(total_expenses)}</span>
                    <br/><span style="font-size: 12px; color: #777;">vs last month: {_fmt(expenses_change)}</span>
                  </td>
                </tr>
                <tr><td style="height: 8px;"></td></tr>
                <tr>
                  <td style="padding: 12px 16px; background: #f5deb3; border-radius: 8px;">
                    <span style="color: #333; font-weight: 600;">Net balance</span>
                    <span style="float: right; font-weight: 700; color: #333;">{_money(net_balance)}</span>
                    <br/><span style="font-size: 12px; color: #777;">vs last month: {_fmt(balance_change)}</span>
                  </td>
                </tr>
              </table>

              <h2 style="margin: 0 0 12px; font-size: 1.1rem; color: #333;">Spending by category</h2>
              <table role="presentation" width="100%" cellspacing="0" style="border: 1px solid #eee; border-radius: 8px;">
                <thead>
                  <tr style="background: #f5f5f5;">
                    <th style="padding: 10px 12px; text-align: left;">Category</th>
                    <th style="padding: 10px 12px; text-align: right;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {rows if rows else '<tr><td colspan="2" style="padding:12px; color:#777;">No data this month.</td></tr>'}
                </tbody>
              </table>

              <p style="margin: 24px 0 0; font-size: 12px; color: #999;">You received this email because you use {app_name}. Log in to see more.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
"""
