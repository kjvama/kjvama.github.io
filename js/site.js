const buttons = document.querySelectorAll(".tab .book");

for (var index = 0; index < buttons.length; index++) {
    buttons[index].addEventListener("click", clicked);
}

function clicked(e) {
   location.href = this.id + ".htm";
}

const back = document.getElementById("back");

if (back !== null) {
    back.addEventListener("click", goBack);

    function goBack(e) {
        history.back();
    }
}