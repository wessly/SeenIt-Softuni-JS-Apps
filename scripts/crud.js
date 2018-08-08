// Funkciq za registrirane na user
function registerUser() {

    let username = $("#registerForm input[name=username]").val();
    let password = $("#registerForm input[name=password]").val();
    let password_repeat = $("#registerForm input[name=repeatPass]").val();

    if (username.length > 2 && password.length > 5 && password === password_repeat) {
        
        $.ajax({
            method: "POST",
            url: BASE_URL + "user/" + APP_KEY + "/",
            headers: AUTH_HEADERS,
            data: { username, password }
        }).then((res) => {
            resetInputs()
            sessionStorage.setItem('authToken', res._kmd.authtoken);
            sessionStorage.setItem('userId', res._acl.creator);
            sessionStorage.setItem('username', res.username);
            manageHeaderProfile();
            manageStartingPage();
            showInfo('User registration successful.');
        }).catch((err) => {
            handleAjaxError(err);
        })
    }
}

// Funkciq za login na user
function loginUser() {

    let username = $("#loginForm input[name=username]").val();
    let password = $("#loginForm input[name=password]").val();

    if (username.length > 2 && password.length > 5) {

        $.ajax({
            method: "POST",
            url: BASE_URL + 'user/' + APP_KEY + '/login',
            headers: AUTH_HEADERS,
            data: { username, password }
        }).then((res) => {
            resetInputs()
            sessionStorage.setItem('authToken', res._kmd.authtoken);
            sessionStorage.setItem('userId', res._acl.creator);
            sessionStorage.setItem('username', res.username);
            manageHeaderProfile();
            manageStartingPage();
            showInfo('User login successful.');
        }).catch((err) => {
            handleAjaxError(err);
        })
    }
}

// Funkciq za suzdavane na post (samo registriran user)
function createPost() {

    let url = $("#viewSubmit input[name=url]").val();
    let title = $("#viewSubmit input[name=title]").val();
    let imageUrl = $("#viewSubmit input[name=image]").val();
    let description = $("#viewSubmit textarea[name=comment]").val();
    let author = sessionStorage.getItem('username');

    if (url && title && imageUrl && author) {

        $.ajax({
            method: "POST",
            url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
            headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') },
            data: { url, title, imageUrl, description, author }
        }).then((res) => {
            resetInputs()
            listPosts()
            showView("viewCatalog")
            showInfo('Post created.');
        }).catch((err) => {
            handleAjaxError(err)
        })
    }
}

// Zarejda kataloga sus vsichki postove
function listPosts() {

    $.ajax({
        method: "GET",
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts',
        headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
    }).then((res) => {

        $(".posts").html("");

        let index = 1;

        for (let article of res) {

            let time = calcTime(article._kmd.ect);

            let art = $(`<article class="post">
                    <div class="col rank">
                        <span>${index}</span>
                    </div>
                    <div class="col thumbnail">
                        <a href="${article.url}">
                            <img src="${article.imageUrl}">
                        </a>
                    </div>
                    <div class="post-content">
                        <div class="title">
                            <a href="${article.url}">
                                ${article.title}
                            </a>
                        </div>
                        <div class="details">
                            <div class="info">
                                submitted ${time} ago by ${article.author}
                            </div>`);

            if (article._acl.creator === sessionStorage.getItem('userId')) {

                let afterDiv = $(art).find('.info');
                let aComment = $(`<li class="action"><a class="commentsLink" href="#">comments</a></li>`).on('click', function () {
                    loadPostForComments(article)
                });

                let aEdit = $('<li class="action"><a class="editLink" href="#">edit</a></li>').on('click', function () {
                    loadPostForEdit(article)
                });

                let aDelete = $('<li class="action"><a class="deleteLink" href="#">delete</a></li>').on('click', function () {
                    deletePost(article)
                });

                $(`<div class="controls"><ul>`).insertAfter(afterDiv);
                $(art).find('.controls ul').append(aComment).append(aEdit).append(aDelete);
            
            } else {

                let afterDiv = $(art).find('.info');
                let aComment = $(`<li class="action"><a class="commentsLink" href="#">comments</a></li>`).on('click', function () {
                    loadPostForComments(article)
                });

                $(`<div class="controls"><ul>`).insertAfter(afterDiv);
                $(art).find('.controls ul').append(aComment);
            }

            $(".posts").append(art);

            index++;
        }
    }).catch((err) => {
        handleAjaxError(err)
    })
}

// Zarejda kataloga sus lichnite postove
function listMyPosts() {

    $.ajax({
        method: "GET",
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts?query={"author":"'+ sessionStorage.getItem('username') +'"}&sort={"_kmd.ect": -1}',
        headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
    }).then((res) => {

        $(".posts").html("");

        let index = 1;

        for (let article of res) {

            let time = calcTime(article._kmd.ect);

            let art = $(`<article class="post">
                    <div class="col rank">
                        <span>${index}</span>
                    </div>
                    <div class="col thumbnail">
                        <a href="${article.url}">
                            <img src="${article.imageUrl}">
                        </a>
                    </div>
                    <div class="post-content">
                        <div class="title">
                            <a href="${article.url}">
                                ${article.title}
                            </a>
                        </div>
                        <div class="details">
                            <div class="info">
                                submitted ${time} ago by ${article.author}
                            </div>`);

                let afterDiv = $(art).find('.info');
                let aComment = $(`<li class="action"><a class="commentsLink" href="#">comments</a></li>`).on('click', function () {
                    loadPostForComments(article)
                });

                let aEdit = $('<li class="action"><a class="editLink" href="#">edit</a></li>').on('click', function () {
                    loadPostForEdit(article)
                });

                let aDelete = $('<li class="action"><a class="deleteLink" href="#">delete</a></li>').on('click', function () {
                    deletePost(article)
                });

                $(`<div class="controls"><ul>`).insertAfter(afterDiv);
                $(art).find('.controls ul').append(aComment).append(aEdit).append(aDelete);

            $(".posts").append(art);

            index++;
        }
    }).catch((err) => {
        handleAjaxError(err)
    })
}

// Funkciq za edit na post (ot avtora na posta)
function editPost() {

    let postid = $('#editPostForm').attr('postid');
    let url = $("#editPostForm input[name=url]").val();
    let title = $("#editPostForm input[name=title]").val();
    let imageUrl = $("#editPostForm input[name=image]").val();
    let description = $("#editPostForm textarea[name=description]").val();
    let author = sessionStorage.getItem('username');

    if (postid && url && title && imageUrl) {

        $.ajax({
            method: 'PUT',
            url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + postid,
            headers: {Authorization: 'Kinvey ' + sessionStorage.getItem('authToken')},
            data: { url, title, imageUrl, description, author }
        }).then(function (res) {
            resetInputs()
            listPosts()
            showView("viewCatalog")
            showInfo('Post edited.')
        }).catch((err) => {
            handleAjaxError(err)
        })
    }
}

// Funkciq za delete na post (ot avtora na posta)
function deletePost(article) {

    $.ajax({
        method: "DELETE",
        url: BASE_URL + 'appdata/' + APP_KEY + '/posts/' + article._id,
        headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
    }).then((res) => {
        listPosts()
        showView("viewCatalog")
        showInfo('Post deleted.')
    }).catch((err) => {
        handleAjaxError(err)
    })
}

// Funkciq za preglejdane na post
function loadPostForComments(article) {

    $.ajax({
        method: "GET",
        url: BASE_URL + 'appdata/' + APP_KEY + '/comments?query={"postId":"' + article._id + '"}&sort={"_kmd.ect": -1}',
        headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
    }).then((comments) => {

        let time = calcTime(article._kmd.ect);
        
        $("#viewComments .post .col.thumbnail a").attr("href", article.url);
        $("#viewComments .post img").attr("src", article.imageUrl);
        $("#viewComments .post-content .title a").attr("href", article.url).text(article.title);
        $("#viewComments .details p").text(article.description);
        $("#viewComments .details .info").text(`submitted ${time} ago by ${article.author}`);
        $("#viewComments #commentForm").attr("postid", article._id);

        if (article._acl.creator === sessionStorage.getItem('userId')) {

            let aEdit = $('<li class="action"><a class="editLink" href="#">edit</a></li>').on('click', function () {
                loadPostForEdit(article)
            });

            let aDelete = $('<li class="action"><a class="deleteLink" href="#">delete</a></li>').on('click', function () {
                deletePost(article)
            });

            $("#viewComments .controls").html("");
            $("#viewComments .controls").append(aEdit).append(aDelete);

        } else {

            $("#viewComments .controls").html("");
        }

        $("#viewComments article").remove();

        for (let comment of comments) {
            let commentTime = calcTime(comment._kmd.ect);
            let commentBody = $(`<article class="post post-content">
                <p>${comment.content}</p>
                <div class="info">
                    submitted ${commentTime} by ${comment.author}
                </div>
            </article>`);

            if (comment._acl.creator === sessionStorage.getItem('userId')) {
                console.log('ima moi post')
                let aDelete = $('<li class="action"><a class="deleteLink" href="#">delete</a></li>').on('click', function () {
                    deleteComment(comment)
                });
                $(commentBody).find('.info').append(aDelete);
            }

            $("#viewComments").append(commentBody);
        }

        showView('viewComments');
        
    }).catch((err) => {
        handleAjaxError(err)
    });
}

// Funkciq za suzdavane na komentar
function createComment() {

    let postId = $("#viewComments #commentForm").attr("postid");
    let comment = $("#commentForm textarea").val();
    let author = sessionStorage.getItem('username');

    if (postId && comment && author) {
        $.ajax({
            method: "POST",
            url: BASE_URL + 'appdata/' + APP_KEY + '/comments',
            headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') },
            data: { content: comment, author, postId }
        }).then((res) => {
            resetInputs()
            listPosts()
            showView("viewCatalog")
            showInfo('Comment created.')
        }).catch((err) => {
            handleAjaxError(err)
        })
    }
}

// Funkciq za iztrivane na komentar
function deleteComment(comment) {

    $.ajax({
        method: "DELETE",
        url: BASE_URL + 'appdata/' + APP_KEY + '/comments/' + comment._id,
        headers: { Authorization: 'Kinvey ' + sessionStorage.getItem('authToken') }
    }).then((res) => {
        listPosts()
        showView("viewCatalog")
        showInfo('Comment deleted.')
    }).catch((err) => {
        handleAjaxError(err)
    })
}