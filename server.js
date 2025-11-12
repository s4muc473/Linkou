const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para servir arquivos estáticos
app.use(express.static('pages'));

// Rota raiz
app.get('/', (req, res) => {
    const defaultPage = path.join(__dirname, 'pages', 'index.html');
    
    if (fs.existsSync(defaultPage)) {
        res.sendFile(defaultPage);
    } else {
        res.send('Servidor funcionando! Acesse /nomeDaPagina para ver uma página específica');
    }
});

// Rota dinâmica para renderizar páginas HTML
app.get('/:pageName', (req, res) => {
    const pageName = req.params.pageName;
    
    // Evita conflito com favicon.ico e outros arquivos
    if (pageName.includes('.') || pageName === 'favicon.ico') {
        return res.status(404).send('Não encontrado');
    }
    
    const filePath = path.join(__dirname, 'pages', `${pageName}.html`);
    
    // Verifica se o arquivo existe
    if (fs.existsSync(filePath)) {
        res.sendFile(filePath);
    } else {
        res.status(404).send('Página não encontrada');
    }
});

// Rota 404 - DEVE SER A ÚLTIMA ROTA
app.use((req, res) => {
    res.status(404).send('Página não encontrada');
});

// Iniciar servidor
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

module.exports = app;
