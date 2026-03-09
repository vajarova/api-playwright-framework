import { test, expect } from '@playwright/test';

let accessToken: string;
test.beforeAll('run before all', async ({ request }) => {
    // Do a POST request to get Token
  const tokenResponse = await request.post("https://conduit-api.bondaracademy.com/api/users/login",
    { data: { "user": { "email": "nv4test@test.com", "password": "1q2w3e4r5t6y7u8" } } }
  )
  const responseJson = await tokenResponse.json()
  const savedToken = await responseJson.user.token
  accessToken = `Token ${savedToken}`

  console.log(accessToken)
})

test('GET: has title', async ({ request }) => {
  const tagsResponse = await request.get("https://conduit-api.bondaracademy.com/api/tags")
  const tangsResponseJson = await tagsResponse.json()
  expect(tagsResponse.status()).toEqual(200)
  expect(tangsResponseJson.tags[0]).toEqual("Test")
  expect(tangsResponseJson.tags.length).toBeLessThanOrEqual(10)
  console.log(tangsResponseJson)
});

test("GET: has articles", async ({ request }) => {
  const articleResponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0")
  const articlesJson = await articleResponse.json()
  expect(articleResponse.status()).toEqual(200)
  expect(articlesJson.articlesCount).toEqual(10)
  // expect(articlesJson.articles.length).toBeLessThanOrEqual(21)
})

test("POST: create and delete article", async ({ request }) => {
  // Do a POST request to add new
  const newArticleResponse = await request.post("https://conduit-api.bondaracademy.com/api/articles/",
    {
      data: {
        "article": {
          "title": "post a new article",
          "description": "yoo back at ya",
          "body": "something in here",
          "tagList": []
        }
      },
      headers: { Authorization: accessToken }
    }
  )

  const newArticleResponseJson = await newArticleResponse.json()
  expect(newArticleResponse.status()).toEqual(201)
  console.log(newArticleResponseJson)
  const newArticleResponseSlug = await newArticleResponseJson.article.slug
  expect(newArticleResponseJson.article.title).toEqual("post a new article")

  //Do a GET as an assertion after a POST
  const articleReponse = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",
    {
      headers: {
        Authorization: accessToken
      }
    }
  )
  const updateArticleResponseJson = await articleReponse.json()


  expect(updateArticleResponseJson.articles[0].title).toEqual("post a new article")

  //Do a DELETE request after validation
  const deleteNewArticle = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${newArticleResponseSlug}`,
    { headers: { Authorization: accessToken } }
  )
  expect(deleteNewArticle.status()).toEqual(204)

  //Do a GET as an assertion after a DELETE
  const articleReponseAfterDelete = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0",
    {
      headers: {
        Authorization: accessToken
      }
    }
  )
  expect(articleReponseAfterDelete.status()).toEqual(200)
  const deletedArticleResponseJson = await articleReponseAfterDelete.json()
  console.log(deletedArticleResponseJson)
  expect(deletedArticleResponseJson.articlesCount).toEqual(10)
  expect(deletedArticleResponseJson.articles[0].title).not.toEqual("post a new article")


})

test("PUT modify an article", async ({ request }) => {
  //Create article - POST article
  const postArticleRequest = await request.post("https://conduit-api.bondaracademy.com/api/articles/", {
    data: {
      "article": {
        "title": "new article to modify",
        "description": "yoo",
        "body": "something in here",
        "tagList": []
      }
    },
    headers: { Authorization: accessToken }
  })

  expect(postArticleRequest.status()).toEqual(201)

  const postArticleRequestJson = await postArticleRequest.json()
  const articleSlugId = postArticleRequestJson.article.slug

  //Amend article - PUT edit article
  const putArticleRequest = await request.put(`https://conduit-api.bondaracademy.com/api/articles/${articleSlugId}`, {
    data: {
      "article": {
        "title": "modified article",
        "description": "modified via put request",
        "body": "something new in here",
        "tagList": []
      }
    },
    headers: { Authorization: accessToken }
  })

  const putArticleJson = await putArticleRequest.json()

  const getArticlesAssertionRequest = await request.get("https://conduit-api.bondaracademy.com/api/articles?limit=10&offset=0", {
    headers: { Authorization: accessToken }
  })
  const getArticlesAssertionJson = await getArticlesAssertionRequest.json()
  const updatedSlugID = putArticleJson.article.slug
  expect(putArticleRequest.status()).toEqual(200)
  expect(getArticlesAssertionJson.articles[0].title).toEqual("modified article")

  const deleteArticleRequest = await request.delete(`https://conduit-api.bondaracademy.com/api/articles/${updatedSlugID}`, {
    headers: { Authorization: accessToken }
  })

  expect(deleteArticleRequest.status()).toEqual(204)

})