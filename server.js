const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração para servir arquivos estáticos
app.use(express.static('pages'));

// Middleware para logging (útil para debug)
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Rota dinâmica para renderizar páginas HTML
app.get('/:pageName', (req, res) => {
    try {
        const pageName = req.params.pageName;
        
        // Validação básica de segurança
        if (!pageName || pageName.includes('..')) {
            return res.status(400).send('Nome de página inválido');
        }
        
        const filePath = path.join(__dirname, 'pages', `${pageName}.html`);
        
        // Verifica se o arquivo existe
        if (fs.existsSync(filePath)) {
            res.sendFile(filePath);
        } else {
            res.status(404).send('Página não encontrada');
        }
    } catch (error) {
        console.error('Erro ao servir página:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota raiz
app.get('/', (req, res) => {
    try {
        const defaultPage = path.join(__dirname, 'pages', 'index.html');
        
        if (fs.existsSync(defaultPage)) {
            res.sendFile(defaultPage);
        } else {
            res.json({
                message: 'Servidor funcionando!',
                usage: 'Acesse /nomeDaPagina para ver uma página específica',
                example: '/constrular'
            });
        }
    } catch (error) {
        console.error('Erro na rota raiz:', error);
        res.status(500).send('Erro interno do servidor');
    }
});

// Rota de health check para a Vercel
app.get('/api/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Handler de erro global
app.use((error, req, res, next) => {
    console.error('Erro não tratado:', error);
    res.status(500).json({ 
        error: 'Internal Server Error',
        message: 'Algo deu errado no servidor'
    });
});

// 404 handler para rotas não encontradas
app.use('*', (req, res) => {
    res.status(404).send('Página não encontrada');
});

// Inicia o servidor apenas se não for um ambiente serverless
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });
}

// Exporta o app para a Vercel
module.exports = app;
