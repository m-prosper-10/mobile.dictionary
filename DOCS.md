# Dictionary Mobile App - Documentation

This document reflects the current structure of the app in this repo:

- Expo Router routes under `src/app/`
- Android shell with drawer navigation
- Web shell with a responsive sidebar
- Free Dictionary API for definitions
- Datamuse API for autocomplete suggestions
- AsyncStorage-backed search history
- Expo AV pronunciation playback

---

## 1. App Structure

```mermaid
flowchart TD
    User[User] --> Shell[Expo Router Shell]

    Shell --> AndroidShell[Android Layout]
    Shell --> WebShell[Web Layout]

    AndroidShell --> DrawerLayout[Drawer Layout]
    WebShell --> SidebarLayout[Responsive Sidebar Layout]

    DrawerLayout --> DictionaryScreen[Dictionary Screen]
    SidebarLayout --> DictionaryScreen

    DictionaryScreen --> SearchInput[Search Input]
    DictionaryScreen --> Results[Word Results]
    DictionaryScreen --> Suggestions[Datamuse Suggestions]

    Results --> WordHeader[Word Header]
    WordHeader --> AudioControls[Audio Controls]
    Results --> MeaningCards[Meaning Cards]

    AndroidShell --> DrawerHistory[Drawer Search History]
    WebShell --> SidebarHistory[Sidebar Search History]

    DrawerHistory --> PersistedHistory[(AsyncStorage)]
    SidebarHistory --> PersistedHistory
```

---

## 2. Route Structure

```mermaid
flowchart TD
    Root[src/app/_layout.tsx] --> Index[src/app/index.tsx]
    RootWeb[src/app/_layout.web.tsx] --> Index

    Index --> DictionaryScreen[src/screens/dictionary-screen.tsx]
    Root --> DrawerContent[src/components/drawer-content.tsx]
    RootWeb --> SidebarWeb[src/components/sidebar.web.tsx]
```

### Current routes

- `src/app/index.tsx` - main dictionary screen
- `src/app/_layout.tsx` - Android/native shell
- `src/app/_layout.web.tsx` - web shell

The app is no longer using the older template routes as part of the main flow.

---

## 3. Data Flow

```mermaid
flowchart TD
    User[User] --> Input[Type or submit word]
    Input --> SuggestionCheck{At least 2 chars?}

    SuggestionCheck -->|Yes| Datamuse[Datamuse API]
    SuggestionCheck -->|No| HideSuggestions[Hide suggestions]

    Datamuse --> SuggestionParse[Parse suggestions]
    SuggestionParse --> SuggestionList[Render suggestion chips]

    User --> SearchSubmit[Press Search or select suggestion]
    SearchSubmit --> Validate{Input empty?}

    Validate -->|Yes| ValidationError[Show validation message]
    Validate -->|No| DictionaryAPI[Free Dictionary API]

    DictionaryAPI --> ParseResponse[Parse dictionary response]
    ParseResponse --> WordData[Word, phonetic, meanings, audio URLs]
    WordData --> RenderUI[Render results]

    ParseResponse --> HistoryUpdate[Save successful search]
    HistoryUpdate --> AsyncStorage[(AsyncStorage)]
```

---

## 4. Dictionary API Flow

The app uses the Free Dictionary API:

```txt
https://api.dictionaryapi.dev/api/v2/entries/en/{word}
```

```mermaid
sequenceDiagram
    actor User
    participant Screen as Dictionary Screen
    participant Service as dictionaryApi.ts
    participant Axios as Axios
    participant API as Free Dictionary API
    participant Parser as parseDictionaryResponse.ts

    User->>Screen: Search a word
    Screen->>Service: fetchWordDefinition(word)
    Service->>Axios: GET /entries/en/{word}
    Axios->>API: HTTP request

    alt Success
        API-->>Axios: 200 JSON response
        Axios-->>Service: Raw data
        Service->>Parser: parseDictionaryResponse(data)
        Parser-->>Service: Parsed dictionary entry
        Service-->>Screen: Word details
        Screen-->>User: Render result
    else Word not found
        API-->>Axios: 404
        Axios-->>Service: Error response
        Service-->>Screen: "Word not found"
        Screen-->>User: Show error
    else Network failure
        Axios-->>Service: Request error
        Service-->>Screen: Network error
        Screen-->>User: Show error
    end
```

### Parsed output

`parseDictionaryResponse.ts` normalizes the API response into a clean shape:

- `word`
- `phonetic`
- `phonetics`
- `audioUrls`
- `meanings`
- `origin`

Audio URLs are normalized and deduplicated before rendering.

---

## 5. Suggestions Flow

Autocomplete comes from Datamuse, not the dictionary API.

Endpoint:

```txt
GET https://api.datamuse.com/sug?s={query}&max=4
```

```mermaid
flowchart TD
    Type[User types text] --> LengthCheck{Length >= 2?}
    LengthCheck -->|No| Hide[Hide suggestions]
    LengthCheck -->|Yes| Debounce[Debounce input]
    Debounce --> Datamuse[Datamuse suggestions API]
    Datamuse --> Parse[Extract suggestion words]
    Parse --> Render[Display suggestion chips]
    Render --> Tap[User taps suggestion]
    Tap --> Search[Normal dictionary search flow]
```

### Suggestion behavior

- Suggestions appear only when the query has at least 2 characters.
- Suggestion requests are debounced.
- Failed suggestion requests are ignored silently.
- Selecting a suggestion hides the list and runs the normal dictionary search.

---

## 6. Audio Playback Flow

```mermaid
flowchart TD
    ParsedData[Parsed dictionary entry] --> Phonetics[Phonetics array]
    Phonetics --> Extract[Extract audio URLs]
    Extract --> Normalize[Normalize protocol-relative URLs]
    Normalize --> Deduplicate[Deduplicate URLs]

    Deduplicate --> HasAudio{Any audio URLs?}
    HasAudio -->|No| HideControls[Hide audio controls]
    HasAudio -->|Yes| ShowControls[Show controls]

    ShowControls --> SelectVariant{Multiple URLs?}
    SelectVariant -->|Yes| VariantPicker[Show pronunciation selector]
    SelectVariant -->|No| SingleAudio[Use single URL]

    VariantPicker --> Play[Play]
    SingleAudio --> Play
    Play --> ExpoAV[expo-av Sound]
    ExpoAV --> PlaybackStatus[Playback status updates]

    PlaybackStatus --> Playing[playing]
    PlaybackStatus --> Paused[paused]
    PlaybackStatus --> Stopped[stopped]
    PlaybackStatus --> Error[error]
```

### Audio state model

```txt
idle
loading
playing
paused
stopped
error
```

### Important rules

- Audio is only loaded when the user plays it.
- The currently selected pronunciation can change without breaking playback.
- Stale audio loads are ignored if the user switches variants.
- Audio errors do not crash the screen.

---

## 7. Search History Flow

Search history is stored in AsyncStorage and exposed through `DictionaryProvider`.

```mermaid
flowchart TD
    Search[Successful search] --> Normalize[Normalize to lowercase]
    Normalize --> Unique{Already in history?}
    Unique -->|Yes| MoveTop[Move item to top]
    Unique -->|No| AddTop[Add item to top]
    MoveTop --> Persist[Persist to AsyncStorage]
    AddTop --> Persist
    Persist --> Drawer[Drawer / sidebar history]

    Drawer --> Tap[Tap history item]
    Tap --> SearchAgain[Search again]
```

### History behavior

- Only successful searches are stored.
- History is unique and latest-first.
- History survives app restarts.
- Tapping a history item triggers a fresh dictionary lookup.

---

## 8. Shared State

`DictionaryProvider` stores:

- `data`
- `loading`
- `error`
- `history`
- `committedWord`

It also:

- fetches dictionary results
- updates search history
- hydrates persisted history from AsyncStorage

---

## 9. Screen Composition

```mermaid
flowchart TD
    DictionaryScreen --> Header[Title + subtitle]
    DictionaryScreen --> SearchInput[SearchInput]
    DictionaryScreen --> SuggestionChips[Datamuse suggestions]
    DictionaryScreen --> LoadingState[LoadingState]
    DictionaryScreen --> ErrorMessage[ErrorMessage]
    DictionaryScreen --> EmptyState[EmptyState]
    DictionaryScreen --> WordHeader[WordHeader]
    DictionaryScreen --> MeaningCard[MeaningCard]

    WordHeader --> AudioControls[AudioControls]
```

### Main UI parts

- `SearchInput`
- `WordHeader`
- `AudioControls`
- `MeaningCard`
- `ErrorMessage`
- `EmptyState`
- `LoadingState`

---

## 10. Android and Web Shells

### Android

- Uses `src/app/_layout.tsx`
- Uses the custom drawer shell
- Best tested with Expo Go or a dev build

### Web

- Uses `src/app/_layout.web.tsx`
- Uses a responsive sidebar
- Small screens open an overlay drawer
- Desktop keeps the collapsible sidebar behavior

```mermaid
flowchart TD
    WebLayout[src/app/_layout.web.tsx] --> Desktop[Desktop sidebar]
    WebLayout --> Mobile[Mobile overlay drawer]
    Mobile --> History[Search history]
    Desktop --> History
```

---

## 11. Error Handling

```mermaid
flowchart TD
    Start[Search request] --> Validate[Validate input]
    Validate -->|Empty| InputError[Show input error]
    Validate -->|Valid| Request[Fetch dictionary data]
    Request --> Response{Response}

    Response -->|200| Render[Render results]
    Response -->|404| NotFound[Show word not found]
    Response -->|Network| NetworkError[Show network error]
    Response -->|Unexpected| GeneralError[Show general error]

    Render --> Done[Finish]
    NotFound --> Done
    NetworkError --> Done
    GeneralError --> Done
```

### Error handling rules

- Empty input is rejected.
- Dictionary 404s are shown as a friendly error.
- Network failures are shown as a friendly error.
- Datamuse failures are silent and never block dictionary search.
- Audio failures are shown in the audio component only.

---

## 12. Current File Map

```txt
src/
├── api/
│   ├── datamuseApi.ts
│   └── dictionaryApi.ts
├── app/
│   ├── _layout.tsx
│   ├── _layout.web.tsx
│   └── index.tsx
├── components/
│   ├── audio-controls.tsx
│   ├── dictionary-provider.tsx
│   ├── drawer-content.tsx
│   ├── drawer-layout.tsx
│   ├── empty-state.tsx
│   ├── error-message.tsx
│   ├── loading-state.tsx
│   ├── meaning-card.tsx
│   ├── search-input.tsx
│   ├── sidebar.web.tsx
│   └── word-header.tsx
├── screens/
│   └── dictionary-screen.tsx
└── utils/
    ├── normalizeAudioUrl.ts
    ├── parseDictionaryResponse.ts
    └── use-system-background-color.ts
```

---

## 13. Testing and Run Targets

Current project scripts:

```txt
npm start
npm run android
npm run web
npm run build
```

Recommended flow:

```mermaid
flowchart TD
    Install[npm install] --> Start[npm start]
    Start --> Android[Android Expo Go / dev build]
    Start --> Web[npm run web]
    Web --> Check[Responsive sidebar + suggestions]
    Android --> Check
```

---

## 14. Summary

The app is now a dictionary experience centered around:

- dictionary lookup
- suggestion autocomplete
- audio pronunciation playback
- persisted history
- Android drawer navigation
- responsive web sidebar navigation

This document should be updated whenever the route structure, state model, or external APIs change.
