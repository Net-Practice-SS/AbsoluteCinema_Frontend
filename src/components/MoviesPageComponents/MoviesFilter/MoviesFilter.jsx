import { useEffect, useState } from 'react'
import ReactSlider from 'react-slider'

import styles from './MoviesFilter.module.css'
import Button from '../../SharedComponents/Button/Button'

function MoviesFilter({ setMovies }) {
    const [genres, setGenres] = useState([])
    const [moviesFilter, setMovieFilter] = useState({
        movieName: "",
        actors: "",
        ageRestriction: false,
        releaseDateRange: [2015, 2025],
        genres: []
    })
    function findMovies() {
        fetch(`https://localhost:7118/api/Movie/GetMovieWithStrategy?Title=${moviesFilter.movieName}&Adult=${moviesFilter.ageRestriction}&ReleaseDateFrom=${moviesFilter.releaseDateRange[0] + "-01-01"}&ReleaseDateTo=${moviesFilter.releaseDateRange[1] + "-12-31"}${moviesFilter.genres.map(id => `&GenresIds=${id}`).join("")} `)
            .then(response => response.json())
            .then(data => setMovies(data))
            .catch(error => console.log(error))

    }

    useEffect(() => {
        fetch('https://localhost:7118/api/Genre/GetGenreAll')
            .then(response => response.json())
            .then(data => setGenres(data))
            .catch(err => console.log(err))
    }, []);

    function updateGenres(e, genreId) {
        if (e.target.checked) {
            if (!moviesFilter.genres.includes(genreId)) {
                setMovieFilter({ ...moviesFilter, genres: [...moviesFilter.genres, genreId] })
            }
        } else {
            if (moviesFilter.genres.includes(genreId)) {
                setMovieFilter({ ...moviesFilter, genres: moviesFilter.genres.filter(genre => genre !== genreId) })
            }

        }
    }
    console.log(moviesFilter)

    function setAgeRestriction(e) {
        console.log("age", e.target.value)
        setMovieFilter({ ...moviesFilter, ageRestriction: e.target.value })
    }


    return (
        <div className={styles.filter_container}>
            <div className={styles.filter_title}>
                Filter movies
            </div>
            <hr />
            <div className={styles.filter_genres_container}>
                <label htmlFor='movieName'> Movie name</label>
                <input name='movieName' value={moviesFilter.movieName} onChange={(e) => setMovieFilter({ ...moviesFilter, movieName: e.target.value })} />
                <div>
                    <div> Age restriction </div>
                    <label>
                        <input type='radio' name='age' value={true} onChange={setAgeRestriction} /> Yes
                    </label>
                    <label>
                        <input type='radio' name='age' value={false} onChange={setAgeRestriction} /> No
                    </label>
                </div>

                <div>
                    <div>Years</div>
                    <ReactSlider
                        className={styles.slider}
                        thumbClassName={styles.thumb}
                        trackClassName={styles.track}
                        value={moviesFilter.releaseDateRange}
                        onChange={(value) => setMovieFilter({ ...moviesFilter, releaseDateRange: value })}
                        min={2015}
                        max={2025}
                        pearling
                        minDistance={1}
                    />
                    <div>{moviesFilter.releaseDateRange[0]} - {moviesFilter.releaseDateRange[1]}</div>
                </div>

                <div>
                    <div>Genres</div>
                    {
                        genres && genres.map(genre => (
                            <div key={genre.id} className={styles.filter_genre}>
                                <input type="checkbox" id="genre" name={genre.title} onChange={(e) => updateGenres(e, genre.id)} />
                                <lable htmlFor="genre">{genre.title}</lable>
                            </div>
                        ))
                    }

                </div>
                <Button onClick={findMovies}> Search </Button>
            </div>
        </div>
    )
}

export default MoviesFilter
