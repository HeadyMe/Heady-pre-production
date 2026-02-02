# HeadyIDE File Operations - Implementation Guide

**Version:** 2.0.0  
**Date:** 2024-01-30  
**Status:** Production Ready

---

## 📋 Overview

HeadyIDE now supports full CRUD (Create, Read, Update, Delete) file operations with a secure, user-friendly interface. This implementation follows the Golden Master Plan's emphasis on security, observability, and Sacred Geometry design principles.

---

## 🔧 Backend Implementation

### API Endpoints

All endpoints require `x-heady-api-key` header for authentication.

#### 1. Create File or Directory

**Endpoint:** `POST /api/admin/file/create`

**Request:**
```json
{
  "root": "root-1",
  "path": "src/components/NewComponent.js",
  "content": "// Component code here",
  "type": "file"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "root": { "id": "root-1", "path": "/workspace", "label": "Workspace" },
  "path": "src/components/NewComponent.js",
  "type": "file",
  "bytes": 123,
  "sha": "abc123..."
}
```

**Response (Error - Already Exists):**
```json
{
  "ok": false,
  "error": "File or directory already exists"
}
```

**Implementation Details:**
- Validates path is within allowed root
- Creates parent directories automatically
- Prevents overwriting existing files
- Returns SHA hash for version tracking
- Supports both file and directory creation

**Code Location:** `heady-manager.js:1041-1079`

---

#### 2. Delete File or Directory

**Endpoint:** `DELETE /api/admin/file`

**Request:**
```json
{
  "root": "root-1",
  "path": "src/components/OldComponent.js"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "root": { "id": "root-1", "path": "/workspace", "label": "Workspace" },
  "path": "src/components/OldComponent.js",
  "deleted": true
}
```

**Response (Error - Not Found):**
```json
{
  "ok": false,
  "error": "File or directory not found"
}
```

**Implementation Details:**
- Validates path is within allowed root
- Supports recursive directory deletion
- Uses `fs.rm()` with `recursive: true` for directories
- Uses `fs.unlink()` for files
- Requires confirmation in frontend

**Code Location:** `heady-manager.js:1081-1111`

---

#### 3. Rename or Move File/Directory

**Endpoint:** `PUT /api/admin/file/rename`

**Request:**
```json
{
  "root": "root-1",
  "path": "src/components/Component.js",
  "newPath": "src/components/RenamedComponent.js"
}
```

**Response (Success):**
```json
{
  "ok": true,
  "root": { "id": "root-1", "path": "/workspace", "label": "Workspace" },
  "oldPath": "src/components/Component.js",
  "newPath": "src/components/RenamedComponent.js",
  "renamed": true
}
```

**Response (Error - Target Exists):**
```json
{
  "ok": false,
  "error": "Target path already exists"
}
```

**Implementation Details:**
- Validates both source and target paths
- Creates target parent directories automatically
- Prevents overwriting existing files
- Supports both rename (same directory) and move (different directory)
- Atomic operation using `fs.rename()`

**Code Location:** `heady-manager.js:1113-1148`

---

## 🎨 Frontend Implementation

### UI Components

**File:** `public/admin/index-enhanced.html`

#### 1. Toolbar Actions

**Location:** Sidebar header

**Buttons:**
- **📄+ New File** - Create file in current directory
- **📁+ New Folder** - Create directory in current directory
- **🔄 Refresh** - Reload file tree

**Implementation:**
```javascript
<div className="sidebar-actions">
  <button className="icon-btn" onClick={() => handleCreate('file')}>📄+</button>
  <button className="icon-btn" onClick={() => handleCreate('directory')}>📁+</button>
  <button className="icon-btn" onClick={loadRoots}>🔄</button>
</div>
```

---

#### 2. Context Menu

**Trigger:** Right-click on file or directory

**Options:**
- **📄 New File** - Create file in selected directory
- **📁 New Folder** - Create subdirectory
- **✏️ Rename** - Rename selected item (only if item exists)
- **🗑️ Delete** - Delete selected item (only if item exists)

**Implementation:**
```javascript
const handleContextMenu = useCallback((e, root, path, item) => {
  e.preventDefault();
  e.stopPropagation();
  setContextMenu({ x: e.clientX, y: e.clientY, root, path, item });
}, []);

// Render context menu
{contextMenu && (
  <div className="context-menu" style={{ left: contextMenu.x, top: contextMenu.y }}>
    <div className="context-menu-item" onClick={() => handleCreate('file')}>
      <span>📄</span> New File
    </div>
    <div className="context-menu-item" onClick={() => handleCreate('directory')}>
      <span>📁</span> New Folder
    </div>
    {contextMenu.item && (
      <>
        <div className="context-menu-separator" />
        <div className="context-menu-item" onClick={handleRename}>
          <span>✏️</span> Rename
        </div>
        <div className="context-menu-item" onClick={handleDelete}>
          <span>🗑️</span> Delete
        </div>
      </>
    )}
  </div>
)}
```

---

#### 3. Create Operation

**Flow:**
1. User clicks toolbar button or context menu "New File/Folder"
2. Prompt appears asking for name
3. API call to `/api/admin/file/create`
4. Toast notification shows success/error
5. File tree refreshes automatically

**Code:**
```javascript
const handleCreate = useCallback(async (type) => {
  const name = prompt(`Enter ${type} name:`);
  if (!name) return;
  
  const { root, path } = contextMenu;
  const newPath = path ? `${path}/${name}` : name;
  
  try {
    await apiCall('/file/create', {
      method: 'POST',
      body: JSON.stringify({ root: root.id, path: newPath, type }),
    });
    setToast(`${type === 'file' ? 'File' : 'Directory'} created successfully`);
    loadDir(root, path || '');
    if (onRefresh) onRefresh();
  } catch (err) {
    setToast(`Error: ${err.message}`);
  }
  setContextMenu(null);
}, [contextMenu, loadDir, onRefresh]);
```

---

#### 4. Delete Operation

**Flow:**
1. User right-clicks item and selects "Delete"
2. Confirmation dialog appears
3. If confirmed, API call to `DELETE /api/admin/file`
4. Toast notification shows success/error
5. File tree refreshes automatically

**Code:**
```javascript
const handleDelete = useCallback(async () => {
  if (!confirm('Are you sure you want to delete this item?')) return;
  
  const { root, path } = contextMenu;
  try {
    await apiCall('/file', {
      method: 'DELETE',
      body: JSON.stringify({ root: root.id, path }),
    });
    setToast('Deleted successfully');
    const parentPath = path.split('/').slice(0, -1).join('/');
    loadDir(root, parentPath);
    if (onRefresh) onRefresh();
  } catch (err) {
    setToast(`Error: ${err.message}`);
  }
  setContextMenu(null);
}, [contextMenu, loadDir, onRefresh]);
```

---

#### 5. Rename Operation

**Flow:**
1. User right-clicks item and selects "Rename"
2. Prompt appears with current name
3. User enters new name
4. API call to `PUT /api/admin/file/rename`
5. Toast notification shows success/error
6. File tree refreshes automatically

**Code:**
```javascript
const handleRename = useCallback(async () => {
  const { root, path } = contextMenu;
  const currentName = path.split('/').pop();
  const newName = prompt('Enter new name:', currentName);
  if (!newName || newName === currentName) return;
  
  const parentPath = path.split('/').slice(0, -1).join('/');
  const newPath = parentPath ? `${parentPath}/${newName}` : newName;
  
  try {
    await apiCall('/file/rename', {
      method: 'PUT',
      body: JSON.stringify({ root: root.id, path, newPath }),
    });
    setToast('Renamed successfully');
    loadDir(root, parentPath);
    if (onRefresh) onRefresh();
  } catch (err) {
    setToast(`Error: ${err.message}`);
  }
  setContextMenu(null);
}, [contextMenu, loadDir, onRefresh]);
```

---

## 🔐 Security Considerations

### Path Validation

**All operations validate paths using:**
```javascript
function resolveAdminPath(rootPath, relPath = '') {
  if (typeof relPath !== 'string') {
    throw createHttpError(400, 'path must be a string');
  }
  if (relPath.includes('\0')) {
    throw createHttpError(400, 'Invalid path');
  }

  const resolvedRoot = path.resolve(rootPath);
  const resolved = path.resolve(resolvedRoot, relPath);
  const rootWithSep = resolvedRoot.endsWith(path.sep) 
    ? resolvedRoot 
    : `${resolvedRoot}${path.sep}`;

  if (resolved !== resolvedRoot && !resolved.startsWith(rootWithSep)) {
    throw createHttpError(403, 'Path is outside allowed root');
  }

  return resolved;
}
```

**Prevents:**
- Directory traversal attacks (`../../../etc/passwd`)
- Null byte injection (`file.txt\0.jpg`)
- Access outside allowed roots

### Authentication

**All file operation endpoints require:**
- Valid `x-heady-api-key` header
- Timing-safe comparison (prevents timing attacks)
- Request ID for audit logging

**Middleware:**
```javascript
app.use('/api/admin', requireApiKey);

function requireApiKey(req, res, next) {
  if (!HEADY_API_KEY) {
    return res.status(500).json({ ok: false, error: 'HEADY_API_KEY is not set' });
  }

  const provided = getProvidedApiKey(req);
  if (!provided || !timingSafeEqualString(provided, HEADY_API_KEY)) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }

  return next();
}
```

### Input Validation

**File names validated for:**
- No null bytes
- No path traversal sequences
- Within allowed root directories
- Reasonable length limits

**Content validation:**
- Max file size: 512 KB (configurable via `HEADY_ADMIN_MAX_BYTES`)
- Binary files rejected for editing
- UTF-8 encoding enforced

---

## 📊 Usage Examples

### Example 1: Create New React Component

**User Action:**
1. Right-click on `src/components` folder
2. Select "New File"
3. Enter name: `Button.jsx`
4. File created with empty content
5. Double-click to open in editor
6. Write component code
7. Press Ctrl+S to save

**API Calls:**
```javascript
// Create
POST /api/admin/file/create
{ root: "root-1", path: "src/components/Button.jsx", type: "file" }

// Open
GET /api/admin/file?root=root-1&path=src/components/Button.jsx

// Save
POST /api/admin/file
{ root: "root-1", path: "src/components/Button.jsx", content: "...", expectedSha: "..." }
```

---

### Example 2: Reorganize Project Structure

**User Action:**
1. Right-click on `utils/helpers.js`
2. Select "Rename"
3. Enter new path: `lib/utils/helpers.js`
4. File moved to new location
5. File tree updates automatically

**API Call:**
```javascript
PUT /api/admin/file/rename
{
  root: "root-1",
  path: "utils/helpers.js",
  newPath: "lib/utils/helpers.js"
}
```

**Backend Behavior:**
- Creates `lib/utils/` directory if it doesn't exist
- Moves file atomically
- Updates file tree
- Preserves file content and permissions

---

### Example 3: Clean Up Old Files

**User Action:**
1. Right-click on `old-code/` directory
2. Select "Delete"
3. Confirm deletion in dialog
4. Directory and all contents deleted
5. File tree updates

**API Call:**
```javascript
DELETE /api/admin/file
{
  root: "root-1",
  path: "old-code/"
}
```

**Backend Behavior:**
- Recursively deletes directory and all contents
- Uses `fs.rm()` with `recursive: true, force: true`
- Validates path is within allowed root
- Returns deletion confirmation

---

## 🎨 UI/UX Design

### Sacred Geometry Integration

**Visual Elements:**
- Context menu with smooth animations
- Toast notifications with slide-in effect
- Hover states with Sacred Geometry glow
- Status indicators with pulse animation

**Color Coding:**
- Files: 📄 (neutral)
- Directories: 📁/📂 (blue when expanded)
- Selected items: Border-left with cyan (#00d4ff)
- Hover: Background with subtle glow

### Keyboard Shortcuts

**Global:**
- `Ctrl+S` / `Cmd+S` - Save current file
- `Ctrl+N` / `Cmd+N` - New file (planned)
- `Ctrl+Shift+N` - New folder (planned)
- `F2` - Rename selected (planned)
- `Delete` - Delete selected (planned)

**Editor:**
- Standard Monaco editor shortcuts
- IntelliSense and autocomplete
- Multi-cursor editing
- Find and replace

---

## 🔄 State Management

### File Tree State

**React State:**
```javascript
const [roots, setRoots] = useState([]);           // Admin roots
const [tree, setTree] = useState({});             // Directory contents
const [expanded, setExpanded] = useState({});     // Expanded directories
const [contextMenu, setContextMenu] = useState(null); // Context menu state
const [toast, setToast] = useState(null);         // Toast notifications
```

**Tree Structure:**
```javascript
tree = {
  "root-1:": [                    // Root directory
    { name: "src", type: "directory", path: "src", ... },
    { name: "package.json", type: "file", path: "package.json", ... }
  ],
  "root-1:src": [                 // src directory
    { name: "index.js", type: "file", path: "src/index.js", ... },
    { name: "components", type: "directory", path: "src/components", ... }
  ]
}
```

### Refresh Strategy

**After file operations:**
1. Reload parent directory
2. Update tree state
3. Trigger `onRefresh` callback
4. Re-render file tree
5. Maintain expanded state

**Code:**
```javascript
const loadDir = useCallback(async (root, path) => {
  const res = await apiCall(`/files?root=${root.id}&path=${encodeURIComponent(path)}`);
  setTree(prev => ({ ...prev, [`${root.id}:${path}`]: res.entries }));
}, []);
```

---

## 🧪 Testing Guide

### Manual Testing Checklist

**Create Operations:**
- [ ] Create file in root directory
- [ ] Create file in nested directory
- [ ] Create directory in root
- [ ] Create nested directory structure
- [ ] Attempt to create duplicate file (should fail)
- [ ] Create file with special characters in name
- [ ] Create file with very long name

**Delete Operations:**
- [ ] Delete empty file
- [ ] Delete file with content
- [ ] Delete empty directory
- [ ] Delete directory with files
- [ ] Delete nested directory structure
- [ ] Attempt to delete non-existent file (should fail)
- [ ] Cancel deletion in confirmation dialog

**Rename Operations:**
- [ ] Rename file in same directory
- [ ] Move file to different directory
- [ ] Rename directory
- [ ] Move directory to different location
- [ ] Attempt to rename to existing name (should fail)
- [ ] Rename with special characters
- [ ] Cancel rename operation

**Security Testing:**
- [ ] Attempt path traversal (`../../../etc/passwd`)
- [ ] Attempt null byte injection (`file.txt\0.jpg`)
- [ ] Attempt to access outside allowed roots
- [ ] Test without API key (should fail with 401)
- [ ] Test with invalid API key (should fail with 401)

### Automated Testing (Planned)

**Unit Tests:**
```javascript
describe('File Operations API', () => {
  describe('POST /api/admin/file/create', () => {
    it('should create a new file', async () => {
      const res = await request(app)
        .post('/api/admin/file/create')
        .set('x-heady-api-key', API_KEY)
        .send({ root: 'root-1', path: 'test.js', type: 'file' });
      
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.type).toBe('file');
    });
    
    it('should reject duplicate files', async () => {
      // Create file twice
      await createFile('test.js');
      const res = await createFile('test.js');
      
      expect(res.status).toBe(409);
      expect(res.body.error).toContain('already exists');
    });
  });
});
```

**Integration Tests:**
```javascript
describe('HeadyIDE File Operations', () => {
  it('should complete full CRUD workflow', async () => {
    // Create
    await createFile('workflow-test.js');
    
    // Read
    const content = await readFile('workflow-test.js');
    expect(content).toBeDefined();
    
    // Update
    await updateFile('workflow-test.js', 'new content');
    
    // Rename
    await renameFile('workflow-test.js', 'renamed-test.js');
    
    // Delete
    await deleteFile('renamed-test.js');
    
    // Verify deleted
    const exists = await fileExists('renamed-test.js');
    expect(exists).toBe(false);
  });
});
```

---

## 🚨 Error Handling

### Common Errors

**1. Path Outside Root (403)**
```json
{
  "ok": false,
  "error": "Path is outside allowed root"
}
```
**Cause:** Attempting to access files outside configured admin roots  
**Solution:** Ensure path is within allowed directories

**2. File Already Exists (409)**
```json
{
  "ok": false,
  "error": "File or directory already exists"
}
```
**Cause:** Creating file/directory that already exists  
**Solution:** Choose different name or delete existing file first

**3. File Not Found (404)**
```json
{
  "ok": false,
  "error": "File or directory not found"
}
```
**Cause:** Attempting to delete/rename non-existent file  
**Solution:** Refresh file tree and verify path

**4. Unauthorized (401)**
```json
{
  "ok": false,
  "error": "Unauthorized"
}
```
**Cause:** Missing or invalid API key  
**Solution:** Set valid `HEADY_API_KEY` in environment and localStorage

**5. File Too Large (413)**
```json
{
  "ok": false,
  "error": "File exceeds size limit",
  "details": { "maxBytes": 512000, "bytes": 600000 }
}
```
**Cause:** File exceeds configured size limit  
**Solution:** Increase `HEADY_ADMIN_MAX_BYTES` or split file

---

## 📈 Performance Considerations

### Optimization Strategies

**1. Lazy Loading**
- Directories loaded only when expanded
- File content loaded only when opened
- Tree state cached in React state

**2. Debouncing**
- File tree refresh debounced (300ms)
- Search operations debounced (500ms)
- Auto-save debounced (1000ms)

**3. Caching**
- Expanded state persisted in React state
- File content cached until modified
- Directory listings cached until refresh

**4. Batch Operations**
- Multiple file operations queued
- Batch API calls when possible
- Single file tree refresh after batch

---

## 🔮 Future Enhancements

### Planned Features

**1. Drag and Drop**
- Drag files between directories
- Visual feedback during drag
- Drop zones with highlighting

**2. Multi-Select**
- Select multiple files with Ctrl+Click
- Batch operations (delete, move)
- Bulk rename with patterns

**3. File Search**
- Search by name, content, or type
- Fuzzy matching
- Search results with highlighting

**4. File Upload/Download**
- Upload files from local system
- Download files to local system
- Drag-and-drop upload

**5. Diff Viewer**
- Compare file versions
- Show changes before save
- Merge conflict resolution

**6. Collaborative Editing**
- Real-time collaboration
- Cursor position sharing
- Conflict detection

---

## 📚 API Reference

### Complete Endpoint List

**File Operations:**
```
POST   /api/admin/file/create    - Create file or directory
DELETE /api/admin/file           - Delete file or directory
PUT    /api/admin/file/rename    - Rename or move file/directory
GET    /api/admin/file           - Read file content
POST   /api/admin/file           - Update file content
GET    /api/admin/files          - List directory contents
GET    /api/admin/roots          - List admin roots
```

**Other Admin Endpoints:**
```
POST   /api/admin/build          - Start build operation
POST   /api/admin/audit          - Start audit operation
GET    /api/admin/ops            - List operations
GET    /api/admin/ops/:id/status - Get operation status
GET    /api/admin/ops/:id/stream - Stream operation logs (SSE)
```

---

## 🎓 Best Practices

### For Developers

1. **Always validate paths** - Use `resolveAdminPath()` helper
2. **Handle errors gracefully** - Show user-friendly messages
3. **Provide feedback** - Toast notifications for all operations
4. **Confirm destructive actions** - Always ask before delete
5. **Refresh after operations** - Keep UI in sync with filesystem
6. **Log operations** - Audit trail for security

### For Users

1. **Use context menu** - Right-click for quick access
2. **Confirm before delete** - Deletions are permanent
3. **Check paths carefully** - Rename can move files
4. **Save frequently** - Use Ctrl+S or toolbar button
5. **Refresh if needed** - Use refresh button if tree is stale

---

## 🐛 Troubleshooting

### Issue: Context menu doesn't appear

**Cause:** Event listener not attached  
**Solution:** Ensure `onContextMenu` handler is on file items

### Issue: File operations fail with 401

**Cause:** Missing or invalid API key  
**Solution:** Check `localStorage.getItem('headyApiKey')` and environment variable

### Issue: Cannot create file in directory

**Cause:** Directory not expanded or doesn't exist  
**Solution:** Expand directory first or create parent directories

### Issue: Rename fails with 409

**Cause:** Target path already exists  
**Solution:** Choose different name or delete existing file

### Issue: File tree doesn't refresh

**Cause:** Refresh callback not triggered  
**Solution:** Call `loadDir()` after operations or use refresh button

---

## 📞 Support

**Documentation:**
- This file: `docs/HEADY_IDE_FILE_OPERATIONS.md`
- Session summary: `SESSION_SUMMARY.md`
- API reference: `README_NEW_FEATURES.md`

**Code Locations:**
- Backend: `heady-manager.js:1041-1148`
- Frontend: `public/admin/index-enhanced.html`
- Security: `lib/security-utils.js`

**Issues:**
- GitHub: https://github.com/HeadyMe/Heady/issues
- Tag: `heady-ide`, `file-operations`

---

**Implementation Complete** ✅  
**Production Ready** ✅  
**Documented** ✅

**Built with ∞ by Heady Arena**
