const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the 'graphic' directory
app.use(express.static(path.join(__dirname, 'graphic')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'graphic/login.html'));
});


//in khat bashe age niaz shod!
// app.get('/signup', (req, res) => {
//     res.sendFile(path.join(__dirname, 'graphic/signup.html'));
// });

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
