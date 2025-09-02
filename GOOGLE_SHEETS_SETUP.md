# Google Sheets API Integration Setup

This guide will help you configure your application to connect to your "Champions League 24/25 Results" Google Spreadsheet.

## 🔧 Setup Instructions

### Step 1: Get Google API Key and Spreadsheet ID

1. **Go to Google Cloud Console:**
   - Visit [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing one

2. **Enable Google Sheets API:**
   - Go to "APIs & Services" > "Library"
   - Search for "Google Sheets API"
   - Click "Enable"

3. **Create API Key:**
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "API Key"
   - Copy the generated API key

4. **Get your Spreadsheet ID:**
   - Open your "Champions League 24/25 Results" spreadsheet
   - Copy the ID from URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`

5. **Make spreadsheet public (for read access):**
   - In your spreadsheet, click "Share"
   - Click "Change to anyone with the link"
   - Set to "Viewer" permissions

### Step 2: Configure Your Application

Open `src/app/services/sheets.service.ts` and replace these values:

```typescript
private readonly GOOGLE_API_KEY = 'YOUR_API_KEY_HERE';
private readonly SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';
```

### Step 3: Set Up Your Spreadsheet Format

Your Google Spreadsheet should have the following columns (A-G):

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Match Number | Round Number | Date | Location | Home Team | Away Team | Result |
| 1 | 1 | 16/09/2025 18:45:00 | Wembley Stadium | Real Madrid | Liverpool | 2-1 |
| 2 | 1 | 18/09/2025 20:00:00 | Allianz Arena | Bayern Munich | PSG |  |

**Column Details:**
- **A (Match Number)**: Unique match identifier (1, 2, 3, etc.)
- **B (Round Number)**: Tournament round number (1 for Group Stage, 2 for Round of 16, etc.)
- **C (Date)**: Match date and time in DD/MM/YYYY HH:MM:SS format (e.g., "16/09/2025 18:45:00")
- **D (Location)**: Stadium/venue name
- **E (Home Team)**: Team playing at home
- **F (Away Team)**: Visiting team
- **G (Result)**: Match result in "X-Y" format (e.g., "2-1") or empty if not played yet

**Important Date Format Notes:**
- The application automatically converts DD/MM/YYYY HH:MM:SS format to ISO format internally
- Supports both date-only (DD/MM/YYYY) and datetime (DD/MM/YYYY HH:MM:SS) formats
- Time component is preserved for match scheduling

## 🚀 Features

### Read Data
- ✅ Load all matches from spreadsheet
- ✅ Parse match results automatically
- ✅ Determine match status (scheduled/live/finished)
- ✅ Filter matches by round number
- ✅ Get finished and upcoming matches

### Update Data
- ✅ Update match results
- ✅ Add new matches
- ✅ Real-time data refresh

### Responsive Design
- ✅ Mobile-friendly interface
- ✅ Desktop and tablet optimized
- ✅ Touch-friendly controls

## 📱 Usage

1. **Access Champions League Data:**
   - Login to your application
   - From dashboard, click "View Matches"
   - Or navigate to `/champions-league`

2. **View Matches:**
   - See all matches in a responsive table
   - Filter by tournament round
   - Filter by match status

3. **Add New Match:**
   - Click "Add Match" button
   - Fill in team names, date, round
   - Optionally add scores and venue

4. **Update Results:**
   - Click pencil icon next to any match
   - Update home and away scores
   - Results sync to spreadsheet immediately

## 🔒 Security Notes

- API key provides read-only access to public spreadsheets
- No write permissions to other Google services
- Spreadsheet must be publicly viewable
- Consider using OAuth2 for write operations in production

## 🐛 Troubleshooting

**API not loading:**
- Check API key is correct
- Verify spreadsheet is publicly accessible
- Check browser console for errors

**No data showing:**
- Verify spreadsheet ID is correct
- Check spreadsheet has data in correct format
- Ensure first row contains headers

**Write operations failing:**
- Currently uses API key (read-only)
- For full write access, implement OAuth2 authentication

## 📊 Example Data

Here's sample data for your spreadsheet:

```
Match Number,Round Number,Date,Location,Home Team,Away Team,Result
1,1,16/09/2025 18:45:00,Wembley Stadium,Real Madrid,Liverpool,2-1
2,1,18/09/2025 20:00:00,Allianz Arena,Bayern Munich,PSG,
3,2,01/10/2025 21:00:00,Camp Nou,Barcelona,Inter Milan,1-1
4,2,02/10/2025 20:45:00,Old Trafford,Manchester United,Juventus,0-2
```

## 🔄 Next Steps

1. Set up your API credentials
2. Format your spreadsheet correctly
3. Test the connection
4. Start managing your Champions League data!

For support, check the browser console for detailed error messages.
