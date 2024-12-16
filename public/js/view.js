$(document).ready(function () {
  // Handle form submission via AJAX
  $('#submit_button').on('click', function (e) {
    e.preventDefault(); // Prevent the default form submission

    // Get the search query
    const query = $('#media_id').val();

    if (!query) {
      alert('Please enter a search term.');
      return;
    }

    // Perform an AJAX POST request
    $.ajax({
      url: '/search',
      type: 'POST',
      data: { media_id: query },
      success: function (response) {
        // Update the search results div with the server response
        $('#search-results').html(response);
      },
      error: function (xhr, status, error) {
        // Handle errors
        $('#search-results').html(`<p>Error: ${xhr.responseText || 'An error occurred.'}</p>`);
      }
    });
  });
});

