import axios from "axios";

export async function encaminharEmailParaAutoresponder(
  remetenteEmail: string,
  destinatarioEmail: string,
  assunto: string,
  corpoTexto: string,
  anexos: any[]
) {
  try {
    const resposta = await axios.post(
      "https://bentorodrigues2.vercel.app/api/autoresponder",
      {
        remetenteEmail,
        destinatarioEmail,
        assunto,
        corpoTexto,
        anexos,
      }
    );

    return resposta.data;
  } catch (erro) {
    console.error("Erro ao encaminhar para autoresponder:", erro);
    throw erro;
  }
}

