import api from "./axios";

export class DimProjeto {

    static async getDimProjeto() {
        try {
            const response = await api.get("/dim-projeto");
            return {
                success: true,
                data: response.data
            };
        }
        catch (error) { 
            return {
                success: false,
                data: error
            };
         }
    }
}