# 📐 1:1 Scale Print Designer

[![GitHub stars](https://img.shields.io/github/stars/kurtwp/template-generator-2d?style=flat-square&color=gold)](https://github.com/kurtwp/template-generator-2d/stargazers)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](https://github.com/kurtwp/template-generator-2d/pulls)

A web-based design tool for creating **1:1 scale printable templates**. Built with JavaScript and HTML5 Canvas, this application eliminates the guesswork in physical fabrication by ensuring that 1 inch on your screen (at standard DPI) translates to exactly 1 inch on paper.

![Main Screenshot](image1.png)

---

## ✨ Key Features

* **📏 True 1:1 Scaling**: Locked to physical dimensions (96 DPI logic) ensuring printed templates match real-world measurements perfectly.
* **🛠️ Geometric Primitives**: Extensive library including Crosses, Squares, Circles, Ovals, and Lines with real-time scaling and **precise rotation support**.
* **🔲 Advanced Snap System**: High-accuracy snapping engine with custom increments: **1"**, **0.5"**, **0.25"**, **0.125"**, and **0.0625" (1/16")**.
* **📄 Global Paper Formats**: Built-in support for **Letter**, **Legal**, **Tabloid (11"x17")**, **A4**, and **A3**.
* **📐 Alignment & Distribution**: Replicate shapes evenly across the canvas or align multiple nodes with a single click using the Distribution Engine.
* **💾 Project Persistence**: Save your designs locally as timestamped JSON files and resume work instantly.
* **🖨️ Print Optimized**: Native CSS media queries configured to strip browser UI and margins for edge-to-edge precision.

---

## 🚀 Getting Started

Since this is a lightweight, frontend-only application, you can run it without any build tools or local servers.

### Prerequisites

* A modern web browser (Chrome or Edge recommended for best print accuracy).

### Installation

1. **Clone the repository**:

    ```bash
    git clone https://github.com/kurtwp/template-generator-2d.git
    cd template-generator-2d
    ```

2. **Open the application**:
    Simply double-click `index.html` to launch in your default browser.

---

## 🛠️ Technical Details

### The Design Engine

The application utilizes a modular architecture designed for precision:

* **`State.js`**: Centralized state management using a 96 DPI scaling constant.
* **`Renderer.js`**: High-performance Canvas rendering engine supporting coordinate transformations and rotation states.
* **`LayoutEngine.js`**: Orchestrates shape manipulation, alignment logic, and distribution mathematics.
* **`InputManager.js`**: Sophisticated event handling for multi-selection, dragging, and resizing.

### Print Precision

To achieve perfect scaling, the stylesheet uses `@media print` rules to enforce correct output:

```css
@page { margin: 0; size: auto; }
canvas { width: 100% !important; height: 100% !important; }
```

> [!IMPORTANT]
> When printing, ensure your browser's "Scale" setting is set to **100%** or **Actual Size** and that margins are set to **None**.

---

## 🤝 Contributing

Contributions make the open-source community an amazing place!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📫 Contact

**Kurt** - [@kurtwp](https://github.com/kurtwp)

Project Link: [2D Template Generator](https://pasewaldt.com/template-generator-2d)
