class ClockApp {
  constructor() {
    this.isDetailsOpen = false;
    this.currentQuoteIndex = 0;
    this.userLocation = null;
    this.quotes = [
      {
        content:
          "The science of operations, as derived from mathematics more especially, is a science of itself, and has its own abstract truth and value.",
        author: "Ada Lovelace",
      },
      {
        content:
          "A computer would deserve to be called intelligent if it could deceive a human into believing that it was human.",
        author: "Alan Turing",
      },
      {
        content: "The best way to predict the future is to invent it.",
        author: "Alan Kay",
      },
      {
        content: "Innovation distinguishes between a leader and a follower.",
        author: "Steve Jobs",
      },
      {
        content: "The only way to do great work is to love what you do.",
        author: "Steve Jobs",
      },
    ];

    this.init();
  }

  init() {
    this.getUserLocation();
    this.updateTime();
    this.updateDetails();
    this.setupEventListeners();
    setInterval(() => this.updateTime(), 1000);
    setInterval(() => this.updateDetails(), 60000);
  }

  async getUserLocation() {
    try {
      // Try to get user's location using geolocation API
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            await this.getLocationName(latitude, longitude);
          },
          async (error) => {
            console.log("Geolocation error:", error);
            // Fallback to IP-based location
            await this.getLocationFromIP();
          }
        );
      } else {
        // Fallback to IP-based location
        await this.getLocationFromIP();
      }
    } catch (error) {
      console.log("Location error:", error);
      // Set a default location
      this.userLocation = "WORLDWIDE";
      this.updateLocationDisplay();
    }
  }

  async getLocationName(lat, lon) {
    try {
      // Using a free reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      const data = await response.json();

      if (data.city && data.countryCode) {
        this.userLocation = `IN ${data.city.toUpperCase()}, ${data.countryCode.toUpperCase()}`;
      } else if (data.locality && data.countryCode) {
        this.userLocation = `IN ${data.locality.toUpperCase()}, ${data.countryCode.toUpperCase()}`;
      } else if (data.countryName) {
        this.userLocation = `IN ${data.countryName.toUpperCase()}`;
      } else {
        this.userLocation = "WORLDWIDE";
      }

      this.updateLocationDisplay();
    } catch (error) {
      console.log("Reverse geocoding error:", error);
      this.userLocation = "WORLDWIDE";
      this.updateLocationDisplay();
    }
  }

  async getLocationFromIP() {
    try {
      // Using a free IP geolocation service
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();

      if (data.city && data.country_code) {
        this.userLocation = `IN ${data.city.toUpperCase()}, ${data.country_code.toUpperCase()}`;
      } else if (data.country_name) {
        this.userLocation = `IN ${data.country_name.toUpperCase()}`;
      } else {
        this.userLocation = "WORLDWIDE";
      }

      this.updateLocationDisplay();
    } catch (error) {
      console.log("IP geolocation error:", error);
      this.userLocation = "WORLDWIDE";
      this.updateLocationDisplay();
    }
  }

  updateLocationDisplay() {
    const locationElement = document.getElementById("location");
    locationElement.textContent = this.userLocation || "WORLDWIDE";
  }

  updateBackgroundImage(hour) {
    const isDaytime = hour >= 5 && hour < 18;
    const imageType = isDaytime ? "daytime" : "nighttime";

    // Update all source elements and main image
    const sources = document.querySelectorAll("picture source");
    const backgroundImage = document.querySelector(".cover-image");

    sources.forEach((source) => {
      const media = source.getAttribute("media");
      if (media && media.includes("1024px")) {
        // Desktop
        source.srcset = `assets/desktop/bg-image-${imageType}.jpg`;
      } else if (media && media.includes("769px")) {
        // Tablet
        source.srcset = `assets/tablet/bg-image-${imageType}.jpg`;
      } else if (media && media.includes("768px")) {
        // Mobile
        source.srcset = `assets/mobile/bg-image-${imageType}.jpg`;
      }
    });

    if (backgroundImage) {
      backgroundImage.src = `assets/mobile/bg-image-${imageType}.jpg`;
    }
  }

  setupEventListeners() {
    const moreButton = document.getElementById("more-button");
    const refreshButton = document.querySelector(".refresh");

    moreButton.addEventListener("click", () => this.toggleDetails());
    refreshButton.addEventListener("click", () => this.refreshQuote());

    // Close details panel when clicking outside
    document.addEventListener("click", (e) => {
      if (
        this.isDetailsOpen &&
        !e.target.closest(".details-panel") &&
        !e.target.closest("#more-button")
      ) {
        this.toggleDetails();
      }
    });
  }

  updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    document.getElementById("current-time").textContent = timeString;

    // Update greeting based on time
    const hour = now.getHours();
    const greeting = this.getGreeting(hour);
    document.getElementById("greeting-text").textContent = greeting;

    // Update icon based on time of day
    this.updateIcon(hour);

    // Update background image based on time of day
    this.updateBackgroundImage(hour);

    // Update timezone display
    const timezone = now
      .toLocaleTimeString("en-GB", {
        timeZoneName: "short",
      })
      .split(" ")[1];
    document.getElementById("timezone").textContent = timezone.toLowerCase();
  }

  getGreeting(hour) {
    if (hour >= 5 && hour < 12) {
      return "good morning";
    } else if (hour >= 12 && hour < 18) {
      return "good afternoon";
    } else {
      return "good evening";
    }
  }

  updateIcon(hour) {
    const icon = document.getElementById("timer-icon");
    const isDaytime = hour >= 5 && hour < 18;

    if (isDaytime) {
      icon.innerHTML = `
        <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="1" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="21" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" stroke="currentColor" stroke-width="2"/>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" stroke="currentColor" stroke-width="2"/>
        <line x1="1" y1="12" x2="3" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="21" y1="12" x2="23" y2="12" stroke="currentColor" stroke-width="2"/>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" stroke="currentColor" stroke-width="2"/>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" stroke="currentColor" stroke-width="2"/>
      `;
    } else {
      icon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" stroke="currentColor" stroke-width="2"/>
      `;
    }
  }

  updateDetails() {
    const now = new Date();

    // Current timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    document.getElementById("detail-timezone").textContent = timezone;

    // Day of year
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

    // Day of week (1-7, Monday is 1)
    const dayOfWeek = now.getDay() === 0 ? 7 : now.getDay();

    // Week number (ISO week)
    const weekNumber = this.getWeekNumber(now);

    // Update display
    document.getElementById("detail-day-year").textContent = dayOfYear;
    document.getElementById("detail-day-week").textContent = dayOfWeek;
    document.getElementById("detail-week-number").textContent = weekNumber;
  }

  getWeekNumber(date) {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
  }

  toggleDetails() {
    const main = document.querySelector(".main");
    const detailsPanel = document.getElementById("details-panel");
    const moreButton = document.getElementById("more-button");
    const moreText = document.getElementById("more-text");

    this.isDetailsOpen = !this.isDetailsOpen;

    if (this.isDetailsOpen) {
      main.classList.add("details-open");
      detailsPanel.classList.add("open");
      moreButton.classList.add("active");
      moreText.textContent = "less";
    } else {
      main.classList.remove("details-open");
      detailsPanel.classList.remove("open");
      moreButton.classList.remove("active");
      moreText.textContent = "more";
    }
  }

  refreshQuote() {
    this.currentQuoteIndex = (this.currentQuoteIndex + 1) % this.quotes.length;
    const quote = this.quotes[this.currentQuoteIndex];

    // Add fade effect
    const quoteContent = document.getElementById("quote-content");
    const quoteAuthor = document.getElementById("quote-author");

    quoteContent.style.opacity = "0.5";
    quoteAuthor.style.opacity = "0.5";

    setTimeout(() => {
      quoteContent.textContent = `"${quote.content}"`;
      quoteAuthor.textContent = quote.author;
      quoteContent.style.opacity = "1";
      quoteAuthor.style.opacity = "1";
    }, 150);
  }
}

// Initialize the app when the page loads
document.addEventListener("DOMContentLoaded", () => {
  new ClockApp();
});
