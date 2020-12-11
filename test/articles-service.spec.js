const ArticlesService = require('../src/articles-service')
const knex = require('knex')

describe(`Articles service object`, function() {
    let db
    let testArticles = [
        {
            id: 1,
            date_published: new Date('2029-01-22T16:28:32.615Z'),
            title: 'First test post!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?'
        },
        {
            id: 2,
            date_published: new Date('2100-05-22T16:28:32.615Z'),
            title: 'Second test post!',
            content: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Cum, exercitationem cupiditate dignissimos est perspiciatis, nobis commodi alias saepe atque facilis labore sequi deleniti. Sint, adipisci facere! Velit temporibus debitis rerum.'
        },
        {
            id: 3,
            date_published: new Date('2100-05-22T16:28:32.615Z'),
            title: 'Third test post!',
            content: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Possimus, voluptate? Necessitatibus, reiciendis? Cupiditate totam laborum esse animi ratione ipsa dignissimos laboriosam eos similique cumque. Est nostrum esse porro id quaerat.'
        }
    ]

    before(() => { db = knex({
        client: 'pg',
        connection: process.env.TEST_DB_URL,
        })
    })

    before(() => db('blogful_articles').truncate())
    afterEach(() => db('blogful_articles').truncate())
    after(() => db.destroy())

    context(`Given 'blogful_articles' has data`, () => {
        beforeEach (() => {
            return db
               .into('blogful_articles')
               .insert(testArticles)
        })

        it(`getAllArticles() resolves all articles from 'blogful_articles' table`, () => {
            return ArticlesService.getAllArticles(db)
            .then(actual => {
                expect(actual).to.eql(testArticles)
            })
        })
    })

    context(`Given 'blogful_articles' has no data`, () => {
        it(`getAllArticles() resolves an empty array`, () => {
            return ArticlesService.getAllArticles(db)
            .then(actual => {
              expect(actual).to.eql([])
            })
        })
    })

    it(`insertArticle() inserts a new article and resolves the new article with an 'id'`, () => {
        const newArticle = {
            title: 'Test new title',
            content: 'Test new content',
            date_published: new Date('2020-01-01T00:00:00.000Z'),
        }
        return ArticlesService.insertArticle(db, newArticle)
            .then(actual => {
                expect(actual).to.eql({
                    id: 1,
                    title: newArticle.title,
                    content: newArticle.content,
                    date_published: newArticle.date_published,
                })
            })
    })

    describe('getById()', () => {
        it('should return undefined', () => {
          return ArticlesService
            .getById(db, 999)
            .then(article => expect(article).to.be.undefined);
        });
    
        context('with data present', () => {
          before('insert articles', () => 
            db('blogful_articles')
              .insert(testArticles)
          );
    
          it('should return existing article', () => {
            const expectedArticleId = 3;
            const expectedArticle = testArticles.find(a => a.id === expectedArticleId);
            return ArticlesService.getById(db, expectedArticleId)
              .then(actual => expect(actual).to.eql(expectedArticle));
          });
        });
      });
    

      describe('deleteArticle()', () => {
        it('should return 0 rows affected', () => {
          return ArticlesService
            .deleteArticle(db, 999)
            .then(rowsAffected => expect(rowsAffected).to.eq(0));
        });
    
        context('with data present', () => {
          before('insert articles', () => 
            db('blogful_articles')
              .insert(testArticles)
          );
    
          it('should return 1 row affected and record is removed from db', () => {
            const deletedArticleId = 1;
    
            return ArticlesService
              .deleteArticle(db, deletedArticleId)
              .then(rowsAffected => {
                expect(rowsAffected).to.eq(1);
                return db('blogful_articles').select('*');
              })
              .then(actual => {
                // copy testArticles array with id 1 filtered out
                const expected = testArticles.filter(a => a.id !== deletedArticleId);
                expect(actual).to.eql(expected);
              });
          });
        });
    });

    describe('updateArticle()', () => {
        it('should return 0 rows affected', () => {
          return ArticlesService
            .updateArticle(db, 999, { title: 'new title!' })
            .then(rowsAffected => expect(rowsAffected).to.eq(0));
        });
    
        context('with data present', () => {
          before('insert articles', () => 
            db('blogful_articles')
              .insert(testArticles)
          );
    
          it('should successfully update an article', () => {
            const updatedArticleId = 1;
            const testArticle = testArticles.find(a => a.id === updatedArticleId);
            // make copy of testArticle in db, overwriting with newly updated field value
            const updatedArticle = { ...testArticle, title: 'New title!' };
    
            return ArticlesService
              .updateArticle(db, updatedArticleId, updatedArticle)
              .then(rowsAffected => {
                expect(rowsAffected).to.eq(1)
                return db('blogful_articles').select('*').where({ id: updatedArticleId }).first();
              })
              .then(article => {
                expect(article).to.eql(updatedArticle);
              });
          });
        });
      });

})


/*here may be issues here due to timezones, daylight savings time, etc... 
If you're having issues with the dates being slightly different, 
change the endpoint handler to run each article's date_published 
through a new Date constructor:*/

//   it(`resolves all articles from 'blogful_articles' table`, () => {
//     return ArticlesService.getAllArticles(db)
//       .then(actual => {
//          expect(actual).to.eql(testArticles)
//          expect(actual).to.eql(testArticles.map(article => ({
//            ...article,
//            date_published: new Date(article.date_published)
//          })))
//       })
//   })