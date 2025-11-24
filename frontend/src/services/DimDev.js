import api from "./axios";

export class DimDev {

    static async getDimDev() {
        try {
            const response = await api.get(`${process.env.REACT_APP_API_URL}/dim-dev`);
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