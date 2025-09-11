const likebtns = document.querySelectorAll('.favorite-icon');
console.log(likebtns);
likebtns.forEach(btn => {
    btn.addEventListener('click',() => {
        btn.classList.toggle("filled");
        btn.innerHTML = btn.classList.contains("filled") ? "&#10084;" : "&#9825;";
    })
    
});
