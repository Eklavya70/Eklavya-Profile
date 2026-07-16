# 🏹 Eklavya — Warrior Link Hub & Profile

A highly aesthetic, premium personal link-in-bio website and immersive interactive profile. It is themed around the legendary ancient Indian archer **Eklavya** and his **Nishada Clan**, blending traditional Indian lore with a modern, responsive web layout.

---

## ✨ Features

* **🌲 Earthy Warrior Aesthetic**: Custom forest moss greens, burnt umbers, and weathered bronze borders with stone-carved card panels. Features a bold serif heading font (**Cinzel**) to evoke a carved stone look.
* **🏹 Custom Arrow Cursor**: Standard cursor is replaced with a highly detailed, realistic archery arrow. Hover states transform the arrowhead into a glowing gold marker.
* **🍁 Ambient Background Particles & Mouse Trails**:
  * **Night Mode**: Fiery orange embers float continuously upward, and the mouse cursor leaves a trail of sparks.
  * **Day Mode**: Muted forest leaves float downward with a gentle swaying motion, and the mouse cursor sways leaves in its wake.
* **📜 Side-Sliding Story Panels**:
  * **My Story** slides in from the left, shifting the main profile screen right.
  * **The Clan** slides in from the right, shifting the main profile screen left.
  * Both stories are split into responsive, interactive flashcards with custom navigation controls. Clicks outside the active panel or pressing `Esc` return everything back to the center.
* **🪶 Author Info Panel**: A full-screen bottom-sliding panel featuring a clean, multi-card layout displaying the profile's author detail (**Adii** — AI & DS student at VIT Pune).
* **🔊 Procedural Audio Transitions (Web Audio API)**: Toggling between Day and Night Mode triggers a custom-synthesized aerodynamic arrow swoosh and a warm/cool chime transition effect. Fully self-contained without using any external audio files.

---

## 🛠️ Built With

* **Core Structure**: Semantic HTML5 & Flexbox layouts
* **Styling**: Vanilla CSS3 custom variables (dynamic day/night modes), custom SVG cursors, custom transitions and keyframe animations
* **Interactive Logic**: Vanilla JavaScript (ES6+), Web Audio API synthesizers, Canvas API particle engines

---

## 🚀 How to Run Locally

Since this project is built entirely on standard frontend technologies with zero compiler dependencies, it can be launched directly in any web browser.

1. Clone this repository:
   ```bash
   git clone https://github.com/Eklavya70/Eklavya-Profile.git
   ```
2. Navigate to the project directory:
   ```bash
   cd Eklavya-Profile
   ```
3. Open `index.html` in your favorite web browser (double-click the file or drag it into the browser window).
