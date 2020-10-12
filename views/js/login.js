const login = document.getElementById("login")

login.addEventListener("keydown", (e) => {
    if (e.code == "enter") {
        window.location.replace(window.location.href + "?password=" + login.value)
    }
})