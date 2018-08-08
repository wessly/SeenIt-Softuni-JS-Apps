$(function () {

    manageHeaderProfile();
    manageStartingPage();

    // Izvikva func() za registraciq, kogato se natisne Sign Up
    $("#btnRegister").on("click", function (e) {
        e.preventDefault();
        registerUser();
    });

    // Izvikva func() za login, kogato se natisne Sign In
    $("#btnLogin").on("click", function (e) {
        e.preventDefault();
        loginUser();
    });

    // Izvikva func() za logout, kogato se natisne Logout v header-a
    $("header #profile a").on("click", function (e) {
        e.preventDefault();
        logoutUser();
    });

    // Zarejda vs postove, kogato se natisne Catalog v Navigation-a
    $("#menu a:eq(0)").on("click", function (e) {
        e.preventDefault();
        listPosts();
        showView("viewCatalog");
    });

    // Zarejda formata za suzdavane na post, kogato se natisne Submit Link v Navigation-a
    $("#menu a:eq(1)").on("click", function (e) {
        e.preventDefault();
        showView("viewSubmit");
    });

    // Zarejda samo lichnite postove, kogato se natisne My Posts v Navigation-a
    $("#menu a:eq(2)").on("click", function (e) {
        e.preventDefault();
        listMyPosts();
        showView("viewCatalog");
    });

    // Izvikva func() za suzdavane na post, kogato se natisne Submit vuv formata na Submit Link
    $("#btnSubmitPost").on("click", function (e) {
        e.preventDefault();
        createPost();
    });

    // Izvikva func() za redaktirane na post, kogato se natisne Edit pri razglejdane na post
    $("#btnEditPost").on("click", function (e) {
        e.preventDefault();
        editPost();
    });

    // Izvikva func() za suzdavane na komentar, kogato se razglejda daden post
    $("#btnPostComment").on("click", function (e) {
        e.preventDefault();
        createComment();
    });
});

// Griji se za nachalnata stranica -> pokazva login/register formite ako user-a ne e lognat
function manageStartingPage() {

    if (sessionStorage.getItem('authToken')) {
        $('.content section').hide();
    } else {
        showView("viewWelcome");
    }
}

// Griji se za header-a -> pokazva username-a i logout butona ako user-a e lognat
function manageHeaderProfile() {

    $("#profile, #menu").hide();

    if (sessionStorage.getItem('authToken')) {
        let username = sessionStorage.getItem('username');
        $("#menu, #profile").show();
        $("#profile span").text(username);
    }
}

// Griji se za tova koi div-ove da sa vidimi pri action
function showView(viewName) {
    $('.content section').hide();
    $('#' + viewName).show();
}

// Iztriva user sesiqta
function logoutUser() {
    resetInputs()
    sessionStorage.clear();
    manageHeaderProfile();
    manageStartingPage();
    showInfo('Logout successful.');
}

// Podmenq nujnite atributi vuv formata za edit spored post-a, koito e izbran
function loadPostForEdit(article) {
    showView('viewEdit');
    $('#editPostForm').attr('postid', article._id);
    $('#editPostForm input[name="url"]').val(article.url);
    $('#editPostForm input[name="title"]').val(article.title);
    $('#editPostForm input[name="image"]').val(article.imageUrl);
    $('#editPostForm textarea[name="description"]').val(article.description);
}

// Funkciq za kalkulirane na vremeto ot suzdavane na post
function calcTime(dateIsoFormat) {

    let diff = new Date - (new Date(dateIsoFormat));
    diff = Math.floor(diff / 60000);
    if (diff < 1) return 'less than a minute';
    if (diff < 60) return diff + ' minute' + pluralize(diff);
    diff = Math.floor(diff / 60);
    if (diff < 24) return diff + ' hour' + pluralize(diff);
    diff = Math.floor(diff / 24);
    if (diff < 30) return diff + ' day' + pluralize(diff);
    diff = Math.floor(diff / 30);
    if (diff < 12) return diff + ' month' + pluralize(diff);
    diff = Math.floor(diff / 12);
    return diff + ' year' + pluralize(diff);
    function pluralize(value) {
        if (value !== 1) return 's';
        else return '';
    }
}

// Izchistva vsichki inputi sled action
function resetInputs() {
    $("body input[type=text], body textarea").val("");
}

// Pokazva gore v dqsno kare s informaciq
function showInfo(message) {

    let infoBox = $('#infoBox')
    infoBox.text(message)
    infoBox.show()
    setTimeout(function () {
        $('#infoBox').fadeOut()
    }, 3000)
}

// Pokazva gore v dqsno kare s informaciq
function showError(errorMsg) {

    let errorBox = $('#errorBox')
    errorBox.text("Error: " + errorMsg)
    errorBox.show()
    setTimeout(function () {
        $('#errorBox').fadeOut()
    }, 3000)
}

// Pokazva gore v dqsno kare s informaciq
function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}