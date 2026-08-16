(function () {
  function setLoggedIn(username) {
    localStorage.setItem('loggedIn', 'true');
    localStorage.setItem('username', username || '');
  }

  function logout() {
    localStorage.removeItem('loggedIn');
    localStorage.removeItem('username');
  }

  function isLoggedIn() {
    return localStorage.getItem('loggedIn') === 'true';
  }

  window.TourismAuth = {
    setLoggedIn,
    logout,
    isLoggedIn
  };
})();

