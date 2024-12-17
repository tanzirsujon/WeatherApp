document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const cityNameEl = document.getElementById('cityname');
    const cityTempEl = document.getElementById('citytemp');
    const dateEl = document.getElementById('datecardvalue');
    const latitudeEl = document.getElementById('latitude1');
    const longitudeEl = document.getElementById('longtitude1');
    const windDirectionEl = document.getElementById('winddirection1');
    const windSpeedEl = document.getElementById('wind1');
    const hourlyTempEls = [
        document.getElementById('ten1'),
        document.getElementById('ten2'),
        document.getElementById('ten3'),
        document.getElementById('ten4'),
        document.getElementById('ten5'),
        document.getElementById('ten6'),
        document.getElementById('ten7'),
    ];
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const searchInput = document.getElementById('inp1');
    const searchBtn = document.getElementById('srchicon');
    const toggleContainer = document.getElementById('togglecontainer');
    const circle = document.getElementById('Ellipse');
    const hourEl = document.getElementById('hour');
    const minuteEl = document.getElementById('minute');
    const ampmEl = document.getElementById('ampm');

    // Data and State
    const cities = {
        Dhaka: "latitude=23.7104&longitude=90.4074",
        Sylhet: "latitude=24.9045&longitude=91.8611",



    };
    const baseUrl = "https://api.open-meteo.com/v1/forecast?";
    let weatherData = [];
    let hourlyData = [];
    let currentIndex = 0;
    let isFahrenheit = false;

    // Utility Functions
    const convertToFahrenheit = (celsius) => (celsius * 9 / 5) + 32;

    const updateCurrentTime = () => {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        hourEl.innerText = hours % 12 || 12;
        minuteEl.innerText = minutes < 10 ? `0${minutes}` : minutes;
        ampmEl.innerText = hours >= 12 ? 'PM' : 'AM';
    };

    const fetchWeatherData = async () => {
        try {
            const fetchPromises = Object.entries(cities).map(async ([city, coordinates]) => {
                const url = `${baseUrl}${coordinates}&hourly=temperature_2m,wind_speed_10m&current_weather=true`;
                const urlConstructor = new URL(url);
                const response = await fetch(urlConstructor);
                if (!response.ok) throw new Error(`Failed to fetch data for ${city}`);
                const data = await response.json();

                hourlyData.push(data.hourly.temperature_2m.slice(10, 17));
                weatherData.push({
                    city,
                    temperature: data.current_weather.temperature,
                    latitude: data.latitude || 'N/A',
                    longitude: data.longitude || 'N/A',
                    wind_direction: data.current_weather.winddirection || 'N/A',
                    wind_speed: data.current_weather.windspeed || 'N/A'
                });
            });

            await Promise.all(fetchPromises);
            displayWeather(currentIndex);
        } catch (error) {
            console.error('Error fetching weather data:', error);
            console.log('Failed to fetch weather data. Please try again later.');
        }
    };

    const displayWeather = (index) => {
        const { city, temperature, latitude, longitude, wind_direction, wind_speed } = weatherData[index];
        const hourlyTemps = hourlyData[index].map(temp => isFahrenheit ? convertToFahrenheit(temp) : temp);

        cityNameEl.innerText = city;
        cityTempEl.innerHTML = `${isFahrenheit ? convertToFahrenheit(temperature).toFixed(1) : temperature}&deg;${isFahrenheit ? 'F' : 'C'}`;
        dateEl.innerHTML = `${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', weekday: 'short' })}`;
        latitudeEl.innerText = latitude;
        longitudeEl.innerText = longitude;
        windDirectionEl.innerText = wind_direction;
        windSpeedEl.innerText = wind_speed;

        hourlyTempEls.forEach((el, i) => {
            el.innerHTML = `${hourlyTemps[i].toFixed(1)}&deg;${isFahrenheit ? 'F' : 'C'}`;
        });

        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === weatherData.length - 1;
    };

    // Event Handlers
    prevBtn.addEventListener('click', () => {
        if (currentIndex > 0) displayWeather(--currentIndex);
    });

    nextBtn.addEventListener('click', () => {
        if (currentIndex < weatherData.length - 1) displayWeather(++currentIndex);
    });

    searchBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const searchTerm = searchInput.value.trim().toLowerCase();
        if (!searchTerm) return alert('Please enter a city name.');

        const foundIndex = weatherData.findIndex(data => data.city.toLowerCase().includes(searchTerm));
        if (foundIndex !== -1) {
            currentIndex = foundIndex;
            displayWeather(currentIndex);
        } else {
            alert('City not found!');
        }
        searchInput.value = '';
    });

    toggleContainer.addEventListener('click', () => {
        isFahrenheit = !isFahrenheit;
        circle.style.left = isFahrenheit ? '12.7rem' : '9.1rem';
        displayWeather(currentIndex);
    });

    setInterval(updateCurrentTime, 1000);

    // Initial Fetch
    fetchWeatherData();
});
