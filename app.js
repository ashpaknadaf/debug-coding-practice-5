const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'moviesData.db')

const app = express()

app.use(express.json())

const db = null

const initialiseDbAndServer = async () => {
  try {
    db = await open({
      fileName: databasePath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server running at http://localhost:3000')
    })
  } catch (e) {
    console.log(`DB error: ${e.message}`)
    process.exit(1)
  }
}

initialiseDbAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}
const converDirectorObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getMovieNamesQuary = `
        SELECT
            movie_name
        FROM 
            movie
        ORDER BY 
            movie_id
    `
  const movieNamesArray = await db.all(getMovieNamesQuary)
  response.send(
    movieNamesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  )
})

module.export = app

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieQuary = `
    SELECT 
        *
    FROM 
        movie
    WHERE 
        movie_id = ${movieId}
    `
  const movieDetails = await db.get(movieQuary)
  response.send(convertDbObjectToResponseObject(movieDetails))
})

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQueary = `
        INSERT INTO
            movie(director_id	, movie_name, lead_actor)
        VALUES
        ('${directorId}', '${movieName}', '${leadActor}')
          
    `
  const movie = await db.run(postMovieQueary)
  response.send('Movie Successfully Added')
})

app.put('/movies/:movieId/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const {movieId} = request.params
  const updatedMovieQuary = ` 
        UPDATE 
            movie
        SET 
             director_id = ${directorId},
              movie_name = '${movieName}',
              lead_actor = '${leadActor}'
        WHERE movie_id = ${movieId};`

  await db.run(updatedMovieQuary)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQueary = `
        DELETE FROM 
            movie 
        WHERE 
            movie_id = '${movieId}'
          
    `
  await db.run(deleteMovieQueary)
  response.send('Movie Removed')
})

app.get('/directors/', async (request, response) => {
  const directorlistQueary = `
        SELECT *
        FROM director
        ORDER BY = director_id
    `
  const directorList = await db.all(directorlistQueary)
  response.send(
    directorList.map(eachDirector =>
      converDirectorObjectToResponseObject(eachDirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const directorMovieList = `
        SELECT movie_name
        FROM movie natural join director
        GROUP BY director_id
    
    `

  const result = await db.all(directorMovieList)
  response.send(
    directorMovieList.map(eachmovie =>
      convertDbObjectToResponseObject(eachmovie),
    ),
  )
})

module.exports = app
