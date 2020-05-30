require("dotenv").config();
const knex = require("knex");

const knexInstance = knex({
    client: "pg",
    connection: process.env.DB_URL,
});

console.log("knex and driver installed correctly");

function searchTerm(query) {
    knexInstance
        .select("*")
        .from("shopping_list")
        .where("name", "ILIKE", `%${query}%`)
        .then((result) => {
            console.log(result);
        });
}
searchTerm("li");

function paginate(page) {
    const productsPerPage = 6;
    const offset = productsPerPage * (page - 1);
    knexInstance
        .select("*")
        .from("shopping_list")
        .limit(productsPerPage)
        .offset(offset)
        .then((result) => {
            console.log(result);
        });
}
paginate(2);

function postDate(daysAgo) {
    knexInstance
        .select("name", "price", "category")
        .count("date_added")
        .where(
            "date_added",
            ">",
            knexInstance.raw(`now() - '?? days'::INTERVAL`, daysAgo)
        )
        .from("shopping_list")
        .groupBy("name", "price", "category")
        .then((result) => {
            console.log(result);
        });
}
postDate(30);

function costTotal() {
    knexInstance
        .select("category")
        .sum("price as total")
        .from("shopping_list")
        .groupBy("category")
        .then((result) => {
            console.log(result);
        });
}
costTotal()
