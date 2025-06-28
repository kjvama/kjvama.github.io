const downloadbutton = document.getElementById("plan");

if (downloadbutton !== null) {
  downloadbutton.addEventListener("click", downloadPlan);

  function downloadPlan(e) {
      let atag = document.createElement('a');
      let downloadurl = "download/bible-reading-plan.pdf";
      document.body.appendChild(atag);
      atag.download = "bible-reading-plan.pdf";
      atag.href = downloadurl;
      atag.target = "_blank";

      atag.click();
      document.body.removeChild(atag);
      window.URL.revokeObjectURL(downloadurl);
  }
}

const backbutton = document.getElementById("back");

if (backbutton !== null) {
    backbutton.addEventListener("click", goBack);

    function goBack(e) {
        history.back();
    }
}

const bookbuttons = document.querySelectorAll(".tab .book");

if (bookbuttons !== null) {
    for (let index = 0; index < bookbuttons.length; index++) {
        bookbuttons[index].addEventListener("click", clicked);
    }

    function clicked(e) {
      location.href = this.id + ".htm";
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

const anchorbuttons = document.querySelectorAll('.tab .anchor');

if (anchorbuttons !== null) {
    for (const button of anchorbuttons) {
      button.addEventListener('click', function () {
        const scrollPosition = document.querySelector(this.dataset.target).offsetTop;

        window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
      });
    }
}

const topbutton = document.getElementById('btntop');

if (topbutton !== null) {
    topbutton.addEventListener('click', function () {
        /*moveToTheTop();*/

        topbutton.onclick = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
        };
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
      
      /*
      function moveToTheTop() {
        const position = document.documentElement.scrollTop || document.body.scrollTop;
        if (position) {
          window.requestAnimationFrame(() => {
            window.scrollTo(0, position - position / 10);
            moveToTheTop();
          });
        }
      }
      */
}

/*
const versebuttons = document.querySelectorAll('.contents_style button.verse');

if (versebuttons !== null) {
  for (let index = 0; index < versebuttons.length; index++) {
    versebuttons[index].addEventListener("click", showVerse);
  }

  function showVerse(e) {
    //console.log("Coming soon!");
    let verse = document.getElementById(this.id + "-1");
    let chunk = document.getElementById(this.id + "-2");

    this.style.fontSize = "26.0pt";

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
*/

const verseaudiobuttons = document.querySelectorAll(".contents_style button.audio");

if (verseaudiobuttons !== null) {
    for (let index = 0; index < verseaudiobuttons.length; index++) {
      verseaudiobuttons[index].addEventListener("click", clickedOnTheAudioButton);
    }

    function clickedOnTheAudioButton(e) {
      let audio = document.querySelector("audio#" + this.id);
      audio.play();
    }
}

const chaptertitle = document.querySelectorAll(".contents_style p.chapter");

if (chaptertitle !== null) {
  let doctitle = document.title;
  let title = doctitle.replace("PCE - ", "");
  for (let index = 0; index < chaptertitle.length; index++) {
    let booktag = document.createElement("span");
    let bookname = document.createTextNode(title);
    booktag.setAttribute("class", "bookname");
    booktag.appendChild(bookname);
    chaptertitle[index].innerHTML = booktag.outerHTML + "&nbsp;" + chaptertitle[index].innerHTML;
  }
}

const copybuttons = document.querySelectorAll(".contents_style button.copy");

if (copybuttons !== null) {
  let doctitle = document.title;
  let title = doctitle.replace("PCE - ", "");
  for (let index = 0; index < copybuttons.length; index++) {
    let btntag = copybuttons[index];
    let versebtn = btntag.parentElement.children[0];
    let versespan = btntag.parentElement.children[1];

    btntag.onclick = function() {
      const bookverse = title + " " + versebtn.getAttribute("id").replace("-", ":");
      const copyhtml_first = versespan.innerHTML.replace(/<i>/g, "[");
      const copyhtml_last = copyhtml_first.replace(/<\/i>/g, "]");
      const blobText = new Blob([bookverse + " " + copyhtml_last], { type: "text/plain" });

      const data = [new ClipboardItem({
         ["text/plain"]: blobText,
      })];

      navigator.clipboard.write(data).then(() => {
        alert("[" + bookverse + "] Copied to clipboard!");
        btntag.setAttribute("class", "copied");
        btntag.innerText = "Copied!";

        setTimeout(() => {
          btntag.setAttribute("class", "copy");
          btntag.innerText = "Copy";
        }, 5000);
      });
    };

    navigator.clipboard.addEventListener("clipboardchange", e => {
      navigator.clipboard.getText().then(text => {
        console.log('Updated clipboard contents: '+text);
      });
    });

    const PERMISSIONS = [
      { name: "clipboard-read" },
      { name: "clipboard-write" }
    ];

    Promise.all(
      PERMISSIONS.map( descriptor => navigator.permissions.query(descriptor) )
    ).then( permissions => {
      permissions.forEach( (status, index) => {
        let descriptor = PERMISSIONS[index],
          name = permissionName(descriptor),
          btn = document.createElement('button');
        btn.title = 'Click to request permission';
        btn.textContent = name;
        
        // Clicking a button (re-)requests that permission:
        btn.onclick = () => {
          navigator.permissions.request(descriptor)
            .then( status => { log(`Permission ${status.state}.`); })
            .catch( err => { log(`Permission denied: ${err}`); });
        };
        
        // If the permission status changes, update the button to show it
        status.onchange = () => {
          btn.setAttribute('data-state', status.state);
        };
        status.onchange();
      });
    });
  }

  function permissionName(permission) {
    let name = permission.name.split('-').pop();
    if ('allowWithoutGesture' in permission) {
      name += ' ' + (permission.allowWithoutGesture ? '(without gesture)' : '(with gesture)');
    }
    return name;
  }
}

