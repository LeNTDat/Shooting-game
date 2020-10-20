// load game
$('#reload').click(() => {
    location.reload();
})
// new game
$('#newGame').click(() => {
    window.location.assign('./homepage.html');
    localStorage.clear();
})
//submit name
$('#submit').click(() => {
    localStorage.setItem('name', $('#name').val())
})
//scores show
var name = localStorage.getItem('name');
$('#rank').html(() => {
    var scores = localStorage.getItem(name) || 0;
    return `<table class="table">
                    <thead>
                        <tr>
                            <th scope="col">Player:</th>
                            <th scope="col">${name}</th>
                        </tr>
                        <tr>
                            <th scope="col">Your best score</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${scores}</td>
                        </tr>
                    </tbody>
                </table>`

})
