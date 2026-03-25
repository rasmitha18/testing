const title = document.getElementById("title");
const desc = document.getElementById("desc");
const changeBtn = document.getElementById("changeBtn");
const colorBtn = document.getElementById("colorBtn");

changeBtn.addEventListener("click", () => {
  title.innerText = "Hello User 🎉";
  desc.innerText = "Content changed using DOM!";
});

colorBtn.addEventListener("click", () => {
  document.body.style.backgroundColor = getRandomColor();
});

function getRandomColor() {
  const colors = ["#f1c40f", "#e74c3c", "#8e44ad", "#2ecc71", "#3498db"];
  return colors[Math.floor(Math.random() * colors.length)];
}