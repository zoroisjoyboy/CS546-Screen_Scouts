$(document).ready(() => {
  let currentPage = 1;
  let searchTerm = '';

  const fetchSearchResults = async (page = 1) => {
    try {
      const response = await $.ajax({
        url: `/search`,
        method: 'GET',
        data: { query: searchTerm, page },
      });

      // Display search results
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

      // Update pagination controls
      $('#pagination').empty();
      if (response.total_pages > 1) {
        for (let i = 1; i <= response.total_pages; i++) {
          const activeClass = i === page ? 'active' : '';
          $('#pagination').append(`
            <button class="pagination-btn ${activeClass}" data-page="${i}">${i}</button>
          `);
        }
      }
    } catch (error) {
      console.error('Error getting search results:', error);
      alert('Failed to get search results');
    }
  };

  // Handle form submission
  $('#searchForm').on('submit', (e) => {
    e.preventDefault(); // Prevent form refresh
    searchTerm = $('#searchInput').val().trim();
    if (!searchTerm) {
      alert('Please enter a search term!');
      return;
    }
    currentPage = 1;
    fetchSearchResults(currentPage); // Fetch the first page
  });

  // Handle pagination button click
  $('#pagination').on('click', '.pagination-btn', function () {
    const page = $(this).data('page');
    currentPage = page;
    fetchSearchResults(currentPage);
  });

  // Add to watchlist
  $('#results').on('click', '.add-to-watchlist', async function () {
    const mediaId = $(this).data('id');
    const mediaType = $(this).data('type');
    const userId = $('#userId').val(); // Get the logged-in user's ID from the hidden input

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
