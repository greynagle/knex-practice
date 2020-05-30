const shoppingList = require("../src/shopping-list");
const knex = require("knex");

describe(`shoppinglist object`, function () {
    let db;

    let testItems = [
        {
            id: 1,
            name: "First",
            price: "2.10",
            date_added: new Date("2029-01-22T16:28:32.615Z"),
            checked: false,
            category: "Lunch",
        },
        {
            id: 2,
            name: "Second",
            price: "2.11",
            date_added: new Date("2100-05-22T16:28:32.615Z"),
            checked: true,
            category: "Snack",
        },
        {
            id: 3,
            name: "Third",
            price: "2.12",
            date_added: new Date("1919-12-22T16:28:32.615Z"),
            checked: true,
            category: "Main",
        },
    ];

    before(() => {
        db = knex({
            client: "pg",
            connection: process.env.DB_URL,
        });
    });

    before(() => db("shopping_list").truncate());

    afterEach(() => db("shopping_list").truncate());

    after(() => db.destroy());

    context(`Given 'shopping_list' has data`, () => {
        beforeEach(() => {
            return db.into("shopping_list").insert(testItems);
        });

        it(`getAllItems() resolves all articles from 'shopping_list' table`, () => {
            return shoppingList.getAllItems(db).then((actual) => {
                expect(actual).to.eql(testItems);
            });
        });

        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
            const thirdId = 3;
            const thirdTestItem = testItems[thirdId - 1];
            return shoppingList.getById(db, thirdId).then((actual) => {
                expect(actual).to.eql({
                    id: thirdId,
                    name: thirdTestItem.name,
                    price: thirdTestItem.price,
                    date_added: thirdTestItem.date_added,
					checked: thirdTestItem.checked,
					category:thirdTestItem.category
                });
            });
        });

        it(`deleteItem() removes an item by id from 'shopping_list' table`, () => {
            const itemId = 123;
            return shoppingList
                .deleteItem(db, itemId)
                .then(() => shoppingList.getAllItems(db))
                .then((allItems) => {
                    // copy the test articles array without the "deleted" item
                    const expected = testItems.filter(
                        (item) => item.id !== itemId
                    );
                    expect(allItems).to.eql(expected);
                });
        });

        it(`updateItem() updates an item from the 'shopping_list' table`, () => {
            const idOfItemToUpdate = 1;
            const newItemData = {
                name: "eighth",
                price: "3.10",
                date_added: new Date("2009-01-22T16:28:32.615Z"),
                checked: true,
                category: "Breakfast",
            };
            return shoppingList
                .updateItem(db, idOfItemToUpdate, newItemData)
                .then(() => shoppingList.getById(db, idOfItemToUpdate))
                .then((item) => {
                    expect(item).to.eql({
                        id: idOfItemToUpdate,
                        ...newItemData,
                    });
                });
        });
    });

    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllItems() resolves an empty array`, () => {
            return shoppingList.getAllItems(db).then((actual) => {
                expect(actual).to.eql([]);
            });
        });
    });

    it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
        const newItem = {
            name: "eighth",
            price: "3.10",
            date_added: new Date("2009-01-22T16:28:32.615Z"),
            checked: true,
            category: "Breakfast",
        };
        return shoppingList.insertItem(db, newItem).then((actual) => {
            expect(actual).to.eql({
                id: 1,
                name: newItem.name,
                price: newItem.price,
                date_added: newItem.date_added,
                checked: newItem.checked,
                category: newItem.category,
            });
        });
    });
});
