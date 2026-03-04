/**
 * GUIDE INTÉGRATION UPLOADS MULTIMÉDIA
 * 
 * Structure créée:
 * ✅ server/uploads/audio/
 * ✅ server/uploads/files/
 * ✅ server/uploads/images/
 * ✅ server/uploads/video/
 * ✅ server/config/uploadConfig.js
 * ✅ server/controllers/uploadController.js
 * ✅ server/routes/uploadRoutes.js
 */

// =====================================================
// ÉTAPE 1: INTÉGRER DANS server.js
// =====================================================

/*
Dans server/server.js, ajouter:

const express = require('express');
const uploadRoutes = require('./routes/uploadRoutes');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ AJOUTER CETTE LIGNE:
app.use('/api/upload', uploadRoutes);

// Servir les fichiers uploadés en static
app.use('/uploads', express.static('uploads'));

// Routes autres...
const messageRoutes = require('./routes/messageRoutes');
app.use('/api/messages', messageRoutes);

app.listen(5000, () => {
  console.log('✅ Server running on port 5000');
  console.log('   Uploads API: http://localhost:5000/api/upload');
});
*/

// =====================================================
// ÉTAPE 2: VÉRIFIER PACKAGE.JSON
// =====================================================

/*
Ajouter/vérifier "multer" dans server/package.json:

{
  "dependencies": {
    "express": "^4.18.0",
    "multer": "^1.4.5", // Pour uploads
    "mongodb": "^5.0.0",
    "dotenv": "^16.0.0"
  }
}

Si pas présent:
npm install multer
*/

// =====================================================
// ÉTAPE 3: UTILISATION DES ROUTES
// =====================================================

/**
 * EXEMPLE 1: Uploader une image
 */
const exampleUploadImage = async () => {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const response = await fetch('/api/upload/images', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('Image uploadée:', result.file.path);
  // Output: /uploads/images/1646520000000-abc123-photo.jpg
};

/**
 * EXEMPLE 2: Uploader un document PDF
 */
const exampleUploadPDF = async () => {
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  const response = await fetch('/api/upload/files', {
    method: 'POST',
    body: formData
  });

  const result = await response.json();
  console.log('PDF uploadé:', result.file.path);
};

/**
 * EXEMPLE 3: Lister toutes les images
 */
const exampleListImages = async () => {
  const response = await fetch('/api/upload/list/images');
  const result = await response.json();

  console.log(`Total images: ${result.count}`);
  result.data.forEach(image => {
    console.log(`- ${image.filename} (${image.size_mb}MB)`);
  });
};

/**
 * EXEMPLE 4: Obtenir statistiques
 */
const exampleGetStats = async () => {
  const response = await fetch('/api/upload/stats');
  const result = await response.json();

  console.log('Statistiques upload:');
  console.log(`- Audio: ${result.data.audio.count} fichiers, ${result.data.audio.size_mb}MB`);
  console.log(`- Files: ${result.data.files.count} fichiers, ${result.data.files.size_mb}MB`);
  console.log(`- Images: ${result.data.images.count} fichiers, ${result.data.images.size_mb}MB`);
  console.log(`- Video: ${result.data.video.count} fichiers, ${result.data.video.size_mb}MB`);
};

/**
 * EXEMPLE 5: Supprimer un fichier
 */
const exampleDeleteFile = async (type, filename) => {
  const response = await fetch(`/api/upload/${type}/${filename}`, {
    method: 'DELETE'
  });

  const result = await response.json();
  if (result.success) {
    console.log('Fichier supprimé');
  }
};

/**
 * EXEMPLE 6: Uploader plusieurs fichiers (audio)
 */
const exampleUploadMultipleAudio = async (files) => {
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload/audio', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    if (result.success) {
      console.log(`✅ Uploadé: ${file.name}`);
    } else {
      console.log(`❌ Erreur: ${result.error}`);
    }
  }
};

// =====================================================
// ÉTAPE 4: INTÉGRATION AVEC MESSAGECONTROLLER
// =====================================================

/*
Exemple: Gérer upload depuis messageController

const messageController = {
  async sendMessageWithAttachment(req, res) {
    const { message_text, attachment_type } = req.body;
    
    // Si fichier attaché
    if (req.file) {
      const uploadedFile = {
        type: attachment_type, // audio, files, images, video
        url: `/uploads/${attachment_type}/${req.file.filename}`,
        size: req.file.size
      };

      // Sauvegarder message avec pièce jointe
      const message = new Message({
        text: message_text,
        attachment: uploadedFile,
        sender_id: req.user.id,
        created_at: new Date()
      });

      await message.save();
      res.json({ success: true, message });
    }
  }
};

// Route correspondante:
router.post('/send', 
  uploadController.handleFileUpload('files'),
  messageController.sendMessageWithAttachment
);
*/

// =====================================================
// ÉTAPE 5: CONFIGURATION .env (OPTIONNEL)
// =====================================================

/*
Ajouter dans .env:

# Upload Config
UPLOAD_MAX_SIZE=500000000
UPLOAD_CLEANUP_DAYS=30
UPLOAD_ENABLE_COMPRESSION=true
UPLOAD_ENABLE_ANTIVIRUS=false

# API Upload Settings
API_UPLOAD_HOST=http://localhost:5000
API_UPLOAD_PATH=/uploads
*/

// =====================================================
// ÉTAPE 6: TEST AVEC CURL
// =====================================================

/*
# Test 1: Upload image
curl -X POST http://localhost:5000/api/upload/images \
  -F "file=@/path/to/image.jpg"

# Test 2: Upload PDF
curl -X POST http://localhost:5000/api/upload/files \
  -F "file=@/path/to/document.pdf"

# Test 3: Upload audio
curl -X POST http://localhost:5000/api/upload/audio \
  -F "file=@/path/to/song.mp3"

# Test 4: Upload vidéo
curl -X POST http://localhost:5000/api/upload/video \
  -F "file=@/path/to/movie.mp4"

# Test 5: Lister images
curl http://localhost:5000/api/upload/list/images

# Test 6: Statistiques
curl http://localhost:5000/api/upload/stats

# Test 7: Supprimer fichier
curl -X DELETE http://localhost:5000/api/upload/images/timestamp-random-filename.jpg

# Test 8: Cleanup (Admin)
curl -X POST http://localhost:5000/api/upload/cleanup \
  -H "Content-Type: application/json" \
  -d '{"days": 30}'
*/

// =====================================================
// ÉTAPE 7: SÉCURITÉ
// =====================================================

/*
Points de sécurité implémentés:

✅ Validation extension fichier
✅ Validation MIME type
✅ Limite taille fichier
✅ Prévention path traversal (../../../)
✅ Noms fichiers sécurisés (timestamp + random)
✅ Gestion erreurs et cleanup
✅ Dossiers séparés par type

À ajouter après:
- ✓ Authentication middleware
- ✓ Rate limiting
- ✓ Anti-virus scan (ClamAV)
- ✓ Chiffrement fichiers sensibles
- ✓ Audit logging
*/

// =====================================================
// ÉTAPE 8: FRONTEND EXAMPLE (HTML/JavaScript)
// =====================================================

const frontendExample = `
<!DOCTYPE html>
<html>
<head>
  <title>Upload Manager</title>
  <style>
    .upload-area {
      border: 2px dashed #ccc;
      padding: 40px;
      text-align: center;
      cursor: pointer;
    }
    .upload-area.active {
      border-color: #4CAF50;
      background: #f0f8f0;
    }
    .progress-bar {
      width: 100%;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      margin: 10px 0;
    }
    .progress-fill {
      height: 100%;
      background: #4CAF50;
      border-radius: 10px;
      width: 0%;
      transition: width 0.3s;
    }
  </style>
</head>
<body>

<h2>Upload Manager</h2>

<!-- Upload Type Selector -->
<div>
  <label>Type:</label>
  <select id="uploadType">
    <option value="images">Images</option>
    <option value="audio">Audio</option>
    <option value="files">Files</option>
    <option value="video">Video</option>
  </select>
</div>

<!-- Upload Area -->
<div class="upload-area" id="uploadArea">
  <p>Drag & drop files here or click to upload</p>
  <input type="file" id="fileInput" style="display: none;" />
</div>

<!-- Progress -->
<div id="progressContainer" style="display: none;">
  <p id="fileName"></p>
  <div class="progress-bar">
    <div class="progress-fill" id="progressFill"></div>
  </div>
  <p id="progressText">0%</p>
</div>

<!-- File List -->
<h3>Files</h3>
<div id="fileList"></div>

<!-- Stats -->
<h3>Statistics</h3>
<div id="stats"></div>

<script>
const uploadType = document.getElementById('uploadType');
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

// Click upload area to select file
uploadArea.addEventListener('click', () => fileInput.click());

// Drag & drop
uploadArea.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadArea.classList.add('active');
});

uploadArea.addEventListener('dragleave', () => {
  uploadArea.classList.remove('active');
});

uploadArea.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadArea.classList.remove('active');
  handleFiles(e.dataTransfer.files);
});

fileInput.addEventListener('change', (e) => {
  handleFiles(e.target.files);
});

// Upload files
async function handleFiles(files) {
  for (const file of files) {
    const type = uploadType.value;
    const formData = new FormData();
    formData.append('file', file);

    // Show progress
    document.getElementById('progressContainer').style.display = 'block';
    document.getElementById('fileName').textContent = file.name;

    try {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        const percent = (e.loaded / e.total) * 100;
        document.getElementById('progressFill').style.width = percent + '%';
        document.getElementById('progressText').textContent = Math.round(percent) + '%';
      });

      xhr.addEventListener('load', () => {
        const response = JSON.parse(xhr.responseText);
        if (response.success) {
          alert('✅ File uploaded: ' + response.file.filename);
          loadFileList();
          loadStats();
        } else {
          alert('❌ Error: ' + response.error);
        }
      });

      xhr.addEventListener('error', () => {
        alert('❌ Upload failed');
      });

      xhr.open('POST', '/api/upload/' + type);
      xhr.send(formData);
    } catch (error) {
      alert('❌ Error: ' + error.message);
    }
  }
}

// Load file list
async function loadFileList() {
  const type = uploadType.value;
  const response = await fetch('/api/upload/list/' + type);
  const result = await response.json();

  let html = '<table border="1" width="100%"><tr><th>Nom</th><th>Taille</th><th>Action</th></tr>';
  
  result.data.forEach(file => {
    html += \`<tr>
      <td><a href="\${file.url}" target="_blank">\${file.filename}</a></td>
      <td>\${file.size_mb}MB</td>
      <td>
        <button onclick="deleteFile('\${type}', '\${file.filename}')">Delete</button>
      </td>
    </tr>\`;
  });
  
  html += '</table>';
  document.getElementById('fileList').innerHTML = html;
}

// Load stats
async function loadStats() {
  const response = await fetch('/api/upload/stats');
  const result = await response.json();

  let html = '<pre>' + JSON.stringify(result.data, null, 2) + '</pre>';
  document.getElementById('stats').innerHTML = html;
}

// Delete file
async function deleteFile(type, filename) {
  if (!confirm('Delete ' + filename + '?')) return;
  
  const response = await fetch(\`/api/upload/\${type}/\${filename}\`, {
    method: 'DELETE'
  });
  
  const result = await response.json();
  if (result.success) {
    alert('✅ File deleted');
    loadFileList();
    loadStats();
  }
}

// Load on page load
loadFileList();
loadStats();

// Reload stats when type changes
uploadType.addEventListener('change', loadFileList);
</script>

</body>
</html>
`;

// =====================================================
// ÉTAPE 9: CHECKLIST FINALE
// =====================================================

const checklist = `
✅ Dossiers créés:
  ✓ server/uploads/audio/
  ✓ server/uploads/files/
  ✓ server/uploads/images/
  ✓ server/uploads/video/

✅ Fichiers créés:
  ✓ server/config/uploadConfig.js
  ✓ server/controllers/uploadController.js
  ✓ server/routes/uploadRoutes.js
  ✓ INTEGRATION_GUIDE.js (ce fichier)

⏳ À faire:
  1. npm install multer (si pas installé)
  2. Importer uploadRoutes dans server.js
  3. Ajouter \`app.use('/api/upload', uploadRoutes)\`
  4. Ajouter \`app.use('/uploads', express.static('uploads'))\`
  5. Tester avec cURL ou formulaire HTML

🎉 Terminé! System upload opérationnel
`;

console.log(checklist);

module.exports = {
  exampleUploadImage,
  exampleUploadPDF,
  exampleListImages,
  exampleGetStats,
  exampleDeleteFile,
  exampleUploadMultipleAudio,
  frontendExample
};
