const express = require("express");
const jwt = require("jsonwebtoken");

const app = express();
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || "clave_de_prueba";

// Usuarios hardcodeados
const users = [
    { id: 1, username: "test", password: "1234" },
    { id: 2, username: "admin", password: "admin" },
];

app.get("/", (req, res) => {
    res.send("¡Servidor funcionando!");
});

// Ruta de login
app.post("/login", (req, res) => {
    const { username, password } = req.body;
    const user = users.find(
        (u) => u.username === username && u.password === password
    );
    if (!user) return res.status(401).json({ error: "Credenciales inválidas" });

    const token = jwt.sign({ sub: user.id, username }, JWT_SECRET, {
        expiresIn: "1h",
    });
    res.json({ token });
});

// Ruta protegida
app.get("/protected", (req, res) => {
    const auth = req.headers.authorization || "";
    const match = auth.match(/^Bearer (.+)$/);
    if (!match) return res.status(401).json({ error: "Falta token" });

    try {
        const decoded = jwt.verify(match[1], JWT_SECRET);
        res.json({ message: "Acceso autorizado", user: decoded });
    } catch (err) {
        res.status(401).json({ error: "Token inválido" });
    }
});

// Exporta para Vercel
module.exports = app;

// Solo arranca en local si se ejecuta directamente
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () =>
        console.log(`Servidor corriendo en http://localhost:${PORT}`)
    );
}
