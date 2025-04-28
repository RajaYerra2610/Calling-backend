const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000; // You can change the port if needed

// Enable CORS
app.use(cors());

const data = [
    {
        container: "container container1",
        iconUrl: "https://assets.ccbp.in/frontend/react-js/primary-icon-img.png",
        paragraph: "information message",
    },
    {
        container: "container container2",
        iconUrl: "https://assets.ccbp.in/frontend/react-js/success-icon-img.png",
        paragraph: "success message",
    },
    {
        container: "container container3",
        iconUrl: "https://assets.ccbp.in/frontend/react-js/warning-icon-img.png",
        paragraph: "warning message",
    },
    {
        container: "container container4",
        iconUrl: "https://assets.ccbp.in/frontend/react-js/danger-icon-img.png",
        paragraph: "error message",
    }
];

// Create a GET route
app.get('/data', (req, res) => {
    res.json(data); // Send the data as JSON
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
