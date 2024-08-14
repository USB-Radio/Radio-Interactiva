class Fetch {
  static async getAll(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(
          "⚠️ Ha habido un Error en la solicitud: " + response.statusText
        );
      }
      console.log("-✅--[Solicitud realizada a AzuraCast]--✅-");
      return await response.json();
    } catch (e) {
      console.error("Error --> ", e);
      throw e; // Propaga el error para que pueda ser manejado en el componente.
    }
  }
}

export default Fetch;
