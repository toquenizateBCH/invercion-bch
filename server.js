const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE LA BASE DE DATOS
// Estos datos los actualizaremos cuando tengas los de Aiven.io
const db = mysql.createConnection({
    host: 'TU_HOST_DE_AIVEN', 
    user: 'TU_USUARIO',
    password: 'TU_PASSWORD',
    database: 'defaultdb',
    port: 25060, // Puerto estándar en Aiven
    ssl: {
        rejectUnauthorized: false // Necesario para conexiones seguras en la nube
    }
});

db.connect(err => {
    if (err) {
        console.error('Error conectando a la base de datos:', err);
        return;
    }
    console.log('Conexión exitosa a la base de datos de Inversión BCH');
});

// RUTA 1: Ver los clientes registrados (Prueba de lectura)
app.get('/api/clientes', (req, res) => {
    const sql = "SELECT * FROM clientes_prueba";
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(results);
    });
});

// RUTA 2: Registrar un nuevo cliente (Prueba de escritura)
app.post('/api/nueva-compra', (req, res) => {
    const { nombre_usuario, billetera_bch } = req.body;
    const sql = "INSERT INTO clientes_prueba (nombre_usuario, billetera_bch, estado_pago) VALUES (?, ?, 'pendiente')";
    
    db.query(sql, [nombre_usuario, billetera_bch], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ 
            mensaje: "Cliente registrado con éxito en la prueba", 
            id: result.insertId 
        });
    });
});

// RUTA 3: Mensaje de bienvenida en la raíz
app.get('/', (req, res) => {
    res.send('Servidor de Inversión BCH - Conjunto P2P funcionando correctamente.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
