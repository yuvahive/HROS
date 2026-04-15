# HROS - Platform Workflows & Architecture

Comprehensive visual guide to HROS workflows, user journeys, and system architecture using Mermaid diagrams.

---

## 📊 System Overview

```mermaid
graph TB
    subgraph "HROS Platform"
        direction TB
        UI["React UI Layer"]
        CTX["Context & Hooks"]
        UTILS["Utilities & Helpers"]
        LOCAL["Local Storage"]
    end
    
    subgraph "User Types"
        ADMIN["👤 Admin"]
        EMP["👤 Employee"]
        MGR["👤 Manager"]
    end
    
    subgraph "Features"
        CAL["📅 Calendar"]
        AUTH["🔐 Auth"]
        NOTIF["🔔 Notifications"]
        EXPORT["📥 Import/Export"]
    end
    
    ADMIN -->|Manage Users| UI
    EMP -->|Create Events| UI
    MGR -->|Team View| UI
    
    UI --> CTX
    CTX --> UTILS
    UTILS --> LOCAL
    
    UI --> CAL
    UI --> AUTH
    UI --> NOTIF
    UI --> EXPORT
    
    style ADMIN fill:#e1f5ff
    style EMP fill:#f3e5f5
    style MGR fill:#fff3e0
    style HROS fill:#f5f5f5
```

---

## 🔐 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant LoginPage
    participant AuthContext
    participant Storage
    participant Dashboard
    
    User->>LoginPage: Visit App
    LoginPage->>LoginPage: Show Login Tabs<br/>(Password | IDP)
    
    rect rgb(200, 220, 255)
    Note over User,AuthContext: Password Authentication
    User->>LoginPage: Enter Email & Password
    LoginPage->>AuthContext: login(email, password)
    AuthContext->>Storage: Find User in localStorage
    alt User Found & Password Valid
        AuthContext->>AuthContext: Create Session
        AuthContext->>User: ✅ Success
        User->>Dashboard: Redirect
    else Invalid Credentials
        AuthContext->>User: ❌ Error Message
    end
    end
    
    rect rgb(220, 255, 220)
    Note over User,AuthContext: IDP Authentication
    User->>LoginPage: Select IDP Provider
    LoginPage->>LoginPage: Show Provider Dropdown
    User->>LoginPage: Enter Email & Select Google/Microsoft/Okta
    LoginPage->>AuthContext: loginWithIDP(email, provider)
    AuthContext->>Storage: Find User by Email + Provider
    alt User + IDP Match Found
        AuthContext->>AuthContext: Create IDP Session
        AuthContext->>User: ✅ Success
        User->>Dashboard: Redirect
    else No Match
        AuthContext->>User: ❌ IDP Not Assigned
    end
    end
```

---

## 👨‍💼 Admin Workflow

```mermaid
graph TD
    A["Admin Login"] -->|Enter Credentials| B["Dashboard Access"]
    B --> C["Admin Settings"]
    
    C --> D["User Management"]
    C --> E["System Settings"]
    C --> F["Backup & Data"]
    
    D --> D1["View All Users"]
    D --> D2["Add New User"]
    D --> D3["Edit User Details"]
    D --> D4["Assign IDP Provider"]
    D --> D5["Delete User"]
    
    D1 --> D1A["Filter by Role"]
    D1A --> D1B["View Active Status"]
    
    D2 --> D2A["Enter Name & Email"]
    D2A --> D2B["Set Temporary Password"]
    D2B --> D2C["Assign Role<br/>Admin/Employee/Manager"]
    D2C --> D2D["Create User"]
    
    D4 --> D4A["Select User"]
    D4A --> D4B["Choose Provider<br/>Google/Microsoft/Okta/Auth0"]
    D4B --> D4C["Assign IDP"]
    D4C --> D4D["User Ready for IDP Login"]
    
    E --> E1["Appearance Settings"]
    E --> E2["Notification Settings"]
    
    F --> F1["Export All Data"]
    F1 --> F1A["Download JSON"]
    F --> F2["View Backup History"]
    
    style A fill:#e1f5ff
    style B fill:#b3e5fc
    style D fill:#81d4fa
    style E fill:#81d4fa
    style F fill:#81d4fa
```

---

## 👤 Employee Workflow

```mermaid
graph TD
    A["Employee Login"] -->|Password or IDP| B["Personal Dashboard"]
    
    B --> C["Calendar View"]
    C --> C1["Day View<br/>Hourly Schedule"]
    C --> C2["Week View<br/>7-Day Planning"]
    C --> C3["Month View<br/>Full Overview"]
    
    B --> D["Event Management"]
    D --> D1["Create Event"]
    D1 --> D1A["Set Title"]
    D1A --> D1B["Choose Date & Time"]
    D1B --> D1C["Select Category<br/>Meeting/Call/Task/Personal"]
    D1C --> D1D["Set Priority<br/>Low/Medium/High"]
    D1D --> D1E["Add Description"]
    D1E --> D1F["Save Event"]
    
    D --> D2["Edit Event"]
    D2 --> D2A["Click Event"]
    D2A --> D2B["Modify Details"]
    D2B --> D2C["Save Changes"]
    
    D --> D3["Complete Task"]
    D3 --> D3A["Check Off Task"]
    D3A --> D3B["Mark as Done"]
    
    D --> D4["Delete Event"]
    D4 --> D4A["Confirm Delete"]
    
    B --> E["Search & Filter"]
    E --> E1["Search by Title"]
    E --> E2["Filter by Category"]
    E --> E3["Filter by Priority"]
    
    B --> F["Notifications & Reminders"]
    F --> F1["Browser Notifications<br/>15min before"]
    F --> F2["Today's Schedule Panel"]
    F --> F3["Upcoming Events List"]
    F --> F4["Overdue Alert"]
    
    B --> G["Data Management"]
    G --> G1["Export Events<br/>as JSON"]
    G --> G2["Import Events<br/>from JSON"]
    G --> G3["Auto-Save<br/>to localStorage"]
    
    B --> H["Preferences"]
    H --> H1["Toggle Dark/Light Mode"]
    H --> H2["View Keyboard Shortcuts"]
    
    style A fill:#f3e5f5
    style B fill:#f1e5f5
    style C fill:#e8d8f5
    style D fill:#e8d8f5
    style E fill:#e8d8f5
    style F fill:#e8d8f5
    style G fill:#e8d8f5
    style H fill:#e8d8f5
```

---

## 👨‍💼 Manager Workflow

```mermaid
graph TD
    A["Manager Login"] -->|Credentials| B["Manager Dashboard"]
    
    B --> C["Team View"]
    C --> C1["View Team Members"]
    C1 --> C1A["See Team Schedule"]
    C1A --> C1B["Identify Availability"]
    
    C --> C2["Team Events"]
    C2 --> C2A["Scheduled Meetings"]
    C2B --> C2C["Team Tasks"]
    
    B --> D["Personal Calendar"]
    D --> D1["Manage Own Events"]
    D2 --> D2A["Create Meetings"]
    D2A --> D2B["Invite Team Members"]
    D2B --> D2C["Set Agenda"]
    D2C --> D2D["Save Event"]
    
    B --> E["Reports & Analytics"]
    E --> E1["Team Activity"]
    E2 --> E2A["Completion Rates"]
    E2A --> E2B["Workload Distribution"]
    E2B --> E2C["Time Tracking"]
    
    B --> F["Settings"]
    F --> F1["Personal Preferences"]
    F2 --> F2A["Team Preferences"]
    
    style A fill:#fff3e0
    style B fill:#ffe0b2
    style C fill:#ffcd80
    style D fill:#ffcd80
    style E fill:#ffcd80
    style F fill:#ffcd80
```

---

## 📅 Event Creation Flow

```mermaid
graph TD
    A["Start"] --> B{How to Create?}
    
    B -->|Quick Add| C["Press N Key"]
    C --> C1["Event Modal Opens"]
    
    B -->|Button Click| D["Click 'New Event'"]
    D --> D1["Event Modal Opens"]
    
    B -->|Calendar Click| E["Click on Date/Time"]
    E --> E1["Event Modal Opens"]
    
    C1 --> F["Fill Event Details"]
    D1 --> F
    E1 --> F
    
    F --> G["Enter Title"]
    G --> H["Select Date"]
    H --> I["Select Time"]
    I --> J["Enter Description"]
    
    J --> K["Select Category"]
    K --> K1{Category Type}
    K1 -->|Meeting| K1A["🔵 Blue"]
    K1 -->|Call| K1B["🟢 Green"]
    K1 -->|Task| K1C["🟡 Yellow"]
    K1 -->|Personal| K1D["🔴 Red"]
    
    K1A --> L["Select Priority"]
    K1B --> L
    K1C --> L
    K1D --> L
    
    L --> M{Priority Level}
    M -->|Low| M1["⬇️ Low Priority"]
    M -->|Medium| M2["➡️ Medium Priority"]
    M -->|High| M3["⬆️ High Priority"]
    
    M1 --> N["Review Event"]
    M2 --> N
    M3 --> N
    
    N --> O["Click 'Create Event'"]
    O --> P["Save to localStorage"]
    P --> Q["Close Modal"]
    Q --> R["Event Appears on Calendar"]
    R --> S["Notification Scheduled"]
    S --> T["✅ Complete"]
    
    style A fill:#90ee90
    style T fill:#90ee90
    style F fill:#87ceeb
    style K fill:#dda0dd
    style L fill:#f0e68c
```

---

## 🔄 Data Flow Architecture

```mermaid
graph LR
    subgraph "User Interface"
        direction TB
        CV["Calendar Views<br/>Day/Week/Month"]
        EM["Event Modal"]
        SB["Sidebar"]
        HDR["Header"]
    end
    
    subgraph "State Management"
        direction TB
        AC["AuthContext<br/>User & Session"]
        UE["useEvents Hook<br/>Event State"]
        DM["useDarkMode Hook<br/>Theme"]
        NS["useNotifications<br/>Alerts"]
        KS["useKeyboardShortcuts<br/>Commands"]
    end
    
    subgraph "Utilities & Data"
        direction TB
        DU["dateUtils.js<br/>Date/Time"]
        EH["eventHelpers.js<br/>Event Logic"]
        ST["storage.js<br/>localStorage"]
        SD["sampleData.js<br/>Demo Data"]
        CONST["constants.js<br/>App Constants"]
    end
    
    subgraph "Persistence"
        direction TB
        LS["🗄️ Browser<br/>localStorage"]
    end
    
    CV --> UE
    EM --> UE
    SB --> AC
    HDR --> AC
    
    UE --> DU
    UE --> EH
    AC --> ST
    DM --> ST
    NS --> UE
    KS --> UE
    
    DU --> EH
    EH --> ST
    SD --> UE
    CONST --> CV
    
    ST --> LS
    
    style "User Interface" fill:#b3e5fc
    style "State Management" fill:#c8e6c9
    style "Utilities & Data" fill:#fff9c4
    style "Persistence" fill:#ffccbc
```

---

## ⌨️ Keyboard Shortcut Flow

```mermaid
graph TD
    A["User Presses Key"] --> B{Which Key?}
    
    B -->|N| C["Create New Event"]
    B -->|D| D["Switch to Day View"]
    B -->|W| E["Switch to Week View"]
    B -->|M| F["Switch to Month View"]
    B -->|T| G["Jump to Today"]
    B -->|/| H["Focus Search Bar"]
    B -->|Other| I["No Action"]
    
    C --> C1["Open Event Modal"]
    C1 --> C2["Ready for Input"]
    
    D --> D1["Close Current View"]
    D1 --> D2["Render Day View"]
    D2 --> D3["Display Events Today"]
    
    E --> E1["Close Current View"]
    E1 --> E2["Render Week View"]
    E2 --> E3["Display Events Week"]
    
    F --> F1["Close Current View"]
    F1 --> F2["Render Month View"]
    F2 --> F3["Display Events Month"]
    
    G --> G1["Set Current Date<br/>to Today"]
    G1 --> G2["Scroll to Current Date"]
    
    H --> H1["Focus Search Input"]
    H1 --> H2["Cursor in Search Field"]
    H2 --> H3["Ready for Query"]
    
    I --> I1["Continue"]
    
    style A fill:#e1f5ff
    style C fill:#90ee90
    style D fill:#90ee90
    style E fill:#90ee90
    style F fill:#90ee90
    style G fill:#90ee90
    style H fill:#90ee90
```

---

## 📱 View Switching Flow

```mermaid
graph TB
    subgraph "Calendar Views"
        DV["📅 Day View"]
        WV["📅 Week View"]
        MV["📅 Month View"]
    end
    
    subgraph "Navigation Buttons"
        DB["Day Button"]
        WB["Week Button"]
        MB["Month Button"]
    end
    
    subgraph "Keyboard Shortcuts"
        DK["Press D"]
        WK["Press W"]
        MK["Press M"]
    end
    
    subgraph "Current State"
        CV["Current View"]
    end
    
    DB -->|Click| CV
    WB -->|Click| CV
    MB -->|Click| CV
    
    DK -->|Key Event| CV
    WK -->|Key Event| CV
    MK -->|Key Event| CV
    
    CV -->|View = 'day'| DV
    CV -->|View = 'week'| WV
    CV -->|View = 'month'| MV
    
    DV --> DV1["Shows Hourly Grid"]
    DV1 --> DV2["All Events For Today"]
    DV2 --> DV3["Time Duration Visible"]
    
    WV --> WV1["Shows 7-Day Grid"]
    WV1 --> WV2["All Events This Week"]
    WV2 --> WV3["Event Duration Visible"]
    
    MV --> MV1["Shows Full Calendar"]
    MV1 --> MV2["All Events This Month"]
    MV2 --> MV3["Category Colors Visible"]
    
    style DV fill:#e3f2fd
    style WV fill:#f3e5f5
    style MV fill:#fce4ec
    style CV fill:#fff9c4
```

---

## 💾 Data Persistence Flow

```mermaid
sequenceDiagram
    participant App as React App
    participant Storage as storage.js
    participant LocalStorage as Browser<br/>localStorage
    
    Note over App,LocalStorage: Initial Load
    App->>Storage: loadEvents()
    Storage->>LocalStorage: Get 'hrosEvents'
    LocalStorage-->>Storage: JSON String
    Storage-->>App: Parsed Events Array
    App->>App: Set State with Events
    
    Note over App,LocalStorage: Create Event
    App->>Storage: saveEvent(newEvent)
    Storage->>LocalStorage: Get Current Events
    LocalStorage-->>Storage: Existing Events
    Storage->>Storage: Add New Event to Array
    Storage->>LocalStorage: Set 'hrosEvents'
    LocalStorage-->>Storage: ✅ Saved
    Storage-->>App: Success
    
    Note over App,LocalStorage: Update Event
    App->>Storage: updateEvent(eventId, changes)
    Storage->>LocalStorage: Get Current Events
    LocalStorage-->>Storage: Existing Events
    Storage->>Storage: Find & Update Event
    Storage->>LocalStorage: Set 'hrosEvents'
    LocalStorage-->>Storage: ✅ Updated
    Storage-->>App: Success
    
    Note over App,LocalStorage: Delete Event
    App->>Storage: deleteEvent(eventId)
    Storage->>LocalStorage: Get Current Events
    LocalStorage-->>Storage: Existing Events
    Storage->>Storage: Filter Out Event
    Storage->>LocalStorage: Set 'hrosEvents'
    LocalStorage-->>Storage: ✅ Deleted
    Storage-->>App: Success
    
    Note over App,LocalStorage: Export Data
    App->>Storage: exportEvents()
    Storage->>LocalStorage: Get 'hrosEvents'
    LocalStorage-->>Storage: All Events
    Storage->>Storage: Convert to JSON String
    Storage-->>App: JSON String
    App->>App: Trigger Download
    
    Note over App,LocalStorage: Import Data
    App->>Storage: importEvents(jsonString)
    Storage->>Storage: Parse JSON
    Storage->>LocalStorage: Set 'hrosEvents'
    LocalStorage-->>Storage: ✅ Replaced
    Storage-->>App: Success
    App->>App: Reload Events to Display
```

---

## 🔔 Notification & Reminder Flow

```mermaid
graph TD
    A["App Initializes"] --> B["useNotifications Hook"]
    
    B --> C["Get All Events"]
    C --> D["Schedule Check"]
    D --> E{Check Every Minute}
    
    E --> F["Get Current Time"]
    F --> G["Loop Through Events"]
    
    G --> H{Calculate Time Until<br/>Event Start}
    
    H -->|> 15 min| I["No Action"]
    H -->|= 15 min| J["Event Reminder Ready"]
    H -->|< 15 min| K["Check if Notified"]
    
    J --> J1["Request Permission"]
    J1 --> J1A{Permission?}
    J1A -->|Granted| J2["Create Notification"]
    J1A -->|Denied| J3["Skip Notification"]
    
    J2 --> J2A["Show Title & Time"]
    J2A --> J2B["Browser Alert"]
    J2B --> J2C["Mark as Notified"]
    
    K --> K1{Already Notified?}
    K1 -->|No| J1
    K1 -->|Yes| L["Skip"]
    
    I --> M["Continue Monitoring"]
    J3 --> M
    L --> M
    
    M --> E
    
    style A fill:#c8e6c9
    style J2B fill:#ffab91
    style M fill:#c8e6c9
```

---

## 📤 Import/Export Flow

```mermaid
graph LR
    subgraph "Export Flow"
        direction TB
        EX1["Click Export Button"]
        EX2["storage.exportEvents()"]
        EX3["Get All Events<br/>from localStorage"]
        EX4["Convert to JSON"]
        EX5["Create Blob"]
        EX6["Generate Download Link"]
        EX7["User Downloads<br/>events.json"]
    end
    
    subgraph "Import Flow"
        direction TB
        IM1["Click Import Button"]
        IM2["Select JSON File"]
        IM3["Read File Content"]
        IM4["Parse JSON"]
        IM5["Validate Structure"]
        IM6["storage.importEvents()"]
        IM7["Replace localStorage<br/>with New Events"]
        IM8["Reload Display"]
    end
    
    EX1 --> EX2
    EX2 --> EX3
    EX3 --> EX4
    EX4 --> EX5
    EX5 --> EX6
    EX6 --> EX7
    
    IM1 --> IM2
    IM2 --> IM3
    IM3 --> IM4
    IM4 --> IM5
    IM5 -->|Valid| IM6
    IM5 -->|Invalid| IM8B["Error Message"]
    IM6 --> IM7
    IM7 --> IM8
    
    style EX7 fill:#c8e6c9
    style IM8 fill:#c8e6c9
```

---

## 🎨 Theme Toggle Flow

```mermaid
graph TD
    A["App Loads"] --> B["useDarkMode Hook"]
    
    B --> C["Check Saved Preference"]
    C --> D{Preference Exists?}
    
    D -->|Yes| E["Use Saved Theme"]
    D -->|No| F["Detect System Theme"]
    
    F --> G{Dark Mode?}
    G -->|Yes| H["Use Dark Theme"]
    G -->|No| I["Use Light Theme"]
    
    E --> J["Apply Theme to App"]
    H --> J
    I --> J
    
    J --> K["Save to localStorage"]
    K --> L["Render UI"]
    
    L --> M["User Clicks Theme Toggle"]
    M --> N["Switch Theme"]
    N --> O["Update State"]
    O --> P["Update localStorage"]
    P --> Q["Re-render with New Theme"]
    
    style A fill:#e1f5ff
    style Q fill:#e1f5ff
    style L fill:#f3f3f3
    style Q fill:#f3f3f3
```

---

## 📊 Search Filter Flow

```mermaid
graph TD
    A["User Presses /"] --> B["Focus Search Bar"]
    B --> C["User Types Query"]
    
    C --> D["On Input Change"]
    D --> E["Get Search Term"]
    E --> F["Get All Events"]
    
    F --> G["Filter by Title"]
    G --> H{Title Contains<br/>Search Term?}
    
    H -->|Yes| I["Add to Results"]
    H -->|No| J["Skip"]
    
    I --> K["Get Filtered Results"]
    J --> K
    
    K --> L["Filter by Category"]
    L --> M{Show Category?}
    
    M -->|Yes| N["Add to Results"]
    M -->|No| O["Skip"]
    
    N --> P["Final Results"]
    O --> P
    
    P --> Q["Filter by Priority"]
    Q --> R{Show Priority?}
    
    R -->|Yes| S["Add to Results"]
    R -->|No| T["Skip"]
    
    S --> U["Display Results"]
    T --> U
    
    U --> V["User Navigates Results<br/>Arrow Keys"]
    V --> W["User Selects Event"]
    W --> X["View Event Details"]
    
    style A fill:#fff3cd
    style U fill:#fff3cd
    style X fill:#90ee90
```

---

## 🔄 Event Edit/Delete Flow

```mermaid
graph TD
    subgraph "Edit Flow"
        E1["User Clicks Event"]
        E2["Event Details Show"]
        E2A["Modal Displays<br/>with Populated Fields"]
        E3["User Modifies Fields"]
        E4["Click 'Update Event'"]
        E5["Validate Changes"]
        E5A{Valid?}
        E6["updateEvent() Called"]
        E7["Save to localStorage"]
        E8["Reload Calendar"]
        E9["✅ Event Updated"]
    end
    
    subgraph "Delete Flow"
        D1["User Clicks Event"]
        D2["Sees Delete Option"]
        D3["Click Delete Button"]
        D4["Confirm Dialog"]
        D4A{Confirm?}
        D5["deleteEvent() Called"]
        D6["Remove from localStorage"]
        D7["Reload Calendar"]
        D8["✅ Event Deleted"]
    end
    
    E1 --> E2
    E2 --> E2A
    E2A --> E3
    E3 --> E4
    E4 --> E5
    E5 --> E5A
    E5A -->|Yes| E6
    E5A -->|No| E3
    E6 --> E7
    E7 --> E8
    E8 --> E9
    
    D1 --> D2
    D2 --> D3
    D3 --> D4
    D4 --> D4A
    D4A -->|Yes| D5
    D4A -->|No| D1
    D5 --> D6
    D6 --> D7
    D7 --> D8
    
    style E9 fill:#90ee90
    style D8 fill:#90ee90
```

---

## 🏗️ Component Architecture

```mermaid
graph TB
    subgraph "Layout"
        APP["App.jsx<br/>Route Handler"]
        APP --> LP["LoginPage"]
        APP --> PR["ProtectedRoute"]
        PR --> HROS["HROSDashboard<br/>Main Container"]
    end
    
    subgraph "Navigation & UI"
        HROS --> HDR["Header.jsx"]
        HROS --> SB["Sidebar.jsx"]
        HDR --> HDRC["Theme Toggle<br/>User Menu"]
        SB --> SBITEM["Navigation Items<br/>Board Links"]
    end
    
    subgraph "Calendar Views"
        HROS --> VIEWS["Calendar Views"]
        VIEWS --> DV["DayView.jsx"]
        VIEWS --> WV["WeekView.jsx"]
        VIEWS --> MV["MonthView.jsx"]
    end
    
    subgraph "Boards & Features"
        HROS --> BOARDS["Specialized Boards"]
        BOARDS --> AB["ActionItemsBoard"]
        BOARDS --> EB["ExitsBoard"]
        BOARDS --> OB["OnboardingBoard"]
        BOARDS --> HPB["HiringPipelineBoard"]
        BOARDS --> OOB["OneOnOneBoard"]
        BOARDS --> PB["ProjectHealthBoard"]
        BOARDS --> RB["ReportsBoard"]
        BOARDS --> TPB["TeamPulseBoard"]
    end
    
    subgraph "Modals & Forms"
        HROS --> MODALS["Modals"]
        MODALS --> EM["EventModal.jsx"]
        MODALS --> HF["HiringForm.jsx"]
        MODALS --> OOF["OneOnOneForm.jsx"]
    end
    
    subgraph "Alerts & Displays"
        HROS --> ALERTS["Alerts & Displays"]
        ALERTS --> RFA["RedFlagAlert.jsx"]
        ALERTS --> EC["EventCard.jsx"]
        ALERTS --> TS["TodaySchedule.jsx"]
    end
    
    subgraph "Admin Features"
        HROS --> ADMIN["Admin Features"]
        ADMIN --> AS["AdminSettings.jsx"]
        ADMIN --> BS["BackupSettings.jsx"]
    end
    
    subgraph "Analytics"
        HROS --> ANALYTICS["Analytics"]
        ANALYTICS --> MD["MetricsDashboard.jsx"]
        ANALYTICS --> DWB["DailyWorkBoard.jsx"]
    end
    
    style APP fill:#bbdefb
    style HROS fill:#c8e6c9
    style VIEWS fill:#fff9c4
    style BOARDS fill:#ffccbc
    style MODALS fill:#f0f4c3
    style ALERTS fill:#dcedc8
    style ADMIN fill:#ffccbc
    style ANALYTICS fill:#c8e6c9
```

---

## 📱 Mobile/Responsive Layout

```mermaid
graph TD
    subgraph "Desktop"
        D["Three-Column Layout"]
        D --> D1["Sidebar<br/>25%"]
        D --> D2["Calendar<br/>75%"]
        D1 --> D1A["Full Menu"]
        D1 --> D1B["User Settings"]
        D2 --> D2A["Full Calendar View"]
        D2 --> D2B["Event Details"]
    end
    
    subgraph "Tablet"
        T["Two-Column Layout"]
        T --> T1["Sidebar<br/>Collapsible<br/>20%"]
        T --> T2["Calendar<br/>80%"]
        T1 --> T1A["Collapse Toggle"]
        T2 --> T2A["Responsive Grid"]
    end
    
    subgraph "Mobile"
        M["Single-Column Layout"]
        M --> M1["Hamburger Menu"]
        M1 --> M1A["Slide-Out Sidebar"]
        M --> M2["Full-Screen Calendar"]
        M2 --> M2A["Stacked Events"]
        M2 --> M2B["Touch Optimized"]
    end
    
    style D fill:#c8e6c9
    style T fill:#fff9c4
    style M fill:#ffccbc
```

---

## 🔐 IDP Assignment System Flow

```mermaid
graph TD
    subgraph "Admin Side"
        A1["Admin Dashboard"]
        A2["User Management"]
        A3["Find User"]
        A4["Click 🔐 Button"]
        A5["Select IDP<br/>Google/Microsoft/Okta/Auth0"]
        A6["Click Assign"]
        A7["User Gets IDP Badge"]
    end
    
    subgraph "Employee Side"
        E1["Receive Email<br/>with Login Link"]
        E2["Open HROS App"]
        E3["Click 🔐 IDP Login Tab"]
        E4["Enter Email"]
        E5["Select Same IDP<br/>as Admin Assigned"]
        E6["System Validates<br/>Email + IDP Match"]
        E6A{Match?}
        E6A -->|Yes| E7["✅ Login Success"]
        E6A -->|No| E8["❌ Error"]
    end
    
    subgraph "System Validation"
        S1["Check User Email"]
        S1 --> S2["Check Assigned IDP"]
        S2 --> S3{Both Match?}
        S3 -->|Yes| S4["Create Session"]
        S3 -->|No| S5["Deny Access"]
        S4 --> S6["Redirect to Dashboard"]
        S5 --> S8["Show Error"]
    end
    
    A1 --> A2
    A2 --> A3
    A3 --> A4
    A4 --> A5
    A5 --> A6
    A6 --> A7
    
    E1 --> E2
    E2 --> E3
    E3 --> E4
    E4 --> E5
    E5 --> E6
    
    E6 --> S1
    
    style E7 fill:#90ee90
    style E8 fill:#ffccbc
    style S6 fill:#90ee90
```

---

## 📈 Complete User Journey (End-to-End)

```mermaid
graph LR
    A["🌐 Launch App"] --> B["📝 See Login Page"]
    B --> C{Auth Choice}
    
    C -->|Password| D["Enter Credentials"]
    C -->|IDP| E["Select Provider<br/>& Email"]
    
    D --> F["✅ Logged In"]
    E --> F
    
    F --> G["📊 Dashboard Loads"]
    G --> H["See Month View<br/>& Events"]
    
    H --> I{Next Step?}
    
    I -->|Create Event| J["Press N<br/>or Click Button"]
    J --> K["Fill Event<br/>Details"]
    K --> L["Save Event"]
    L --> M["✅ Event Added<br/>to Calendar"]
    
    I -->|View Schedule| N["Switch Views"]
    N --> N1["Week/Day/Month"]
    N1 --> O["See Events<br/>Organized"]
    
    I -->|Search Events| P["Press /"]
    P --> Q["Type Search Term"]
    Q --> R["View Filtered<br/>Results"]
    
    I -->|Manage Tasks| S["Complete Task"]
    S --> T["Check Off Done"]
    T --> U["Remove from<br/>Active List"]
    
    I -->|Adjust Settings| V["Click Menu"]
    V --> W["Toggle<br/>Dark/Light Mode"]
    
    I -->|Export Data| X["Click Export"]
    X --> Y["Download<br/>events.json"]
    
    M --> Z1["✨ All Features<br/>Work!"]
    O --> Z1
    R --> Z1
    U --> Z1
    W --> Z1
    Y --> Z1
    
    Z1 --> Z2["🎉 Productive<br/>Day Ahead!"]
    
    style A fill:#90ee90
    style Z2 fill:#90ee90
    style M fill:#fff9c4
    style O fill:#fff9c4
```

---

## 📋 Legend & Status

| Element | Meaning |
|---------|---------|
| 🔵 Blue Box | User Interface |
| 🟢 Green Box | Success/Complete |
| 🟡 Yellow Box | Processing/Current |
| 🔴 Red Box | Error/Alert |
| 🟣 Purple Box | Data/State |
| 🟠 Orange Box | Admin Functions |

---

**Last Updated**: April 2026  
**Version**: 1.0.0  
**Status**: Complete ✅
