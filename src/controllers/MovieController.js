const _ = require('lodash')
const config = require('../config')
const mockMovies = require('../mocks/movies')

const lowerCaseKeys = object => {
  if (!object) {
    return
  }
  if (object instanceof Array) {
    return object.map(lowerCaseKeys)
  }
  return _(object)
    .mapKeys((value, key) => key.toLowerCase())
    .mapValues(value => value instanceof Array ? lowerCaseKeys(value) : value)
    .value()
}

module.exports = {
  async search(req, res) {
    if (config.omdbapi.secretKey == null) {
      return res.send(mockMovies);
    }

    try {
      const response = await fetch(`http://www.omdbapi.com/?s=${req.query.title}&plot=full&apikey=${config.omdbapi.secretKey}`)
      const data = await response.json()
      const body = lowerCaseKeys(data)
      if (!body || !body.search || body.error) {
        return res.status(404).send({
          error: body.error || 'No results'
        })
      }

      const movieDetails = body.search.map(async (movie, index) => {
        if (index > config.omdbapi.maxCalls) {
          return movie
        }
        const detailResponse = await fetch(`http://www.omdbapi.com/?i=${movie.imdbid}&plot=full&apikey=${config.omdbapi.secretKey}`)
        return await detailResponse.json()
      })

      res.send(await Promise.all(movieDetails))

    } catch (error) {
      return res.status(400).send({ error })
    }
  }
}