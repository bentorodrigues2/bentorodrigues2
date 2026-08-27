import { google } from "googleapis";

export async function getGmailClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GMAIL_CLIENT_EMAIL,
      private_key: process.env.GMAIL_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/gmail.readonly"],
  });

  return google.gmail({ version: "v1", auth });
}

export async function listUnreadEmails(gmail) {
  const res = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread",
  });

  return res.data.messages || [];
}

export async function getEmailContent(gmail, messageId) {
  const res = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
  });

  return res.data;
}

