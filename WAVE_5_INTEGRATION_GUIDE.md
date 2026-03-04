# 🚀 Wave 5 - Integration Guide

This guide shows how to integrate all 6 new Wave 5 features into your TalkMe application.

## Features Implemented

1. ✅ **Voice Messages** - VoiceRecorder & VoicePlayer components with transcription
2. ✅ **Keyboard Shortcuts** - 9 predefined shortcuts for power users
3. ✅ **Custom Themes** - 6 preset themes with color customization
4. ✅ **@Mentions System** - User mention detection and highlighting
5. ✅ **Location Sharing** - Geolocation with map preview
6. ✅ **Custom Notification Sounds** - Upload and preview notification sounds

---

## 📋 Integration Steps

### Step 1: Update App.js

Wrap your app with CustomThemeProvider and initialize keyboard shortcuts:

```javascript
import { CustomThemeProvider } from './context/CustomThemeContext';
import { useKeyboardShortcuts, KeyboardShortcutsPanel } from './hooks/useKeyboardShortcuts';
import { useNotificationSounds } from './components/NotificationSounds';

function App() {
  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Initialize keyboard shortcuts
  const { handleInputChange: handleShortcuts } = useKeyboardShortcuts(
    (shortcut) => {
      if (shortcut.action === 'toggleShortcuts') {
        setShowShortcuts(!showShortcuts);
      }
      // Handle other shortcuts
    }
  );

  // Initialize notification sounds
  const { playSound } = useNotificationSounds();

  return (
    <CustomThemeProvider>
      <div className="app">
        {showShortcuts && <KeyboardShortcutsPanel />}
        {/* Your existing app content */}
      </div>
    </CustomThemeProvider>
  );
}
```

### Step 2: Update MessageForm.js

Add voice recorder, mentions autocomplete, and location sharing:

```javascript
import { VoiceRecorder } from './VoiceRecorder';
import { MentionAutoComplete, useMentions } from './Mentions';
import { LocationPicker, LocationPreview } from './LocationShare';

function MessageForm({ roomId, onMessageSend, users }) {
  const [message, setMessage] = useState('');
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  
  const {
    mentionSearch,
    showMentions,
    setShowMentions,
    mentionPosition,
    inputRef,
    handleInputChange,
    insertMention
  } = useMentions(users);

  const handleInputChangeWrapper = (e) => {
    setMessage(e.target.value);
    handleInputChange(e);
  };

  const handleSendMessage = () => {
    const messageData = {
      text: message,
      mentions: extractMentions(message),
      location: selectedLocation,
      roomId
    };

    onMessageSend(messageData);
    setMessage('');
    setSelectedLocation(null);
  };

  return (
    <div className="message-form">
      {selectedLocation && (
        <LocationPreview 
          location={selectedLocation}
          onRemove={() => setSelectedLocation(null)}
        />
      )}

      <div className="form-input-area">
        <textarea
          ref={inputRef}
          value={message}
          onChange={handleInputChangeWrapper}
          placeholder="Tapez votre message... (@mention, Ctrl+Enter pour envoyer)"
        />

        <MentionAutoComplete
          users={users}
          onSelect={insertMention}
          isOpen={showMentions}
          searchTerm={mentionSearch}
          position={mentionPosition}
        />
      </div>

      <div className="form-actions">
        <VoiceRecorder 
          onVoiceMessageSend={(voiceData) => {
            onMessageSend({ ...voiceData, roomId });
          }}
        />

        <button
          onClick={() => setShowLocationPicker(!showLocationPicker)}
          title="Partager ma localisation"
        >
          📍 Localisation
        </button>

        <button onClick={handleSendMessage}>
          📤 Envoyer
        </button>
      </div>

      {showLocationPicker && (
        <LocationPicker
          onLocationSelect={(location) => {
            setSelectedLocation(location);
            setShowLocationPicker(false);
          }}
          onCancel={() => setShowLocationPicker(false)}
        />
      )}
    </div>
  );
}
```

### Step 3: Update Message.js

Display mentions, locations, and voice messages:

```javascript
import { renderMentionedText } from './Mentions';
import { LocationMessage } from './LocationShare';
import { VoicePlayer } from './VoicePlayer';

function Message({ message, isAuthor }) {
  return (
    <div className={`message ${isAuthor ? 'author' : ''}`}>
      <div className="message-header">
        <span className="author-name">{message.author.username}</span>
        <span className="message-time">{formatTime(message.timestamp)}</span>
      </div>

      {/* Text content with mentions */}
      {message.text && (
        <div className="message-content">
          {renderMentionedText(message.text)}
        </div>
      )}

      {/* Voice message */}
      {message.voiceUrl && (
        <VoicePlayer
          voiceUrl={message.voiceUrl}
          transcription={message.transcription}
        />
      )}

      {/* Location message */}
      {message.location && (
        <LocationMessage
          location={message.location}
          isAuthor={isAuthor}
        />
      )}

      {/* Message actions */}
      <MessageActions message={message} />
    </div>
  );
}
```

### Step 4: Update ChatPage.js

Integrate keyboard shortcuts and settings:

```javascript
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import { NotificationSoundsSettings } from '../components/NotificationSounds';

function ChatPage() {
  const [showSettings, setShowSettings] = useState(false);

  // Setup keyboard shortcuts
  useKeyboardShortcuts((shortcut) => {
    switch (shortcut.action) {
      case 'sendMessage':
        // Send message logic
        break;
      case 'openSearch':
        // Open search logic
        break;
      case 'toggleSettings':
        setShowSettings(!showSettings);
        break;
      default:
        break;
    }
  });

  return (
    <div className="chat-page">
      <div className="chat-header">
        <h2>Chat Room</h2>
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Paramètres (Ctrl+,)"
        >
          ⚙️ Paramètres
        </button>
      </div>

      {showSettings && <NotificationSoundsSettings />}

      <div className="messages-list">
        {/* Messages */}
      </div>

      <MessageForm onMessageSend={handleSendMessage} />
    </div>
  );
}
```

### Step 5: Backend Routes (Optional but Recommended)

Add these routes to `server/routes/messages.js`:

```javascript
// Voice message upload and transcription
router.post('/voice/upload', auth, upload.single('voice'), async (req, res) => {
  try {
    const { file } = req;
    const voiceUrl = `/uploads/voice/${file.filename}`;
    
    res.json({
      voiceUrl,
      duration: req.body.duration
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/voice/transcribe', auth, async (req, res) => {
  try {
    const { voiceUrl } = req.body;
    // Use a transcription service (Google Cloud Speech, OpenAI Whisper, etc.)
    const transcription = await transcribeAudio(voiceUrl);
    
    res.json({ transcription });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Mention notifications
router.get('/users/search', auth, async (req, res) => {
  try {
    const { q } = req.query;
    const users = await User.find({
      username: { $regex: q, $options: 'i' }
    }).select('username email _id').limit(10);
    
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

---

## 🎯 Usage Examples

### Voice Messages
```javascript
// User records a voice message
<VoiceRecorder onVoiceMessageSend={(data) => {
  // data contains: { voiceUrl, duration, transcription }
}} />
```

### Keyboard Shortcuts
```javascript
// Ctrl+Enter sends message
// Shift+Enter creates new line
// Ctrl+F focuses search
// See useKeyboardShortcuts.js for all 9 shortcuts
```

### Custom Themes
```javascript
// In App.js
<CustomThemeProvider>
  <YourApp />
</CustomThemeProvider>

// Use theme in components
const { theme, updateColor } = useCustomTheme();
```

### @Mentions
```javascript
// Type @ in message form to see suggestions
// @username gets highlighted in the message
const mentions = extractMentions(text); // Get all mentions
```

### Location Sharing
```javascript
// Click "Partager ma localisation" button
<LocationPicker onLocationSelect={(location) => {
  // location has: { latitude, longitude, accuracy, address }
}} />
```

### Notification Sounds
```javascript
const { playSound } = useNotificationSounds();
playSound('notification_1'); // Play a preset sound
```

---

## 📁 File Structure

```
client/src/
├── components/
│   ├── VoiceRecorder.js
│   ├── VoiceRecorder.css
│   ├── VoicePlayer.js
│   ├── VoicePlayer.css
│   ├── Mentions.js
│   ├── Mentions.css
│   ├── LocationShare.js
│   ├── LocationShare.css
│   ├── NotificationSounds.js
│   └── NotificationSounds.css
├── hooks/
│   └── useKeyboardShortcuts.js
└── context/
    └── CustomThemeContext.js
```

---

## 🔧 Configuration

### Keyboard Shortcuts
Edit `useKeyboardShortcuts.js` to add/modify shortcuts:

```javascript
const SHORTCUTS = {
  'Ctrl+Enter': { action: 'sendMessage', name: 'Envoyer message' },
  'Shift+Enter': { action: 'newLine', name: 'Nouvelle ligne' },
  // Add more shortcuts...
};
```

### Themes
Edit `CustomThemeContext.js` to add new color schemes:

```javascript
const PRESET_THEMES = {
  myTheme: {
    primary: '#your-color',
    primaryDark: '#your-dark-color',
    // ... other colors
  }
};
```

### Notification Sounds
Add custom sounds to `NOTIFICATION_SOUNDS` array:

```javascript
export const NOTIFICATION_SOUNDS = [
  {
    id: 'my-sound',
    name: 'Mon son',
    url: 'path/to/sound.wav',
    duration: 1.0
  }
];
```

---

## 🎨 CSS Variables (Used by CustomThemeContext)

The theme system uses CSS custom properties that are automatically applied:

```css
--color-primary: #667eea;
--color-primary-dark: #764ba2;
--color-success: #11998e;
--color-warning: #f2cc8f;
--color-danger: #d62828;
--color-bg-primary: #ffffff;
--color-bg-secondary: #f9f9f9;
--color-text-primary: #333333;
--color-text-muted: #999999;
--color-border: #dddddd;
```

Use in your CSS:
```css
.my-element {
  background: var(--color-primary);
  color: var(--color-text-primary);
}
```

---

## 📱 Mobile Optimization

All components are fully responsive with optimized layouts for:
- Small screens (< 640px)
- Medium screens (640px - 1024px)
- Large screens (> 1024px)

---

## 🌙 Dark Mode

All components include `@media (prefers-color-scheme: dark)` support for automatic dark mode detection.

---

## ♿ Accessibility

- Keyboard navigation fully supported
- Screen reader friendly labels
- High contrast in all themes
- Focus indicators on interactive elements

---

## 🐛 Troubleshooting

### Voice recording not working
- Check microphone permissions in browser settings
- Ensure microphone is connected and not in use
- Check browser console for detailed error messages

### Mentions not showing
- Ensure users array is passed to useMentions hook
- Type @ character followed by username letters
- Check that users have username property

### Location not loading
- Ensure HTTPS connection (required for geolocation)
- Check location permissions in browser
- Verify internet connection for reverse geocoding

### Sounds not playing
- Check volume slider setting
- Ensure notification sounds are enabled
- Verify audio file format (WAV, MP3, OGG)

---

## 🚀 Next Steps

1. Test all features with real users
2. Add WebSocket events for real-time notifications
3. Implement backend storage for preferences
4. Add analytics tracking
5. Consider adding to-be-announced features in Wave 6

---

**All 6 Wave 5 features are now ready to be integrated into your TalkMe application!**
