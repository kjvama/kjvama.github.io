/*
//by html
window.addEventListener(
"load",
function () {
    const currentPath = window.location.pathname;
    const fileName = currentPath.split('/').pop();
    const menulinks = document.querySelectorAll("ul.dropdown-menu li a.menulink");
    menulinks.forEach(item => {
        let href = item.getAttribute("href");

        if (fileName.toLowerCase() === href.toLowerCase())
        {
            item.parentNode.classList.add('active');
        }
    });
},
false
);
*/

const downplan = document.querySelector("#plan");

if (downplan !== null) {
  downplan.addEventListener("click", downloadPlan);

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

const toplink = document.querySelector("#atop");

if (toplink !== null) {
    window.addEventListener("scroll", checkScoll);
    toplink.addEventListener("click", moveBackTop);

    let scrollPos = 0;

    function checkScoll() {
        scrollPos = document.documentElement.scrollTop;

        if (scrollPos > 0) {
            toplink.className = "visible";
        }
        else {
            toplink.className = "";
        }
    }

    function moveBackTop(event) {
        event.preventDefault();

        const scrollInterval = setInterval(function () {
            if (scrollPos !== 0) {
                window.scrollBy(0, -55)
            }
            else {
                clearInterval(scrollInterval);
            }
        }, 15)
    }
}

const copybuttons = document.querySelectorAll("button.copy");

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
  }
}