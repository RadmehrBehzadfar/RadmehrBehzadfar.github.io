# 📌 Weather Search App

A web application to search and display real-time weather information using OpenWeatherMap API. Supports JSON & XML data formats.

---

## 🌟 Features
✔️ Get **current location weather** using Geolocation  
✔️ Search by **city name** or `city,country` format  
✔️ Support for **JSON & XML** data formats  
✔️ **Unit selection**: Celsius or Fahrenheit  
✔️ **Pagination**: View search results in a paginated format  
✔️ **Detailed city weather info** in a modal popup  
✔️ **Sunrise & Sunset** times included  
✔️ **Dynamic map with markers** for searched cities  
✔️ **Day/Night mode toggle** for better UX  
✔️ **Optimized API calls** using caching  

---

## 🛠 Technologies Used  
- **HTML5, CSS3, JavaScript (ES6+)**  
- **Bootstrap 5** - Responsive UI  
- **Leaflet.js** - Interactive map  
- **OpenWeatherMap API** - Fetch weather data  
- **Geolocation API** - Get user's location  
- **DOM Manipulation** - Dynamically update UI  

---

## 📌 How It Works  

### 🏠 Current Location Weather  
- When the app loads, it asks for **location permission**  
- If granted, it fetches **weather data** for the user's coordinates  

### 🔍 Search Functionality  
- Enter a city or `city,country` (e.g., `Toronto,CA`)  
- Fetches **matching cities** with weather conditions  

### 📄 Data Mode (JSON/XML)  
- Select between **JSON** or **XML**  
- Data is **parsed accordingly** and displayed  

### 🌆 Detailed Weather Info  
- Clicking a city **opens a modal popup**  
- Displays **Temperature, Wind Speed, Humidity, Pressure, Sunrise & Sunset**  

### 🗺 Map Integration  
- Search results are **marked on an interactive map**  
- Clicking a **marker selects the city**  

### 🌗 Day/Night Mode  
- **Toggle button** to switch themes  

---

## 🌎 Live Demo  
👉 **[View Live Project](https://RadmehrBehzadfar.github.io/) github**  

---

## 🚀 Installation & Setup  

### 1️⃣ Clone the Repository  
```bash
git clone https://github.com/RadmehrBehzadfar/RadmehrBehzadfar.github.io.git
cd weather
