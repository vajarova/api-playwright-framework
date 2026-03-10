import { test } from '../utils/fixtures';
import { expect } from '../utils/custome-expect'
import { createToken } from '../helpers/createToken';
import articlePostRequestPayload from '../request-objects/POST-article.json'


test('Get articles', async ({ api }) => {
  const response = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200)
  expect(response.articlesCount).not.shouldEqual(9)
})

test('Get tags', async ({ api }) => {
  const response = await api
    .path('/tags')
    .getRequest(200)

  expect(response.tags[0]).shouldEqual('Test')
})

test('Create and delete article', async ({ api }) => {
  articlePostRequestPayload.article.title = 'post a new article'
  const createArticleResponse = await api
    .path('/articles')
    .body(articlePostRequestPayload)
    .postRequest(201)

  expect(createArticleResponse.article.title).shouldEqual('post a new article')
  const articleSlugId = createArticleResponse.article.slug

  const articlesResponse = await api
    .path("/articles")
    .params({ limit: 10, offset: 0 })
    .getRequest(200)

  expect(articlesResponse.articles[0].title).shouldEqual("post a new article")

  const deleteArticleResponse = await api
    .path(`/articles/${articleSlugId}`)
    .deleteRequest(204)
})

