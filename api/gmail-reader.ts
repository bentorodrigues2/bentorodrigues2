import { getGmailClient, listUnreadEmails, getEmailContent } from "./emailRouter";

export default async function handler(req, res) {
  try {
    const gmail = await getGmailClient();
    const mensagens = await listUnreadEmails(gmail);

    const detalhes = [];

    for (const msg of mensagens) {
      const conteudo = await getEmailContent(gmail, msg.id);
      detalhes.push(conteudo);
    }

    return res.status(200).json({
      sucesso: true,
      mensagens: detalhes,
    });

  } catch (erro) {
    console.error("Erro ao ler emails:", erro);
    return res.status(500).json({ erro: "Erro interno ao ler emails" });
  }
}
