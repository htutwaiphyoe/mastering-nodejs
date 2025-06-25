const express = require('express');

const { loggerMiddleware } = require('./middlewares/logger');

const bookRouter = require('./routes/book.routes');

const app = express();
const PORT = 8000;

// Middlewares (Plugins)
app.use(express.json());
app.use(loggerMiddleware);

// Routes
app.use('/books', bookRouter);

app.listen(PORT, () => console.log(`Http server is running on PORT ${PORT}`));
