// app.js

let isFetching = false;
let currentQuery = '';
let scrollInterval;

function startRecognition() {
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = async (event) => {
        const spokenWord = event.results[0][0].transcript.toLowerCase();
        handleWord(spokenWord);
    };

    recognition.onspeechend = () => {
        recognition.stop();
    };

    recognition.onerror = (event) => {
        console.error(event.error);
    };
}

function handleTextInput() {
    const typedWord = document.getElementById('textInput').value.toLowerCase();
    handleWord(typedWord);
}

async function handleWord(word) {
    currentQuery = word;
    await displayInfo(word);
}

async function fetchUnsplashImages(query) {
    const response = await fetch(`https://api.unsplash.com/search/photos?query=${query}&client_id=yXgBd-dN-_o8VCOZLe_U-djGO17qBld0NJBCQWJ2YRk`);
    if (!response.ok) throw new Error(`Unsplash API error: ${response.status}`);
    return response.json();
}

async function fetchYouTubeVideos(query) {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&key=AIzaSyDX2iJEGFHlfvSF2wRcjVh4tif8CBQJcGc&type=video`);
    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    return response.json();
}

async function fetchWikipediaSummary(query) {
    const response = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error(`Wikipedia API error: ${response.status}`);
    return response.json();
}

function startScrolling(container) {
    const scrollSpeed = 30; // seconds
    container.style.left = `100%`;
    container.style.transition = 'none'; // Disable transition during repositioning
    setTimeout(() => {
        container.style.left = `-${container.scrollWidth}px`;
        container.style.transition = `left ${scrollSpeed}s linear`; // Re-enable transition for scrolling
    }, 100);

    // Clear previous interval
    if (scrollInterval) clearInterval(scrollInterval);

    scrollInterval = setInterval(() => {
        container.style.left = `100%`;
        setTimeout(() => {
            container.style.left = `-${container.scrollWidth}px`;
        }, 100);
    }, scrollSpeed * 1000); // Interval for looping scroll
}

async function displayInfo(query) {
    const outputDiv = document.getElementById('output');
    const historyDiv = document.getElementById('history');
    
    outputDiv.innerHTML = '';  // Clear any existing content
    historyDiv.innerHTML = ''; // Clear any existing history
    
    try {
        if (isFetching) return; // Prevent multiple concurrent fetches
        isFetching = true;
        
        // Fetch and display images
        const imageData = await fetchUnsplashImages(query);
        const images = imageData.results;

        if (images && images.length > 0) {
            const imageContainer = document.createElement('div');
            imageContainer.className = 'content-container';
            
            images.forEach(image => {
                const imgElement = document.createElement('img');
                imgElement.src = image.urls.small;
                imgElement.alt = query; // Add alt text for accessibility
                imgElement.style.height = '200px'; // Set a fixed height
                imageContainer.appendChild(imgElement);
            });

            outputDiv.appendChild(imageContainer);
            startScrolling(imageContainer);
        }

        // Fetch and display videos
        const videoData = await fetchYouTubeVideos(query);
        const videos = videoData.items;

        if (videos && videos.length > 0) {
            const videoContainer = document.createElement('div');
            videoContainer.className = 'content-container';
            
            videos.forEach(video => {
                const iframeElement = document.createElement('iframe');
                iframeElement.src = `https://www.youtube.com/embed/${video.id.videoId}?autoplay=1&mute=1`; // Autoplay and mute for better user experience
                iframeElement.width = 320;
                iframeElement.height = 180;
                iframeElement.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
                iframeElement.allowFullscreen = true;
                videoContainer.appendChild(iframeElement);
            });

            outputDiv.appendChild(videoContainer);
            startScrolling(videoContainer);
        }

        // Fetch and display history or summary from Wikipedia
        const historyData = await fetchWikipediaSummary(query);
        
        historyDiv.innerHTML = `<h2>${historyData.title}</h2><p>${historyData.extract}</p>`;
        
    } catch (error) {
        console.error(error);
        alert(`An error occurred: ${error.message}`);
    } finally {
        isFetching = false;
    }
}
