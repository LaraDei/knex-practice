const ShoppingListService = require('../src/shopping-list-service')
const knex = require('knex')

describe(`items service object`, function() {
    let db
    let testitems = [
        {
            id: 1,
            name: 'first name',
            date_added: new Date('2029-01-22T16:28:32.615Z'),
            price: '1.00',
            category: 'Main'
        },
        {
            id: 2,
            name: 'second name',
            date_added: new Date('2100-05-22T16:28:32.615Z'),
            price: '12.00',
            category: 'Snack'
        },
        {
            id: 3,
            name: 'third name',
            date_added: new Date('2100-12-22T16:28:32.615Z'),
            price: '13.00',
            category: 'Lunch'
        },
        {
          id: 4,
          name: 'fourth name',
          date_added: new Date('2100-014-22T16:28:32.615Z'),
          price: '17.00',
          category: 'Breakfast'
      }
    ]

    before(() => { db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('shopping_list').truncate())
    afterEach(() => db('shopping_list').truncate())
    after(() => db.destroy())

    context(`Given 'shopping_list' has data`, () => {
        beforeEach (() => {
            return db
               .into('shopping_list')
               .insert(testitems)
        })

        it(`getListItems() resolves all articles from 'shopping_list' table`, () => {
          const expectedItems = testItems.map(item => ({
            ...item,
            checked: false,
          }));
          return ShoppingListService.getAllItems(db)
            .then(actual => {
              expect(actual).to.eql(expectedItems);
            });
        });
      })

        it(`getById() resolves an item by id from 'shopping_list' table`, () => {
          const idToGet = 3;
          const thirdItem = testItems[idToGet - 1];
          return ShoppingListService.getById(db, idToGet)
            .then(actual => {
              expect(actual).to.eql({
                id: idToGet,
                name: thirdItem.name,
                date_added: thirdItem.date_added,
                price: thirdItem.price,
                category: thirdItem.category,
                checked: false,
              });
        });
    });
    
    
  describe('deleteArticle()', () => {
      it('should return 0 rows affected', () => {
        return ShoppingListService
          .deleteArticle(db, 999)
          .then(rowsAffected => expect(rowsAffected).to.eq(0));
      });
  
      context('with data present', () => {
        before('insert articles', () => 
          db('shopping_list')
            .insert(testitems)
        );
  
        it('should return 1 row affected and record is removed from db', () => {
          const deletedItemId = 1;
  
          return ShoppingListService
            .deleteArticle(db, deletedItemId)
            .then(rowsAffected => {
              expect(rowsAffected).to.eq(1);
              return db('shopping_list').select('*');
            })
            .then(actual => {
              // copy testArticles array with id 1 filtered out
              const expected = testitems.filter(a => a.id !== deletedItemId);
              expect(actual).to.eql(expected);
            });
        });
      });
  });

  describe('updateItem()', () => {
    it('should return 0 rows affected', () => {
      return ShoppingListService
        .updateArticle(db, 999, { title: 'new title!' })
        .then(rowsAffected => expect(rowsAffected).to.eq(0));
    });

    context('with data present', () => {
      before('insert articles', () => 
        db('shopping_list')
          .insert(testArticles)
      );

      it('should successfully update an article', () => {
        const updatedItemId = 1;
        const testItem = testitems.find(a => a.id === updatedItemId);
        // make copy of testArticle in db, overwriting with newly updated field value
        const updatedItem = { ...testItem, name: 'New name!' };

        return ShoppingListService
          .updateArticle(db, updatedItemId, updatedItem)
          .then(rowsAffected => {
            expect(rowsAffected).to.eq(1)
            return db('shopping_list').select('*').where({ id: updatedItemId }).first();
          })
          .then(item => {
            expect(item).to.eql(updatedItem);
          });
      });
      })
    });

    context(`Given 'shopping_list' has no data`, () => {
        it(`getAllArticles() resolves an empty array`, () => {
            return ShoppingListService.getListItems(db)
            .then(actual => {
              expect(actual).to.eql([])
            })
        })

    it(`insertItem() inserts a new item and resolves the new item with an 'id'`, () => {
        const newItem = {
            name: 'Test new name',
            price: '3.00',
            date_added: new Date('2020-01-01T00:00:00.000Z'),
            checked: true,
            category: 'Lunch',
        }
        return ShoppingListService.insertItem(db, newItem)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1,
                    name: newItem.name,
                    price: newItem.price,
                    date_added: newItem.date_added,
                    checked: newItem.checked,
                    category: newItem.category,
                })
            })
        })
    })
  
})


