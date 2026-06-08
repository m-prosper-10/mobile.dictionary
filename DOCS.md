# Dictionary Mobile App — Mermaid Diagrams

This file contains all Mermaid diagrams for the Dictionary Mobile App documentation.

---

## 1. Application Architecture

```mermaid
flowchart TD
    User[User] --> MobileApp[React Native Expo App]

    MobileApp --> Navigation[React Navigation Drawer]
    MobileApp --> UIScreens[UI Screens]
    MobileApp --> State[Local App State]

    UIScreens --> SearchScreen[Dictionary Search Screen]
    UIScreens --> DrawerHistory[Drawer Search History]

    SearchScreen --> Validation[Input Validation]
    Validation -->|Valid Word| APIService[Dictionary API Service]
    Validation -->|Invalid Input| ValidationError[Show Validation Error]

    APIService --> Axios[Axios HTTP Client]
    Axios --> ExternalAPI[Free Dictionary API]

    ExternalAPI --> Axios
    Axios --> APIService

    APIService --> Parser[Response Parser]
    Parser --> WordData[Parsed Word Data]
    Parser --> AudioData[Parsed Audio URLs]

    WordData --> WordDetails[Word Details UI]
    AudioData --> AudioControls[Audio Controls]

    AudioControls --> ExpoAV[Expo AV Audio Player]

    WordDetails --> HistoryState[Search History State]
    HistoryState --> DrawerHistory
    DrawerHistory -->|Select Previous Word| APIService
```

---

## 2. Data Flow Diagram

```mermaid
flowchart TD
    Start([Start]) --> EnterWord[User Enters Word]
    EnterWord --> SubmitSearch[User Submits Search]

    SubmitSearch --> ValidateInput{Is Input Empty?}

    ValidateInput -->|Yes| ShowValidationError[Show: Please Enter a Word]
    ShowValidationError --> EnterWord

    ValidateInput -->|No| BuildURL[Build API URL Dynamically]
    BuildURL --> ShowLoading[Show Loading Indicator]

    ShowLoading --> SendRequest[Send GET Request Using Axios]
    SendRequest --> API[Free Dictionary API]

    API --> ResponseCheck{API Response}

    ResponseCheck -->|200 OK| ParseJSON[Parse JSON Response]
    ResponseCheck -->|404 Not Found| WordNotFound[Show Word Not Found Message]
    ResponseCheck -->|Network Error| NetworkError[Show Network Error Message]
    ResponseCheck -->|Malformed Data| MalformedError[Show Safe Error Message]

    ParseJSON --> ExtractData[Extract Word, Phonetics, Meanings, Definitions]
    ExtractData --> ExtractAudio[Extract Audio URLs]

    ExtractAudio --> HasAudio{Audio URL Exists?}

    HasAudio -->|Yes| NormalizeAudio[Normalize Audio URL]
    HasAudio -->|No| HideAudio[Hide Audio Controls]

    NormalizeAudio --> DisplayAudio[Display Speaker / Audio Controls]
    HideAudio --> DisplayDetails[Display Word Details]

    DisplayAudio --> DisplayDetails
    DisplayDetails --> SaveHistory[Save Word to Search History]
    SaveHistory --> End([End])

    WordNotFound --> HideLoading[Hide Loading Indicator]
    NetworkError --> HideLoading
    MalformedError --> HideLoading
    HideLoading --> Retry[Allow Retry]
```

---

## 3. Search Flow

```mermaid
flowchart TD
    A[User Types Word] --> B[Press Search Button or Submit Keyboard]
    B --> C{Input Valid?}

    C -->|No| D[Display Validation Error]
    D --> A

    C -->|Yes| E[Clear Previous Error]
    E --> F[Set Loading True]
    F --> G[Call fetchWordDefinition word]

    G --> H{Request Successful?}

    H -->|Yes| I[Parse Dictionary Response]
    I --> J[Set Word Data]
    J --> K[Add Word to History]
    K --> L[Render Word Details]

    H -->|No| M{Error Type}
    M -->|404| N[Show Word Not Found]
    M -->|Network| O[Show Network Error]
    M -->|Other| P[Show General Error]

    N --> Q[Set Loading False]
    O --> Q
    P --> Q
    L --> Q
```

---

## 4. API Integration Flow

```mermaid
sequenceDiagram
    actor User
    participant App as React Native App
    participant Service as Dictionary API Service
    participant Axios as Axios Client
    participant API as Free Dictionary API

    User->>App: Enter word and search
    App->>App: Validate input

    alt Input is empty
        App-->>User: Show validation error
    else Input is valid
        App->>Service: fetchWordDefinition(word)
        Service->>Axios: GET /entries/en/{word}
        Axios->>API: HTTP GET request

        alt Word found
            API-->>Axios: 200 OK with JSON array
            Axios-->>Service: Response data
            Service->>Service: Parse response safely
            Service-->>App: Parsed word data
            App-->>User: Display word details
        else Word not found
            API-->>Axios: 404 response
            Axios-->>Service: Error response
            Service-->>App: Word not found error
            App-->>User: Show word not found message
        else Network failure
            Axios-->>Service: Network error
            Service-->>App: Network error message
            App-->>User: Show network error
        end
    end
```

---

## 5. Audio Pronunciation Flow

```mermaid
flowchart TD
    A[Parsed Dictionary Response] --> B[Read phonetics array]
    B --> C[Extract audio fields]
    C --> D[Remove empty audio URLs]
    D --> E[Normalize URLs]

    E --> F{Any valid audio URL?}

    F -->|No| G[Hide Audio Controls]
    F -->|Yes| H[Show Speaker Icon and Controls]

    H --> I{Multiple Audio URLs?}

    I -->|Yes| J[Show Pronunciation Selector]
    I -->|No| K[Use Single Audio URL]

    J --> L[User Selects Audio Variant]
    K --> M[User Taps Play]
    L --> M

    M --> N[Load Audio with expo-av]
    N --> O{Loaded Successfully?}

    O -->|No| P[Show Audio Error]
    O -->|Yes| Q[Play Audio]

    Q --> R{User Action}
    R -->|Pause| S[Pause Audio]
    R -->|Stop| T[Stop Audio and Reset Position]
    R -->|Select New Audio| U[Unload Current Audio]

    U --> L
```

---

## 6. Audio State Machine

```mermaid
stateDiagram-v2
    [*] --> idle

    idle --> loading: User taps play
    loading --> playing: Audio loaded successfully
    loading --> error: Audio loading fails

    playing --> paused: User taps pause
    paused --> playing: User taps play again

    playing --> stopped: User taps stop
    paused --> stopped: User taps stop

    stopped --> playing: User taps play
    error --> loading: User retries play

    playing --> idle: Audio variant changes
    paused --> idle: Audio variant changes
    stopped --> idle: Audio variant changes

    idle --> [*]: Component unmounts
```

---

## 7. Drawer Navigation and Search History

```mermaid
flowchart TD
    A[Successful Word Search] --> B[Normalize Word to Lowercase]
    B --> C{Already Exists in History?}

    C -->|Yes| D[Do Not Add Duplicate]
    C -->|No| E[Add Word to Top of History]

    E --> F[Display Word in Drawer]
    D --> F

    F --> G[User Opens Drawer]
    G --> H[User Taps History Word]

    H --> I[Close Drawer]
    I --> J[Trigger New API Request]
    J --> K[Refresh Word Detail Screen]
```

---

## 8. Screen Navigation Structure

```mermaid
flowchart TD
    App[App.js] --> NavigationContainer[NavigationContainer]
    NavigationContainer --> DrawerNavigator[Drawer Navigator]

    DrawerNavigator --> MainScreen[Dictionary Screen]
    DrawerNavigator --> CustomDrawer[Custom Drawer Content]

    CustomDrawer --> HistoryList[Search History List]
    HistoryList --> SelectedWord[Selected History Word]

    SelectedWord --> MainScreen

    MainScreen --> SearchSection[Search Section]
    MainScreen --> ResultSection[Result Section]
    MainScreen --> ErrorSection[Error Section]
    MainScreen --> LoadingSection[Loading Section]

    ResultSection --> WordHeader[Word Header]
    ResultSection --> AudioControls[Audio Controls]
    ResultSection --> MeaningCards[Meaning Cards]
```

---

## 9. Component Structure

```mermaid
flowchart TD
    App[App.js] --> AppNavigator[AppNavigator]

    AppNavigator --> DictionaryScreen[DictionaryScreen]
    AppNavigator --> CustomDrawerContent[CustomDrawerContent]

    DictionaryScreen --> SearchInput[SearchInput]
    DictionaryScreen --> LoadingState[LoadingState]
    DictionaryScreen --> ErrorMessage[ErrorMessage]
    DictionaryScreen --> EmptyState[EmptyState]
    DictionaryScreen --> WordHeader[WordHeader]
    DictionaryScreen --> MeaningCard[MeaningCard]

    WordHeader --> AudioControls[AudioControls]

    AudioControls --> ExpoAV[expo-av]

    DictionaryScreen --> DictionaryAPI[dictionaryApi.js]
    DictionaryAPI --> Parser[parseDictionaryResponse.js]
    Parser --> Normalizer[normalizeAudioUrl.js]
```

---

## 10. Error Handling Flow

```mermaid
flowchart TD
    A[Search Request Starts] --> B[Validate Input]

    B --> C{Input Empty?}
    C -->|Yes| D[Show Input Validation Error]
    C -->|No| E[Send API Request]

    E --> F{Request Result}

    F -->|200 OK| G[Parse Response]
    F -->|404| H[Show Word Not Found]
    F -->|Network Error| I[Show Connectivity Error]
    F -->|Timeout or Unknown| J[Show General Failure Message]

    G --> K{Response Valid?}
    K -->|Yes| L[Render Word Details]
    K -->|No| M[Show Malformed Response Error]

    H --> N[Hide Loading]
    I --> N
    J --> N
    M --> N
    L --> N

    N --> O[Allow User to Retry]
```

---

## 11. Complete System Activity Diagram

```mermaid
flowchart TD
    Start([Start App]) --> EmptyState[Show Empty State]

    EmptyState --> UserInput[User Enters Word]
    UserInput --> SearchAction[User Presses Search]

    SearchAction --> Validate{Valid Input?}

    Validate -->|No| ValidationMsg[Show Validation Message]
    ValidationMsg --> UserInput

    Validate -->|Yes| Loading[Show Loading Indicator]
    Loading --> Fetch[Fetch Word from API]

    Fetch --> FetchResult{Fetch Result}

    FetchResult -->|Success| Parse[Parse Dictionary Data]
    FetchResult -->|404| NotFound[Show Word Not Found]
    FetchResult -->|Network Error| NetworkMsg[Show Network Message]
    FetchResult -->|Unexpected Error| GeneralError[Show General Error]

    Parse --> RenderWord[Render Word and Phonetic]
    RenderWord --> RenderMeanings[Render Meanings and Definitions]
    RenderMeanings --> RenderExamples[Render Examples Where Available]

    Parse --> AudioCheck{Audio Available?}
    AudioCheck -->|Yes| ShowAudio[Show Audio Controls]
    AudioCheck -->|No| HideAudio[Hide Audio Feature]

    ShowAudio --> AudioAction{User Audio Action}
    AudioAction -->|Play| PlayAudio[Play Pronunciation]
    AudioAction -->|Pause| PauseAudio[Pause Audio]
    AudioAction -->|Stop| StopAudio[Stop Audio]

    RenderExamples --> SaveHistory[Save Successful Search to History]
    SaveHistory --> Drawer[Update Drawer History]

    Drawer --> HistoryTap{User Taps History Item?}
    HistoryTap -->|Yes| Fetch
    HistoryTap -->|No| End([Continue Using App])

    NotFound --> Retry[Allow Retry]
    NetworkMsg --> Retry
    GeneralError --> Retry
    Retry --> UserInput
```

---

## 12. Deployment / Testing Flow With Expo

```mermaid
flowchart TD
    A[Create Expo Project] --> B[Install Dependencies]
    B --> C[Implement Screens]
    C --> D[Implement API Service]
    D --> E[Implement Audio Feature]
    E --> F[Implement Drawer History]

    F --> G[Run Expo CLI]
    G --> H[Test on Android]
    G --> I[Test on iOS]
    G --> J[Test on Expo Go]

    H --> K{Issues Found?}
    I --> K
    J --> K

    K -->|Yes| L[Fix Bugs]
    L --> G

    K -->|No| M[Final Submission]
```

---

## 13. Documentation Index Mind Map

```mermaid
mindmap
  root((Dictionary Mobile App))
    Search
      Input field
      Search button
      Validation
      Dynamic API URL
    API Integration
      Axios
      Free Dictionary API
      JSON parsing
      Loading state
    Word Details
      Word
      Phonetic
      Parts of speech
      Definitions
      Examples
      Multiple meanings
    Audio Pronunciation
      Audio URL extraction
      Multiple pronunciations
      Play
      Pause
      Stop
      Error handling
    Drawer Navigation
      Search history
      No duplicates
      Tap to search again
    Error Handling
      Empty input
      Word not found
      Network failure
      Malformed response
      Retry option
    UI UX
      Minimal design
      White background
      Flat buttons
      No gradients
      No heavy decoration
```