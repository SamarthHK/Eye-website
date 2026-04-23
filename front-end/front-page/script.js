document.addEventListener("DOMContentLoaded", function () {

    let selectedValue = null;
    let rows = document.querySelectorAll(".row");

    rows.forEach(row => {
        row.addEventListener("click", function () {

            rows.forEach(r => r.classList.remove("selected"));
            this.classList.add("selected");

            selectedValue = this.getAttribute("data-value");
        });
    });

    window.goToResult = function () {
        if (!selectedValue) {
            alert("Please select a line first!");
            return;
        }

        localStorage.setItem("vision", selectedValue);
        window.location.href = "../result-page/index.html";
    };

});