const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// CONFIGURACIÓN DE POSTGRESQL (AIVEN)
const pool = new Pool({
    connectionString: connectionString: "postgres://avnadmin:AVNS_qu9eiPfGxMaHrnVcHF5@pg-3d0f9aae-inversionbch.i.aivencloud.com:22502/defaultdb",,
    ssl: {
        rejectUnauthorized: false
    }
});

// Crear la tabla automáticamente si no existe (Prueba inicial)
const initDb = async () => {
    const queryText = `
    CREATE TABLE IF NOT EXISTS clientes_prueba (
        id SERIAL PRIMARY KEY,
        nombre_usuario VARCHAR(50) NOT NULL,
        billetera_bch VARCHAR(255) NOT NULL,
        monto_invertido_bch DECIMAL(18, 8) DEFAULT 0,
        tokens_emitidos INT DEFAULT 0,
        fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        estado_pago VARCHAR(20) DEFAULT 'pendiente'
    );`;
    await pool.query(queryText);
};
initDb().then(() => console.log("Tabla lista")).catch(err => console.log(err));

app.get('/api/clientes', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM clientes_prueba');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/nueva-compra', async (req, res) => {
    const { nombre_usuario, billetera_bch } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO clientes_prueba (nombre_usuario, billetera_bch, estado_pago) VALUES ($1, $2, $3) RETURNING *',
            [nombre_usuario, billetera_bch, 'pendiente']
        );
        res.json({ mensaje: "Cliente registrado", cliente: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/', (req, res) => res.send('Servidor Inversión BCH funcionando con PostgreSQL'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Puerto: ${PORT}`));
