const BASE_URL = 'http://webdev.alphacamp.io'
const Index_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'


//資料來源從local storage來
const movies = JSON.parse(localStorage.getItem('favoriteMovies')) || []


//HTML:card內容，動態產出
//取出要動態產出的節點
const dataPanel = document.querySelector('#data-panel')

//準備function大量製作card HTML內容
function renderMovieList(movies) {
  let cardHtml = ""
  movies.forEach(function (movie) {
    cardHtml += `
<div class="col-sm-3">
        <div class="mt-3">
          <div class="card">
            <img src="${POSTER_URL + movie.image}" class="card-img-top" alt="Movie Poster">
            <div class="card-body">
              <h5 class="card-title">${movie.title}</h5>
            </div>
            <div class="card-footer">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
              data-bs-target="#movie-modal" data-id="${movie.id}">More</button>
              <button class="btn btn-info btn-remove-favorite" data-id="${movie.id}"}>X</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = cardHtml
}

//讓加到最愛清單的電影，渲染在data-panel-card
renderMovieList(movies)

//============================================================
//功能:點擊more按鈕，跳出動態modal內容

//準備function變更modal HTML內容
function modalMaker(id) {
  const movieModalTitle = document.querySelector('#movie-modal-title')
  const movieModalImage = document.querySelector('#movie-modal-image')
  const movieModalDate = document.querySelector('#movie-modal-date')
  const movieModalDescription = document.querySelector('#movie-modal-description')

  axios.get(Index_URL + id).then((response) => {
    movieModalTitle.textContent = response.data.results.title
    movieModalImage.innerHTML = `
     <img src="${POSTER_URL + response.data.results.image}" alt="Movie Poster" style="max-width: 100%;">
     `
    movieModalDate.textContent = 'Release date:' + response.data.results.release_date
    movieModalDescription.textContent = response.data.results.description
  })
}

//準備function:刪除最愛
function removeFromFavorite(id) {
  if (!movies || !movies.length) return

  const movieIndex = movies.findIndex((movie) => movie.id === id) //movieIndex 會是一個index值
  if (movieIndex === -1) return  //如果沒有找到 index值會變成-1， 則return結束函式

  //從movies陣列中刪除電影
  movies.splice(movieIndex, 1)

  //將刪好的movies，存回local storage
  localStorage.getItem('favoriteMovies', JSON.stringify(movies))

  //更新頁面
  renderMovieList(movies)
}



//準備監聽器:more按鈕 & +按鈕

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    modalMaker(event.target.dataset.id)
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})


