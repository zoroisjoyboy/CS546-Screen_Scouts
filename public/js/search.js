//fully load the html file
$(document).ready(() => {
  let currentPage = 1;
  let searchTerm = '';

  const theSearchResults = async (page = 1) => {
    try {
      //ajax request to get the search term
      const response = await $.ajax({
        url: `/search`,
        method: 'GET',
        data: { query: searchTerm, page },
      });

      // display search results and add the watchlist button
      $('#results').empty();
      response.results.forEach((item) => {
        let title;
        let imageUrl = '';

        if (item.media_type === 'movie') {
          title = item.title;
          imageUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/150?text=No+Image';
        } else {
          title = item.name;
          imageUrl = item.poster_path
            ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
            : 'https://via.placeholder.com/150?text=No+Image';
        }
        //attach the pic and the title
        $('#results').append(`
          <div>
            <h3>${title}</h3>
            <img src="${imageUrl}" alt="${title}" style="max-width: 200px;">
            <button class="add-to-watchlist" data-id="${item.id}" data-type="${item.media_type}">
              Add to Watchlist
            </button>
          </div>
        `);
      });

      // make buttons if there are multiple pages 
      $('#pagination').empty();
      if (response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
          let activePage;
            if (i === page) {
                 activePage = 'active';
            } 
            else {
              activePage = '';
            }
          $('#pagination').append(`
            <button class="pagination-btn ${activePage}" data-page="${i}">${i}</button>
          `);
        }
      }
    } catch (error) {
      console.error('Error getting search results:', error);
      alert('Failed to get search results');
    }
  };

  // submit the form 
  $('#searchForm').on('submit', (e) => {
    // stop page from refresh
    e.preventDefault(); 
    searchTerm = $('#searchInput').val().trim();
    if (!searchTerm) {
      alert('Please enter a search term!');
      return;
    }
    currentPage = 1;
    //get the 1st page
    theSearchResults(currentPage); 
  });

  // listn for button clicks and get the current page the user is on
  $('#pagination').on('click', '.pagination-btn', function () {
    const page = $(this).data('page');
    currentPage = page;
    theSearchResults(currentPage);
  });

  // add the media to watchlist
  $('#results').on('click', '.add-to-watchlist', async function () {
    const mediaId = $(this).data('id');
    const mediaType = $(this).data('type');
  // get the logged in user's ID from the hidden input
    const userId = $('#userId').val();
    console.log('User ID:', userId); 
    if (!userId) {
      alert('User is not logged in.');
      return;
    }

    try {
      const response = await $.ajax({
        url: `/watchlist`,
        method: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          userId,
          mediaId,
          type: mediaType,
        }),
      });

      if (response.success) {
        alert('Added to watchlist!');
      } else {
        alert('Already in watchlist!');
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist');
    }
  });
});

// move media to watched list
//when moving data it seems to change media from number to a string which causes some inconsistencies 
$(document).on('click', '.watched-button', async function () {
  console.log("Watched Button Clicked");
//  $('#watchlist').on('click', '.watched-button', async function () {

  // debug console.log("thisisthis", this)
  const mediaId = $(this).attr('data-id');
  const mediaType = $(this).attr('data-type');
   // Get the logged-in user's ID from the hidden input
  const userId = $('#userId').val(); 

  console.log('Watched Button Clicked');
  console.log('Media ID:', mediaId);
  console.log('Media Type:', mediaType);
  console.log('User ID:', userId);
  
  if (!mediaId || !mediaType || !userId) {
    alert('Invalid data. Please try again.');
    return;
  }
  
    try {
    const response = await $.ajax({
      url: `/watched`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        userId,
        id: mediaId,
        type: mediaType,
      }),
    });

    //get the media from the watchlist that matches and remove it 
    if (response.success) {
      //make so when it updates it doesn't need to refresh
      window.location.reload();
      alert('Moved to Watched List!');
      $(this).closest('.media-item').remove();
    } else {
      alert('Media is already in Watched.');
    }
  }
   catch (error) {
    console.error(':', error);
    alert('Media is already in Watched.');
  }
});
