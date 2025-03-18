const bookbuttons = document.querySelectorAll(".tab .book");

for (var index = 0; index < bookbuttons.length; index++) {
    bookbuttons[index].addEventListener("click", clicked);
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

const chapterbuttons = document.querySelectorAll('.tab .chapter');
for (const button of chapterbuttons) {
  button.addEventListener('click', function () {
    const scrollPosition = document.querySelector(this.dataset.target).offsetTop;

    window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
  });
}

const topbutton = document.getElementById('btntop');

topbutton.addEventListener('click', function () {
    moveToTheTop();
});

window.addEventListener('scroll', () => {
    if (
      document.body.scrollTop > 100 ||
      document.documentElement.scrollTop > 20
    ) {
        topbutton.style.display = 'block';
    } else {
        topbutton.style.display = 'none';
    }
  });
  
  function moveToTheTop() {
    const position = document.documentElement.scrollTop || document.body.scrollTop;
    if (position) {
      window.requestAnimationFrame(() => {
        window.scrollTo(0, position - position / 10);
        moveToTheTop();
      });
    }
  }