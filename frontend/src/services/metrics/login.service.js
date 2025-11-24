import axios from "axios";

const API_URL = "http://localhost:8080/login";

export async function login(email, password) {
  try {
    const response = await axios.post(API_URL, { email, password });

    // O backend retorna { token, type, expiresIn }
    const token = response.data?.token;

    if (!token) {
      throw new Error("Token não recebido do backend.");
    }

    // Salva o token completo
    localStorage.setItem("token", token);

    // Decodifica o JWT (tratamento seguro)
    let payload = null;
    try {
      const base64Payload = token.split(".")[1];
      const decodedPayload = atob(base64Payload);
      payload = JSON.parse(decodedPayload);

      // Se o backend embedding um objeto serializado dentro de uma chave (ex.: UserDetails as string), parseia
      if (payload && typeof payload.UserDetails === "string") {
        try {
          payload.UserDetails = JSON.parse(payload.UserDetails);
        } catch (e) {
          // se não conseguir parsear, deixa como está
          console.warn("UserDetails não pôde ser parseado como JSON", e);
        }
      }

      // Normaliza campos úteis para facilitar acesso no frontend
      if (payload) {
        payload.email = payload.email || (payload.UserDetails && payload.UserDetails.email) || payload.sub || null;
        payload.name = payload.name || (payload.UserDetails && (payload.UserDetails.name || payload.UserDetails.email)) || null;
      }

      // Salva o payload decodificado para uso no frontend (nome, email, papel, etc.)
      try {
        localStorage.setItem("userPayload", JSON.stringify(payload));
      } catch (e) {
        console.error("Erro ao salvar payload no localStorage", e);
      }
    } catch (error) {
      console.error("Erro ao decodificar JWT", error);
    }

    return {
      token,
      payload,
    };

  } catch (error) {
    console.error("Erro no login:", error);
    throw error;
  }
}

export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("userPayload");
}
