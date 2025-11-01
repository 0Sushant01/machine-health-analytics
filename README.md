# Machine Health Analytics

This project is a Machine Health Analytics platform with a Python backend (FastAPI) and a React frontend. It provides tools for monitoring, analyzing, and visualizing machine health data.

## Project Structure

```
machine-health-analytics/
│
├── app/                # Backend (FastAPI)
│   ├── db.py           # Database connection and models
│   ├── insert_test_data.py  # Script to insert test data
│   ├── list_data_pairs.py   # Utility to list data pairs
│   ├── main.py         # FastAPI app entry point
│   ├── models.py       # Pydantic models
│   └── routers/        # API route modules
│       ├── machines.py # Machine-related endpoints
│       └── stats.py    # Statistics endpoints
│
├── front/              # Frontend (React)
│   ├── package.json    # Frontend dependencies
│   ├── public/         # Static files
│   └── src/            # React source code
│       ├── api/        # API utility
│       ├── components/ # Reusable components
│       ├── pages/      # Page components
│       └── services/   # Service layer
│
└── requirements.txt    # Python dependencies
```

## Backend Setup (FastAPI)

1. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```
2. **Run the backend server:**
   ```powershell
   cd backend
   uvicorn app.main:app --reload
   ```
3. **Insert test data (optional):**
   ```powershell
   python insert_test_data.py
   ```

## Frontend Setup (React)

1. **Install dependencies:**
   ```powershell
   cd front
   npm install
   ```
2. **Start the development server:**
   ```powershell
   npm start
   ```
3. **Access the app:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features
- Machine list and detail views
- Time series and trend charts
- FFT and pie charts for analytics
- Filtering and summary cards
- RESTful API for machine and stats data

## Folder Details
- **app/routers/**: Contains API route definitions for machines and statistics.
- **front/src/components/**: Reusable chart and UI components.
- **front/src/pages/**: Main pages like Dashboard, Machine List, and Machine Detail.

## Customization
- Update backend models and routes in `app/` as needed.
- Add or modify frontend components in `front/src/components/`.

## License
This project is for educational and demonstration purposes.
