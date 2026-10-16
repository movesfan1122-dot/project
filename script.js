"use strict";
const songs = Array.from({ length: 18 }, (_, i) => ({
  id: i + 1,
  songName: `Song ${i + 1}`,
  songDes: `Relax and enjoy song ${i + 1}`,
  songImage: `Images/${i + 1}.jpg`,
  songPath: `audio/${i + 1}.mp3`,
}));
//solved audio autoplay issue by adding preload metadata and catch error on play
const cards = [...document.querySelectorAll(".music-card")];
const audio = new Audio();
audio.preload = "metadata";
audio.volume = 0.8;
const play = document.getElementById("play"),
  progressBar = document.getElementById("progressBar");
const shuffle = document.getElementById("shuffle"),
  repeat = document.getElementById("repeat");
const nowBar = document.querySelector(".now-bar");
const searchInput = document.querySelector(".input-box");
let currentId = 1,
  isShuffle = false,
  isRepeat = false,
  shuffleQueue = [];
const fmt = (t) =>
  Number.isFinite(t)
    ? `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`
    : "0:00";
function songById(id) {
  return songs.find((s) => s.id === id);
}
function updateUI() {
  const s = songById(currentId);
  if (!s) return;
  nowBar.querySelector("img").src = s.songImage;
  nowBar.querySelector(".img-title-info").textContent = s.songName;
  nowBar.querySelector(".img-des-info").textContent = s.songDes;
  document.querySelectorAll(".playMusic").forEach((el) => {
    const active = Number(el.id) === currentId && !audio.paused;
    el.classList.toggle("fa-circle-pause", active);
    el.classList.toggle("fa-circle-play", !active);
  });
  const playing = !audio.paused;
  play.classList.toggle("fa-circle-pause", playing);
  play.classList.toggle("fa-circle-play", !playing);
}
function loadSong(id, autoplay = true) {
  const s = songById(id);
  if (!s) return;
  currentId = id;
  audio.src = s.songPath;
  audio.load();
  updateUI();
  if (autoplay) audio.play().catch(() => {});
}
function togglePlay() {
  if (!audio.src) loadSong(currentId, false);
  if (audio.paused) audio.play().catch(() => {});
  else audio.pause();
}
function nextSong() {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play().catch(() => {});
    return;
  }
  if (isShuffle) {
    let options = songs.map((s) => s.id).filter((id) => id !== currentId);
    loadSong(options[Math.floor(Math.random() * options.length)]);
  } else loadSong(currentId === songs.length ? 1 : currentId + 1);
}
function prevSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }
  loadSong(currentId === 1 ? songs.length : currentId - 1);
}
cards.forEach((card, i) => {
  const s = songs[i];
  if (!s) return;
  card.querySelector("img").src = s.songImage;
  card.querySelector("img").alt = s.songName;
  card.querySelector(".img-title").textContent = s.songName;
  card.querySelector(".img-description").textContent = s.songDes;
  const btn = card.querySelector(".playMusic");
  btn.setAttribute("role", "button");
  btn.setAttribute("tabindex", "0");
  btn.setAttribute("aria-label", `Play ${s.songName}`);
  const activate = () => {
    if (currentId === s.id && audio.src) togglePlay();
    else loadSong(s.id);
  };
  btn.addEventListener("click", activate);
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      activate();
    }
  });
});
play.addEventListener("click", togglePlay);
document.getElementById("forward").addEventListener("click", nextSong);
document.getElementById("backward").addEventListener("click", prevSong);
audio.addEventListener("play", updateUI);
audio.addEventListener("pause", updateUI);
audio.addEventListener("ended", nextSong);
audio.addEventListener("timeupdate", () => {
  const pct = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
  progressBar.value = pct;
  progressBar.style.setProperty("--value", pct + "%");
  document.getElementById("currentTime").textContent = fmt(audio.currentTime);
});
audio.addEventListener("loadedmetadata", () => {
  document.getElementById("duration").textContent = fmt(audio.duration);
});
progressBar.addEventListener("input", () => {
  if (Number.isFinite(audio.duration))
    audio.currentTime = (Number(progressBar.value) / 100) * audio.duration;
  progressBar.style.setProperty("--value", progressBar.value + "%");
});
shuffle.addEventListener("click", () => {
  isShuffle = !isShuffle;
  shuffle.classList.toggle("active", isShuffle);
  if (isShuffle) {
    isRepeat = false;
    repeat.classList.remove("active");
  }
});
repeat.addEventListener("click", () => {
  isRepeat = !isRepeat;
  repeat.classList.toggle("active", isRepeat);
  if (isRepeat) {
    isShuffle = false;
    shuffle.classList.remove("active");
  }
});
const volume = document.getElementById("volumeBar");
volume.addEventListener("input", () => {
  audio.volume = Number(volume.value) / 100;
  document.getElementById("volumeIcon").className =
    audio.volume === 0 ? "fa-solid fa-volume-xmark" : "fa-solid fa-volume-high";
});
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  cards.forEach((card) => {
    const text = (
      card.querySelector(".img-title").textContent +
      " " +
      card.querySelector(".img-description").textContent
    ).toLowerCase();
    card.style.display = text.includes(q) ? "" : "none";
  });
  document.querySelectorAll(".music-section").forEach((section) => {
    section.style.display = [...section.querySelectorAll(".music-card")].some(
      (c) => c.style.display !== "none",
    )
      ? ""
      : "none";
  });
});
document.getElementById("mobileSearch").addEventListener("click", () => {
  document.body.classList.remove("library-open");
  searchInput.focus();
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document
  .getElementById("mobileLibrary")
  .addEventListener("click", () =>
    document.body.classList.toggle("library-open"),
  );
document.getElementById("mobileHome").addEventListener("click", () => {
  document.body.classList.remove("library-open");
  searchInput.value = "";
  searchInput.dispatchEvent(new Event("input"));
  window.scrollTo({ top: 0, behavior: "smooth" });
});
document
  .querySelector(".library-add")
  .addEventListener("click", () =>
    alert("Playlist creation requires an account/backend."),
  );
document
  .querySelectorAll(".box button")
  .forEach((btn) =>
    btn.addEventListener("click", () =>
      alert("This feature needs an account/backend."),
    ),
  );
document.addEventListener("keydown", (e) => {
  if (
    e.code === "Space" &&
    !["INPUT", "TEXTAREA", "BUTTON"].includes(document.activeElement.tagName)
  ) {
    e.preventDefault();
    togglePlay();
  }
  if (e.altKey && e.key === "ArrowRight") nextSong();
  if (e.altKey && e.key === "ArrowLeft") prevSong();
});
loadSong(1, false);