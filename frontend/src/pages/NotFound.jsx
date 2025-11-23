export default function NotFound() {
  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "20px",
      }}
    >
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: "900",
          color: "#000",
          marginBottom: "10px",
        }}
      >
        404
      </h1>

      <h2 style={{ fontSize: "2rem", marginBottom: "10px" }}>
        Página não encontrada
      </h2>

      <p style={{ fontSize: "1.1rem", opacity: 0.8 }}>
        A página que você tentou acessar precisa estar logado.
      </p>
    </div>
  );
}
