# Music Guesser Game

A web-based music guessing game where players try to identify songs from short previews and blurred covers.

## Backend Setup

1. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

2. Run the FastAPI server:
   ```
   uvicorn app.main:app --reload
   ```

3. Access the API documentation at `http://localhost:8000/docs`

## Game Rules

- Random songs (5, 10, or 25) are selected from the database
- A preview of the song will play and a blurred cover will be displayed
- Players must choose the correct song name from 6 options
- Players have 15 seconds to make their choice
- No login required - anyone can play