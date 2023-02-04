const BASE_URL = 'http://webdev.alphacamp.io'
const Index_URL = BASE_URL + '/api/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = []          //準備API資料的存放容器
const MOVIE_PER_Page = 12  //設定每一分頁資料數:12筆

let filteredMovies = []  //裝符合關鍵字的電影資料容器


//==================================================
//功能:HTML-data-panel內容，動態產出
//取出要動態產出的節點
const dataPanel = document.querySelector('#data-panel')

//準備function:renderMovieList大量製作card HTML內容
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
              <button class="btn btn-info btn-add-favorite" data-id="${movie.id}"}>+</button>
            </div>
          </div>
        </div>
      </div>
    `
  })
  dataPanel.innerHTML = cardHtml
}

//==============================================================
//分頁功能

//準備function:getMovieByPage，擷取每一分頁12筆的 movies/filteredMovies資料
function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies  //三元運算子
  const startIndex = (page - 1) * MOVIE_PER_Page
  return data.slice(startIndex, startIndex + MOVIE_PER_Page) //slice()只會取到結尾index的前一index
}

const paginator = document.querySelector('#paginator')

//準備function:renderPaginator，計算movies的資料要幾個分頁才裝的完
function renderPaginator(amount) {
  const totalPages = Math.ceil(amount / MOVIE_PER_Page)

  let cardHtml = ""
  //迴圈:製作分頁HTML
  for (let page = 1; page <= totalPages; page++) {
    cardHtml += `<li class ="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = cardHtml
}

//=================================================
//功能:串接API，渲染分頁的部分movies資料，渲染頁數

axios.get(Index_URL).then((response) => {   //串接電影API
  //方法1:利用迭代器將response.data.results陣列中的物件一個一個取出
  for (let movie of response.data.results) {
    movies.push(movie)
  }
  //方法2:利用展開運算子
  //movies.push(...response.data.results)

  //renderMovieList(movies) //渲染所有movies資料
  renderMovieList(getMoviesByPage(1))  //渲染分頁的部分movies資料
  renderPaginator(movies.length)       //渲染頁數
})
  .catch((error) => {
    console.log(error)
  })

//============================================
//功能:點擊頁碼，取得被點擊的頁數

paginator.addEventListener('click', function onPaginatorClicked(event) {
  if (event.target.tagName !== 'A') return  //如果點擊到的不是<a>，則結束函式
  const clickedPage = Number(event.target.dataset.page)
  renderMovieList(getMoviesByPage(clickedPage))
})


//============================================================
//功能:點擊more按鈕，跳出動態modal內容

//準備function: modalMaker 變更modal HTML內容
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

//=================================================================
//功能:加入最愛
//準備function:addToFavorite 加入最愛，將點擊到的電影送入local storage存起來
function addToFavorite(id) {
  //favoriteList的值是: localstorage中favoriteMovies的值，如果娶不到favoriteMovies值，則favoriteList的值是[]空陣列
  const favoriteList = JSON.parse(localStorage.getItem('favoriteMovies')) || []
  const movie = movies.find((movie) => movie.id === id)
  if (favoriteList.some((movie) => movie.id === id)) {
    return alert('此電影已在清單中')
  }
  favoriteList.push(movie)
  localStorage.setItem('favoriteMovies', JSON.stringify(favoriteList))
}


//監聽器:more按鈕 & +按鈕

dataPanel.addEventListener('click', function onPanelClicked(event) {
  if (event.target.matches('.btn-show-movie')) {
    modalMaker(event.target.dataset.id)
  } else if (event.target.matches('.btn-add-favorite')) {
    addToFavorite(Number(event.target.dataset.id))
  }
})


//===================================================================
//關鍵字搜尋功能
//準備監聽器:search功能
const searchFrom = document.querySelector('#search-form')


searchFrom.addEventListener('submit', function onSearchFormSubmitted(event) {
  //希望按下search鍵時，頁面不要刷新，要加上event.preventDefault()
  event.preventDefault()

  //取得<input>的值
  const searchInput = document.querySelector('#search-input')
  const keyword = searchInput.value.trim().toLowerCase()

  //準備條件函式
  // function keywordCheck(movie) {
  //   return movie.title.toLowerCase().includes(keyword)
  // }
  //將符合關鍵字的電影放入變數中                                 
  filteredMovies = movies.filter((movie) => movie.title.toLowerCase().includes(keyword))
  console.log(filteredMovies)

  // for (let movie of movies) {
  //   if (movie.title.toLowerCase().includes(keyword)) {
  //     filteredMovies.push(movie)
  //   }
  // }

  //排除無效關鍵字
  if (keyword.length === 0) {
    return alert(`您輸入的關鍵字:${keyword} 沒有符合條件的電影`)
  }


  renderPaginator(filteredMovies.length)    //關鍵字頁面，渲染分頁器

  renderMovieList(getMoviesByPage(1))       //將filteredMovies內電影資料，重新選染在data-panel-card
})

