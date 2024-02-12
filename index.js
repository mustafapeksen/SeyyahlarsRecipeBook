import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
const port = 3000;
const yourApiKey = "446292e35a2a4502a59090512b1a7597"
const config = {
    headers: {
        'Content-Type': 'application/json',
        'x-api-key': yourApiKey
    }
};
var query = "";
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
    try {
        const response = await axios.get("https://api.spoonacular.com/recipes/random", config);
        const result = response.data.recipes[0];
        const mealName = result.title;
        const mealImg = result.image;
        const mealSummary = result.summary;
        const mealInstructions = result.instructions;
        res.render("random.ejs", { name: mealName, image: mealImg, summary: mealSummary, instructions: mealInstructions });
    } catch (error) {
        console.error("Error during update:", error);
    }
});

app.post("/search", async (req, res) => {
    try {
        query = req.body.query;
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}`, config);
        const result = response.data.results;
        const mealName = result.title;
        const mealImg = result.image;
        const numberOfPage = Math.ceil(response.data.totalResults / 10);
        res.render("search.ejs", { name: mealName, image: mealImg, meals: result, search: req.body.query, numberOfPages: numberOfPage });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }

});

app.get("/search/page-:page", async (req, res) => {
    try {
        const page = parseInt(req.params.page); // Hangi sayfa olduğunu al
        const numberPerPage = 10; // Her sayfada kaç tarifin gösterileceği
        const offset = (page - 1) * numberPerPage; // Offset değerini hesapla
        // Mevcut sorguya göre offset ve sayfa numarasına göre istek yapılacak
        const response = await axios.get(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&offset=${offset}`, config);
        const result = response.data.results;
        const mealName = result.title;
        const mealImg = result.image;
        const numberOfPage = Math.ceil(response.data.totalResults / numberPerPage);
        res.render("search.ejs", { name: mealName, image: mealImg, meals: result, search: req.query.query, numberOfPages: numberOfPage });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }
});

app.get("/getRecipe/:id", async (req, res) => {
    const recipeId = req.params.id;
    try {
        const response = await axios.get(`https://api.spoonacular.com/recipes/${recipeId}/information?includeNutrition=false`, config);
        const result = response.data;
        const mealName = result.title;
        const mealImg = result.image;
        const mealSummary = result.summary;
        const mealInstructions = result.instructions;
        res.render('recipeDetail.ejs', { name: mealName, image: mealImg, summary: mealSummary, instructions: mealInstructions });
    } catch (error) {
        console.error('Error fetching recipe:', error);
        res.status(500).send('Error fetching recipe');
    }
});

app.get("/about", (req, res) => {
    res.render("about.ejs");
});

app.get("/contact", (req, res) => {
    res.render("contact.ejs");
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});