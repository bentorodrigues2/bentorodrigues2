import { google } from "googleapis";

export async function getGmailClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  const gmail = google.gmail({ version: "v1", auth });
  return gmail;
}

export async function listUnreadEmails(gmail: any) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
  });

  return res.data.messages || [];
}

export async function getEmailContent(gmail: any, messageId: string) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  return res.data;
}
