const bookbuttons = document.querySelectorAll(".tab .book");

if (bookbuttons !== null) {
    for (var index = 0; index < bookbuttons.length; index++) {
        bookbuttons[index].addEventListener("click", clicked);
    }

    function clicked(e) {
      location.href = this.id + ".htm";
    }
}

const backbutton = document.getElementById("back");

if (backbutton !== null) {
    backbutton.addEventListener("click", goBack);

    function goBack(e) {
        history.back();
    }
}

const chapterbuttons = document.querySelectorAll('.tab .chapter');

if (chapterbuttons !== null) {
    for (const button of chapterbuttons) {
      button.addEventListener('click', function () {
        const scrollPosition = document.querySelector(this.dataset.target).offsetTop;

        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      });
    }
}

const topbutton = document.getElementById('btntop');

if (topbutton !== null) {
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
}

const versebuttons = document.querySelectorAll('.contents_style button');

if (versebuttons !== null) {
  for (var index = 0; index < versebuttons.length; index++) {
    versebuttons[index].addEventListener("click", showVerse);
  }

  function showVerse(e) {
    let verse = document.getElementById(this.id + "-1");
    let chunk = document.getElementById(this.id + "-2");

    if (verse.style.display === "none") {
      verse.style.display = "inline";
      verse.style.fontSize = "26.0pt";
      chunk.style.display = "none";
    }
    else {
      verse.style.display = "none";
      chunk.style.display = "inline";
      chunk.style.fontSize = "26.0pt";
    }
  }
}