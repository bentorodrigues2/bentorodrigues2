import axios from 'axios';

export async function encaminharEmailParaAutoresponder(
  remetenteEmail: string,
  destinatarioEmail: string,
  assunto: string,
  corpoTexto: string,
  anexos: any[]
) {
  try {
    const payload = {
      remetenteEmail,
      destinatarioEmail,
      assunto,
      corpoTexto,
      anexos
    };

    const response = await axios.post(
      \\/api/processar-email-anexos\,
      payload,
      { timeout: 20000 }
    );

    return response.data;
  } catch (error: any) {
    console.error("Erro ao encaminhar para autoresponder:", error.message);
    throw new Error(error.message);
  }
}
