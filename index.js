// Importing required modules
import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

// Initializing express app
const app = express();
const port = 3000;
const yourApiKey = "446292e35a2a4502a59090512b1a7597"
const config = {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': yourApiKey
    }
};
// Variable to store search query
var query = "";

// Setting up middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Handling root route
app.get("/", async (req, res) => {
    try {
        // Fetching a random recipe from the Spoonacular API
        const response = await axios.get("https://api.spoonacular.com/recipes/random", config);
        // Assign variables to use incoming data
        const result = response.data.recipes[0];
        const mealName = result.title;
        const mealImg = result.image;
        const mealSummary = result.summary;
        const mealInstructions = result.instructions;
        // Rendering the 'random.ejs' template with recipe details
        res.render("random.ejs", { name: mealName, image: mealImg, summary: mealSummary, instructions: mealInstructions });
    } catch (error) {
        console.error("Error during update:", error);
    }
});

// Handling search route
app.post("/search", async (req, res) => {
    try {
        // Assign the search query to the variable
        query = req.body.query;
        // Fetching recipes matching the search query from the Spoonacular API
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}`, config);
        // Assign variables to use incoming data
        const result = response.data.results;
        const mealName = result.title;
        const mealImg = result.image;
        // Calculate how many pages you need
        const numberOfPage = Math.ceil(response.data.totalResults / 10);
        // Rendering the 'search.ejs' template with search results
        res.render("search.ejs", { name: mealName, image: mealImg, meals: result, search: req.body.query, numberOfPages: numberOfPage });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }
});

// Handling search pagination route
app.get("/search/page-:page", async (req, res) => {
    try {
        // Getting page number from URL
        const page = parseInt(req.params.page);
        const numberPerPage = 10;
        // Calculating offset value
        const offset = (page - 1) * numberPerPage;
        // Fetching recipes based on search query and page number
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&offset=${offset}`, config);
        // Assign variables to use incoming data
        const result = response.data.results;
        const mealName = result.title;
        const mealImg = result.image;
        // Calculate how many pages you need
        const numberOfPage = Math.ceil(response.data.totalResults / numberPerPage);
        // Rendering the 'search.ejs' template with paginated search results
        res.render("search.ejs", { name: mealName, image: mealImg, meals: result, search: req.query.query, numberOfPages: numberOfPage });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }
});

// Handling individual recipe route
app.get("/getRecipe/:id", async (req, res) => {
    // Getting recipe ID from URL
    const recipeId = req.params.id;
    try {
        // Fetching recipe details by ID from the Spoonacular API
        const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false`, config);
        // Assign variables to use incoming data
        const result = response.data;
        const mealName = result.title;
        const mealImg = result.image;
        const mealSummary = result.summary;
        const mealInstructions = result.instructions;
        // Rendering the 'recipeDetail.ejs' template with recipe details
        res.render('recipeDetail.ejs', { name: mealName, image: mealImg, summary: mealSummary, instructions: mealInstructions });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }
});

// Handling about page route
app.get("/about", (req, res) => {
    res.render("about.ejs");
});

// Handling contact page route
app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

// Listening to the port
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
